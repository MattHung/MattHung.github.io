/**
 * Created by Matt Hung on 2016/4/3.
 */

pokerPeer = CocosWidget.SocketPeer.extend({
    _gameID:null,

    OnResponseLogin:null,
    OnResponseEnterGame:null,
    OnReceiveSystemMessage:null,

    AccountSave:{},

    getPlayerID:function(){
        return this.AccountSave.Save.RoleID;
    },

    getConnected:function(){
        if(!this.ws)
            return false;

        return this.ws.readyState == WebSocket.OPEN;
    },

    requestLogin:function(gameID, sessionID, platForm, subsidiaryID, subsidiaryAccount, subsidiaryUserID, browser, osType){
        this._gameID = gameID;
        //0:基本功能: Option(1)
        //    1:要求登入: GameID(e) +SessionID(s) + Platform(1) + subsidiaryID(4) + subsidiaryAccount(s) + subsidiaryRoleID(4) + Browser(s) + OSType(s)

        var msg = new MemoryStream();
        ProtocolBuilder.Encode_FromByte(msg, 0);
        ProtocolBuilder.Encode_FromByte(msg, 1);

        ProtocolBuilder.Encode_FromEnum(msg, gameID);
        ProtocolBuilder.Encode_FromString(msg, sessionID);
        ProtocolBuilder.Encode_FromByte(msg, platForm);

        ProtocolBuilder.Encode_FromInt(msg, subsidiaryID);
        ProtocolBuilder.Encode_FromString(msg, subsidiaryAccount);
        ProtocolBuilder.Encode_FromInt(msg, subsidiaryUserID);
        ProtocolBuilder.Encode_FromString(msg, browser);
        ProtocolBuilder.Encode_FromString(msg, osType);

        pokerPeer.getInstance().sendBinary(msg);

        this.ws.onmessage =function(evt){
            var msg = new MemoryStream();
            msg.initialBuffer(new Uint8Array(evt.data));

            var header = ProtocolBuilder.Decode_ToByte(msg);

            if(header==0){
                this.systemReceive(msg);
                return;
            }

            var protocolNO = ProtocolBuilder.Decode_ToByte(msg);

            var fun_name= String.format("_recv_{0}", protocolNO);

            InvokeFunction(fun_name, this, msg);
        }.bind(this);
    },

    _sendMessageInternal:function(headNO, msg)
    {
        if (this.ws == null)
            return;

        if(!this.getConnected())
            return;
        var response = new MemoryStream();
        ProtocolBuilder.Encode_FromByte(response, headNO);
        response.concatenate(msg.getData());
        this.sendBinary(response);
    },

    sendMessage:function(protocolNO, msg)
    {
        if (this.ws == null)
            return;

        var  response = new MemoryStream();
        ProtocolBuilder.Encode_FromByte(response, protocolNO);
        response.concatenate(msg.getData());
        this._sendMessageInternal(this._gameID, response);
    },

    systemReceive:function(msg){//0:基本功能
        var Response = new MemoryStream();
        var res = 0;

        var kind = ProtocolBuilder.Decode_ToByte(msg);
        var subKind=0;
        switch (kind) {
            case 0://0:選擇對象伺服器結果(Controller->Client): 是否成功(bool)
                break;

            case 1://1:登入結果:  登入結果(1)
                //登入結果: 1 登入成功 + 玩家資料結構
                //            2 為封鎖帳號
                //            3 帳號不存在
                //            4 連線識別ID錯誤
                //            5 此帳號正在登入中 請稍後再試

                res = ProtocolBuilder.Decode_ToByte(msg);

                if (res == 1)
                {
                    var JsonStr = ProtocolBuilder.Decode_ToString(msg);

                    this.AccountSave = JSON.parse(JsonStr);

                    //0:基本功能: Option(1)
                    //   2:選擇遊戲: GameID(e)
                    ProtocolBuilder.Encode_FromByte(Response, 2);
                    ProtocolBuilder.Encode_FromEnum(Response, this._gameID);
                    this._sendMessageInternal(0, Response);
                }

                if(this.OnResponseLogin)
                    this.OnResponseLogin(res, this.AccountSave);

                break;

            case 2://2:選擇遊戲結果:  選擇結果(1)
                res = ProtocolBuilder.Decode_ToByte(msg);
                switch (res)
                {
                    case 1://1:進入遊戲成功
                        break;

                    case 2://2:無此遊戲
                        break;
                }

                if(this.OnResponseEnterGame)
                    this.OnResponseEnterGame(res);
                break;

            case 255://255:發送系統訊息: Message(s)
                //255:系統相關
                //    1:發送系統訊息: Message(s)
                //    2:系統資訊: 線上人數(4) + 系統時間(SimpleDataTime)

                subKind = ProtocolBuilder.Decode_ToByte(msg);

                switch (subKind){
                    case 1:
                        var systemMsg = ProtocolBuilder.Decode_ToString(msg);

                        if(this.OnReceiveSystemMessage)
                            this.OnReceiveSystemMessage(systemMsg);
                        break;
                    case 2:
                        var ccu = ProtocolBuilder.Decode_ToInt(msg);
                        break;
                }
                break;
            default :
                break;
        }

    },

    _recv_0:function(Message){
        //  0 : 傳送牌桌資訊 : 桌次種類(1)  + Count(u2) +{桌次編號(4)+TableInfo]*Count}
        //TableInfo:
        //     一般桌  皇家德州撲克:桌內人數(1)
        //     單桌賽: 此底台入場費(4) + 總人數(4)

        var tableType = ProtocolBuilder.Decode_ToByte(Message);
        var count =ProtocolBuilder.Decode_ToUShort(Message);

        var tableInfo = [];
        for(var i=0; i<count; i++){
            var element ={};
            element.tableID = ProtocolBuilder.Decode_ToInt(Message);

            //一般桌  皇家德州撲克:桌內人數(1)
            element.playerCount = ProtocolBuilder.Decode_ToByte(Message);
            tableInfo.push(element);
        }

        PokerManager.getInstance().onGotTableList(tableInfo);
    },

    _recv_1:function(Message){
        //1 : 入桌結果(1) :
        //   1:成功入桌   + 桌次ID(4)
        //   2:已在牌桌內 無法入桌
        //   3:桌次編號錯誤
        //   4:座位已滿

        var Response = ProtocolBuilder.Decode_ToByte(Message);

        var tableID = 0;
        if (Response == 1) {
            tableID = ProtocolBuilder.Decode_ToInt(Message);
            PokerManager.getInstance().enterTable(tableID);
            return;
        }


        var err = {2:"已在牌桌內,無法入桌", 3:"桌次編號錯誤", 4:"座位已滿"};

        PokerManager.getInstance().showMessage(err[Response]);
    },

    _recv_2:function(Message){
        //2 : 入座結果(1) : 入座結果(1) +座位ID(1)
        //   1:成功入座
        //   2:尚未入桌
        //   3:座位編號錯誤
        //   4:座位已有玩家
        var Response = ProtocolBuilder.Decode_ToByte(Message);
        var SeatID = ProtocolBuilder.Decode_ToByte(Message);

        if(Response==1){
            PokerManager.getInstance().onTakeSeat(SeatID);
            return;
        }

        var err = {2:"尚未入桌", 3:"座位編號錯誤", 4:"座位已有玩家", 5:"賽程進行中 無法入座", 6:"同IP無法同桌", 7:"伺服器即將維護, 無法入座"};

        PokerManager.getInstance().showMessage(err[Response]);
    },
    _recv_3:function(Message){
        //3 : 兌換籌碼結果(1):
        //    1:兌換成功  + 座位編號(1) +兌換數量(4)
        //    2:金額不足
        //    3:尚未入座
        //    4.非可買入時間
        //    5.已兌換籌碼

        var Response = ProtocolBuilder.Decode_ToByte(Message);

        var SeatID = 0;
        var Value = 0;
        if (Response == 1)
        {
            SeatID = ProtocolBuilder.Decode_ToByte(Message);
            Value = ProtocolBuilder.Decode_ToInt(Message);
            PokerManager.getInstance().doAction(SeatID, null, Value, null, null);
            return;
        }

        var err = {2:"金額不足", 3:"尚未入座", 4:"非可買入時間", 5:"已兌換籌碼"};

        PokerManager.getInstance().showMessage(err[Response]);
    },
    _recv_4:function(Message){
        //4 : 下注結果(1) :
        //    1:下注成功
        //    2:下注失敗
    },
    _recv_5:function(Message){
        //5 : 玩家入桌 : Count(1) + { (座位編號(1) + 玩家ID(4)) * Count}
        var count = ProtocolBuilder.Decode_ToByte(Message);

        for(var i =0; i<count; i++){
            var seatID = ProtocolBuilder.Decode_ToByte(Message);
            var playerID = ProtocolBuilder.Decode_ToInt(Message);
            PokerManager.getInstance().addPlayer(seatID, playerID);
        }
    },
    _recv_6:function(Message){
        //6 : 玩家離桌 :座位編號(1) + 玩家ID(4))
        var SeatID = ProtocolBuilder.Decode_ToByte(Message);
        var RoleID = ProtocolBuilder.Decode_ToInt(Message);
        PokerManager.getInstance().leaveTable(SeatID, RoleID);
    },
    _recv_7:function(Message){
        //7 : 回合開始 : 桌次種類(1) + 桌次編號(4)
        var TableType = ProtocolBuilder.Decode_ToByte(Message);
        var TableNo = ProtocolBuilder.Decode_ToInt(Message);
    },
    _recv_8:function(Message){
        //8 : 盲注位置 : 莊家位置(1) + 大盲位置(1) +小盲位置(1)
        var BankSeatID = ProtocolBuilder.Decode_ToByte(Message);
        var BigBlind = ProtocolBuilder.Decode_ToByte(Message);
        var SmallBlind = ProtocolBuilder.Decode_ToByte(Message);

        PokerManager.getInstance().setBlind(BankSeatID, BigBlind, SmallBlind);
    },
    _recv_9:function(Message){
        //9 : 玩家下注 : 玩家ID(4) + 玩家位置(1) + 下注種類(1) + 下注數量(4)
        //9 : 玩家下注 : 玩家ID(4) + 玩家位置(1) + 下注種類(1) + 下注數量(4) + 最高下注額(4)
        //                         下注種類(1)
        //                          Fold=1,
        //                          Allin=2,
        //                          Check=3,
        //                          Raise=4,
        //                          CatchBlind=5,
        //                          FoldTimeout=6
        var RoleID = ProtocolBuilder.Decode_ToInt(Message);
        var SeatID = ProtocolBuilder.Decode_ToByte(Message);
        var Action = ProtocolBuilder.Decode_ToByte(Message);
        var Value = ProtocolBuilder.Decode_ToInt(Message);
        var highestBet = ProtocolBuilder.Decode_ToInt(Message);

        PokerManager.getInstance().doAction(SeatID, Action, null, Value==0?null:Value);
    },
    _recv_10:function(Message){
        //10 :發放底牌 : Count(4)+ 玩家位置(1) +第一張底牌(1) + 第二章底牌(1)
        //                   撲克牌編號 0: 不可視
        //                              1~13 :黑桃
        //                              14~26:紅心
        //                              27~39:方塊
        //                              40~52:梅花
        var Count = ProtocolBuilder.Decode_ToInt(Message);

        for (var i = 1; i <= Count; i++)
        {
            var SeatID = ProtocolBuilder.Decode_ToByte(Message);
            var Card1Code = ProtocolBuilder.Decode_ToByte(Message);
            var Card2Code = ProtocolBuilder.Decode_ToByte(Message);

            PokerManager.getInstance().setPlayer(SeatID, null, null, null, [Card1Code, Card2Code]);
        }
    },
    _recv_11:function(Message){
        //11 : 公牌前三張: 公牌1(1) + 公牌2(1) + 公牌3(1)
        var Card1Code = ProtocolBuilder.Decode_ToByte(Message);
        var Card2Code = ProtocolBuilder.Decode_ToByte(Message);
        var Card3Code = ProtocolBuilder.Decode_ToByte(Message);

        PokerManager.getInstance().addPublicCard(1, Card1Code);
        PokerManager.getInstance().addPublicCard(2, Card2Code);
        PokerManager.getInstance().addPublicCard(3, Card3Code);
    },
    _recv_12:function(Message){
        //12: 下注倒數 : 玩家ID(4) + 玩家位置(1) + 倒數毫秒(d8)
        var RoleID = ProtocolBuilder.Decode_ToInt(Message);
        var SeatID = ProtocolBuilder.Decode_ToByte(Message);
        var RemainTick = ProtocolBuilder.Decode_ToDouble(Message);

        PokerManager.getInstance().setCountDown(RoleID, SeatID, RemainTick);
    },
    _recv_13:function(Message){
        //13 : 發放剩餘公牌: 第幾張(1) + 公牌(1)
        var order = ProtocolBuilder.Decode_ToByte(Message);
        var CardCode = ProtocolBuilder.Decode_ToByte(Message);

        PokerManager.getInstance().addPublicCard(order, CardCode);
    },
    _recv_14:function(Message){
        //14 : 名次資訊 : Count(2) + {[玩家位置(1) + 名次(1)] * Count }
    },
    _recv_15:function(Message){
        //15 : 贏得籌碼 : Count(2) + {[獎池邊號(1)+玩家位置(1) + 獲得籌碼(4)] * Count }

        var Count = ProtocolBuilder.Decode_ToUShort(Message);

        for (var i = 1; i <= Count; i++)
        {
            var PotNum = ProtocolBuilder.Decode_ToByte(Message);
            var SeatID = ProtocolBuilder.Decode_ToByte(Message);
            var Bonus = ProtocolBuilder.Decode_ToInt(Message);
            PokerManager.getInstance().giveWinnings(PotNum, SeatID, Bonus);
        }

        PokerManager.getInstance().roundOver();
    },
    _recv_16:function(Message){
        //16 : 玩家離座 : 座位編號(1) + 玩家ID(4))
        var SeatID = ProtocolBuilder.Decode_ToByte(Message);
        var RoleID = ProtocolBuilder.Decode_ToInt(Message);

        PokerManager.getInstance().removePlayer(SeatID, RoleID);
    },
    _recv_17:function(Message){
        //17 : 玩家暫停延長下注秒數 : 延長毫秒數(d8)
    },
    _recv_18:function(Message){
        //18:  新進玩家桌內資訊 : 公牌數     Count(1)   +  (公牌(1)* Count)
        //              獎池資訊:  Count(1)	+  {獎池金額(4)*Count}
        //              玩家資訊   Count(1)   + [(座位編號(1)+ 玩家ID(4)+ 下注種類(1)+ 身上籌碼(4)+賭注(4) + {HandCardCount(1) +[底牌(1)* {HandCardCount] } ) * Count(1)]
        var count = 0;
        var i =0;
        var cardNum = 0;

        count = ProtocolBuilder.Decode_ToByte(Message);
        for(i =0; i<count; i++){
            cardNum = ProtocolBuilder.Decode_ToByte(Message);
            PokerManager.getInstance().addPublicCard(i+1, cardNum);
        }

        count = ProtocolBuilder.Decode_ToByte(Message);
        for(i =0; i<count; i++) {
            poolValue = ProtocolBuilder.Decode_ToInt(Message);
            PokerManager.getInstance().setPool(i+1, poolValue);
        }

        count = ProtocolBuilder.Decode_ToByte(Message);
        for(i =0; i<count; i++){
            var seatID = ProtocolBuilder.Decode_ToByte(Message);
            var playerID = ProtocolBuilder.Decode_ToInt(Message);
            var action = ProtocolBuilder.Decode_ToByte(Message);
            var chips = ProtocolBuilder.Decode_ToInt(Message);
            var bet = ProtocolBuilder.Decode_ToInt(Message);

            var handCardCount =ProtocolBuilder.Decode_ToByte(Message);

            var handCards=[];
            for(var handCardIndex= 0; handCardIndex<handCardCount; handCardIndex++){
                cardNum = ProtocolBuilder.Decode_ToByte(Message);
                handCards.push(cardNum);
            }

            PokerManager.getInstance().addPlayer(seatID, playerID);
            PokerManager.getInstance().setPlayer(seatID, action, chips, bet==0?null:bet, handCards);
        }
    },
    _recv_19:function(Message){
        //19 : 閒置狀態切換:  座位編號(1)+閒置狀態(1)
        //      閒置狀態: true  進入閒置狀態
        //                false 解除閒置狀態
        var SeatID = ProtocolBuilder.Decode_ToByte(Message);
        var IsIdle = ProtocolBuilder.Decode_ToBool(Message);

    },
    _recv_20:function(Message){
        //20 : 斷線保留狀態切換: 座位編號(1)+保留狀態(1)
        //                保留狀態: true  進入保留狀態
        //                           false 解除保留狀態

    },
    _recv_24:function(Message){
        //24: 遊戲局號: 局號(4)
        var RoundSN = ProtocolBuilder.Decode_ToInt(Message);

    },
    _recv_25:function(Message){
        //25 : 獎池資訊:  Count(1)	+  {獎池金額(4)*Count}

        var count = ProtocolBuilder.Decode_ToByte(Message);

        PokerManager.getInstance().clearPool();
        for(var i=0; i<count; i++)
            PokerManager.getInstance().setPool(i+1, ProtocolBuilder.Decode_ToInt(Message));
    },
    _recv_26:function(Message){
        //26: 籌碼兌換中: 兌換中(b)

    },
    _recv_27:function(Message){
        //27:設定盲注金額: 大盲金額(4) + 小盲金額(4)
        var BigValue = ProtocolBuilder.Decode_ToInt(Message);
        var SmallValue = ProtocolBuilder.Decode_ToInt(Message);

        PokerManager.getInstance().setBlind(null, null, null, BigValue, SmallValue);
    },
    _recv_28:function(Message){
        //28:牌局結束現牌: Count(1) + {[玩家位置(1) +第一張底牌(1) + 第二章底牌(1)] * Count(1)}
        var count = ProtocolBuilder.Decode_ToByte(Message);

        for(var i=0; i<count; i++) {
            var seatID= ProtocolBuilder.Decode_ToByte(Message);
            var card1= ProtocolBuilder.Decode_ToByte(Message);
            var card2= ProtocolBuilder.Decode_ToByte(Message);

            PokerManager.getInstance().setPlayer(seatID, null, null, null, [card1, card2]);
        }

    },
    _recv_29:function(Message){
        //29:目前回合數: 回合數(4)
    },
    _recv_50:function(Message){
        //50:單桌賽發布名次資訊: 名次(1) + 獎金(4)
    },
    _recv_199:function(Message){
        //199:玩家表情動作: 座位編號(1) + 表情動作(1)
    },
    _recv_201:function(Message){
        //201:玩家自身存檔資料: 存檔資料<SaveData>
        //var save;
        //save = ProtocolBuilder.Decode_ToValueStruct<SaveData>(Message);
    },
    _recv_202:function(Message){
        //202:其他玩家存檔資料 : {存檔資料<SaveData> (Json)}
        var saves = JSON.parse(ProtocolBuilder.Decode_ToString(Message));

        for(var i =0; i<saves.length; i++)
            PokerManager.getInstance().setSave(saves[i].RoleID, saves[i]);
    },

    _recv_254:function(Message){
        //    2:存款:	是否成功(boolean) + 數量(4) + 餘額(d8)
        // 254:目前遊戲版號: Version(4)
        // 255:(Debug) 強制指定公牌:  Code_Card1(1) + Code_Card2(1) + Code_Card3(1) + Code_Card4(1) + Code_Card5(1)

        var subProtocol = ProtocolBuilder.Decode_ToByte(Message);

        //    2:存款:	是否成功(boolean) + 數量(4) + 餘額(d8)
        var kind = 0;
        var amount = 0;
        var balance = 0;
        switch(subProtocol)
        {
            case 250:// 250:款項異動: Payway(e) + operation(1)
                var payway = ProtocolBuilder.Decode_ToEnum(Message);
                kind = ProtocolBuilder.Decode_ToByte(Message);
                switch(kind)
                {
                    case 1://    1:取款:
                        //    1:取款:
                        //        是否成功(boolean):
                        //            true:  數量(4) + 目前身上數量(4) +餘額(d8)
                        //            false: response(1)[1:餘額不足, 2兌換失敗]  + 數量(4) + 餘額(d8)
                        var successed = ProtocolBuilder.Decode_ToBool(Message);

                        if (successed)
                        {
                            amount = ProtocolBuilder.Decode_ToInt(Message);
                            balance = ProtocolBuilder.Decode_ToDouble(Message);
                            //Actor.UpdateBalance(payway, balance);
                            //Actor.AddWallet(payway, amount);
                        }
                        break;
                    case 2://    2:存款:	是否成功(boolean) + 數量(4) + 餘額(d8)
                        break;
                }

                break;
        }
    },

    _recv_255:function(Message){
        //255:目前身上金額:
        //    1:Payway(e) + 總資產(d8)
        //    2.Payway(e) + Wallet(4)
        var kind = ProtocolBuilder.Decode_ToByte(Message);
        switch(kind)
        {
            case 1:
                payway=ProtocolBuilder.Decode_ToEnum(Message);
                //Actor.UpdateBalance(payway, ProtocolBuilder.Decode_ToDouble(Message));
                break;
            case 2:
                payway = ProtocolBuilder.Decode_ToEnum(Message);
                //Actor.AddWallet(payway, ProtocolBuilder.Decode_ToInt(Message));
                break;
        }

    }
});

pokerPeer._instance=null;

pokerPeer.getInstance = function(){

    if(pokerPeer._instance==null)
        pokerPeer._instance = new pokerPeer();

    return pokerPeer._instance;
};
