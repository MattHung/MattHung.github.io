/**
 * Created by Matt Hung on 2016/4/3.
 */

NetworkPeer = CocosWidget.SocketPeer.extend({
    _gameID:null,

    OnResponseLogin:null,
    OnResponseEnterGame:null,
    OnReceiveSystemMessage:null,

    AccountSave:{},

    getPlayerID:function(){
        return this.AccountSave.UserID;
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
        ProtocolBuilder.Encode_FromInt(msg, 0);
        ProtocolBuilder.Encode_FromByte(msg, 1);

        ProtocolBuilder.Encode_FromInt(msg, gameID);
        ProtocolBuilder.Encode_FromString(msg, sessionID);
        ProtocolBuilder.Encode_FromByte(msg, platForm);

        ProtocolBuilder.Encode_FromInt(msg, subsidiaryID);
        ProtocolBuilder.Encode_FromString(msg, subsidiaryAccount);
        ProtocolBuilder.Encode_FromInt(msg, subsidiaryUserID);
        ProtocolBuilder.Encode_FromString(msg, browser);
        ProtocolBuilder.Encode_FromString(msg, osType);

        this.sendBinary(msg);

        this.ws.onmessage =function(evt){
            var msg = new MemoryStream();
            msg.initialBuffer(new Uint8Array(evt.data));

            var header = ProtocolBuilder.Decode_ToInt(msg);

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
        ProtocolBuilder.Encode_FromInt(response, headNO);
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
            default :
                break;
        }

    },

    _recv_1:function(Message){
        var fighterType = ProtocolBuilder.Decode_ToByte(Message);        
        AccountManager.getInstance().getSave().FighterType = fighterType;
        GameManager.getInstance().onNewGame(fighterType);
    },

    _recv_2:function(Message){
        var user_id = ProtocolBuilder.Decode_ToInt(Message);        
        var current_score = ProtocolBuilder.Decode_ToInt(Message);        
        AccountManager.getInstance().getSave(user_id).Score = current_score;
    },

    _recv_3:function(Message){
        var user_id = ProtocolBuilder.Decode_ToInt(Message);        
        var user_name = ProtocolBuilder.Decode_ToString(Message);   
        var fighterType = ProtocolBuilder.Decode_ToInt(Message);              
        var current_score = ProtocolBuilder.Decode_ToInt(Message);        

        AccountManager.getInstance().getSave(user_id).UserName = user_name;
        AccountManager.getInstance().getSave(user_id).FighterType = fighterType;
        AccountManager.getInstance().getSave(user_id).Score = current_score;

        if(current_score<0)
            AccountManager.getInstance().removeSave(user_id);
    }

    // _recv_0:function(Message){
    //     //  0 : 傳送牌桌資訊 : 桌次種類(1)  + Count(u2) +{桌次編號(4)+TableInfo]*Count}
    //     //TableInfo:
    //     //     一般桌  皇家德州撲克:桌內人數(1)
    //     //     單桌賽: 此底台入場費(4) + 總人數(4)

    //     var tableType = ProtocolBuilder.Decode_ToByte(Message);
    //     var count =ProtocolBuilder.Decode_ToUShort(Message);

    //     var tableInfo = [];
    //     for(var i=0; i<count; i++){
    //         var element ={};
    //         element.tableID = ProtocolBuilder.Decode_ToInt(Message);

    //         //一般桌  皇家德州撲克:桌內人數(1)
    //         element.playerCount = ProtocolBuilder.Decode_ToByte(Message);
    //         tableInfo.push(element);
    //     }

    //     PokerManager.getInstance().onGotTableList(tableInfo);
    // },  
});

NetworkPeer._instance=null;
NetworkPeer.getInstance = function(){

    if(NetworkPeer._instance==null)
        NetworkPeer._instance = new NetworkPeer();

    return NetworkPeer._instance;
};
