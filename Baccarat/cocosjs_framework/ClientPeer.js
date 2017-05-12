/**
 * Created by Matt Hung on 2016/4/3.
 */

 CocosWidget.BasePeer = CocosWidget.SocketPeer.extend({
    _gameID:null,

    OnResponseLogin:null,
    OnResponseEnterGame:null,
    OnReceiveDisconnect:null,
    OnReceiveCredit:null,
    OnReceiveMessage:null,

    AccountSave:{},

    getPlayerID:function(){
        return this.AccountSave.UserID;
    },

    connect:function(ws_url, onOpen, onClose){
        this.setCallback_onOpen(onOpen);
        this.setCallback_onClose(onClose);
        this._super(ws_url);
    },
    
    requestLogin:function(gameID, sessionID, platform, hallID, userName, userID, browser, osType){
        this._gameID = gameID;
    },
    requestExchange:function(operationType, ratio_min, ratioi_max, credit){},

    systemReceive:function(msg){}
});

 CocosWidget.BinaryPeer = CocosWidget.BasePeer.extend({    
    ctor:function () {
        this.setMode(0);
    },

    requestLogin:function(gameID, sessionID, platform, hallID, userName, userID, browser, osType){
        this._super(gameID, sessionID, platform, hallID, userName, userID, browser, osType);
        //0:基本功能: Option(1)        
        //  1:要求登入: GameID(4) +SessionID(s) + Platform(1) + HallID(4) + UserName(s) + UserID(4) + Browser(s) + OSType(s)

        var msg = new MemoryStream();
        ProtocolBuilder.Encode_FromInt(msg, 0);
        ProtocolBuilder.Encode_FromByte(msg, 1);

        ProtocolBuilder.Encode_FromInt(msg, gameID);
        ProtocolBuilder.Encode_FromString(msg, sessionID);
        ProtocolBuilder.Encode_FromByte(msg, platform);

        ProtocolBuilder.Encode_FromInt(msg, hallID);
        ProtocolBuilder.Encode_FromString(msg, userName);
        ProtocolBuilder.Encode_FromInt(msg, userID);
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

            if(!InvokeFunction(fun_name, this, msg))
            if(this.OnReceiveMessage)
                this.OnReceiveMessage(msg);
        }.bind(this);
    },

    _sendMessageInternal:function(headNO, msg)
    {
        if(!this.getConnected())
            return;
        var response = new MemoryStream();
        ProtocolBuilder.Encode_FromInt(response, headNO);
        response.concatenate(msg.getData());
        this.sendBinary(response);
    },

    sendMessage:function(protocolNO, msg)
    {
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
            case 1://1:登入結果:  登入結果(1)
                    // 登入結果: 1 登入成功 + 玩家資料結構(Json)
                    //               2 登入失敗(api error) + error(s)
                    //               4 登入失敗(api 資訊不正確)  + error(s)                              
                    //               12 重複登入   
                    //               20:登入失敗-停押
                    //               21:登入失敗-停用
                    //               22:登入失敗-停權
                    //               23:登入失敗-凍結


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

            case 200://200:玩家斷線: 訊息(s)
                var reason = ProtocolBuilder.Decode_ToString(msg);

                if(this.OnReceiveDisconnect)
                    this.OnReceiveDisconnect(reason);
                break;

            case 255://255:資產相關種類: OperationType(1) + request_succeed(1) + 換取額度(d8), 剩餘額度(d8)
                    // OperationType:  1:取得額度
                    //                 2:換取額度
                    //                 3:歸還額度

                var operationType = ProtocolBuilder.Decode_ToByte(msg);
                var succeed = ProtocolBuilder.Decode_ToByte(msg);

                var credit = ProtocolBuilder.Decode_ToDouble(msg);

                var balance = ProtocolBuilder.Decode_ToDouble(msg);

                if(this.OnReceiveCredit)
                    this.OnReceiveCredit(operationType, succeed, credit, balance);
                break;
            default :
                break;
        }
    }
});

CocosWidget.JsonPeer = CocosWidget.BasePeer.extend({    
    ctor:function () {
        this.setMode(1);
    },

    requestLogin:function(gameID, sessionID, platform, hallID, userName, userID, browser, osType){
        this._super(gameID, sessionID, platform, hallID, userName, userID, browser, osType);

        //0:基本功能: Option(1)        
        //  1:要求登入: GameID(4) +SessionID(s) + Platform(1) + HallID(4) + UserName(s) + UserID(4) + Browser(s) + OSType(s)

        var msg = {};
        msg.subHeader = 1;
        msg.GameID = gameID;
        msg.SessionID = sessionID;
        msg.Platform = platform;
        msg.HallID = hallID;
        msg.UserName = userName;
        msg.UserID = userID;
        msg.Browser = browser;
        msg.OSType = osType;

        var send_json = JSON.stringify(msg);

        this._sendMessageInternal(0, send_json);

        this.ws.onmessage =function(evt){
            var protocolText = JSON.parse(evt.data);
            var detail = JSON.parse(protocolText.Detail);

            if(protocolText.GameID==0){
                this.systemReceive(detail);
                return;
            }

            if(this.OnReceiveMessage)
                this.OnReceiveMessage(detail.Action, detail);

            // var msg = new MemoryStream();
            // msg.initialBuffer(new Uint8Array(evt.data));

            // var header = ProtocolBuilder.Decode_ToInt(msg);

            // if(header==0){
            //     this.systemReceive(msg);
            //     return;
            // }

            // var protocolNO = ProtocolBuilder.Decode_ToByte(msg);

            // var fun_name= String.format("_recv_{0}", protocolNO);

            // InvokeFunction(fun_name, this, msg);
        }.bind(this);
    },

    // OperationType: 1:取得額度
    //                2:換取額度
    //                3:歸還額度
    requestExchange:function(operationType, ratio_min, ratioi_max, credit){
        var msg = {};
        msg.subHeader = 255;
        msg.OperationType = operationType;
        msg.Ratio_Min = ratio_min;
        msg.Ratio_Max = ratioi_max;
        msg.Credit = credit;
        
        var send_json = JSON.stringify(msg);
        this._sendMessageInternal(0, send_json);
    },

    _sendMessageInternal:function(headNO, msg)
    {
        if(!this.getConnected())
            return;

        var request = new CocosWidget.JsonPeer.ProtocolText();
        request.GameID = headNO;
        request.Detail = msg;
        var send_json = JSON.stringify(request);
        this.sendText(send_json);
    },

    sendMessage:function(action, data)
    {
        var protocol={};
        protocol.Action = action;
        protocol.Data = JSON.stringify(data);
        this._sendMessageInternal(this._gameID, JSON.stringify(protocol));
    },

    systemReceive:function(msg){//0:基本功能
        var res = 0;

        var kind = msg.subHeader;
        var subKind=0;
        switch (kind) {            
            case 1://1:登入結果:  登入結果(1)
                    // 登入結果: 1 登入成功 + 玩家資料結構(Json)
                    //               2 登入失敗(api error) + error(s)
                    //               4 登入失敗(api 資訊不正確)  + error(s)                              
                    //               12 重複登入   
                    //               20:登入失敗-停押
                    //               21:登入失敗-停用
                    //               22:登入失敗-停權
                    //               23:登入失敗-凍結


                res = msg.res;

                if (res == 1)
                {
                    var JsonStr = msg.data;
                    this.AccountSave = JSON.parse(JsonStr);
                }

                if(this.OnResponseLogin)
                    this.OnResponseLogin(res, this.AccountSave, msg.data);

                break;

            case 2://2:選擇遊戲結果:  選擇結果(1)
                res = msg.res;
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
            case 200://200:玩家斷線: 訊息(s)
                var reason = msg.reason;

                if(this.OnReceiveDisconnect)
                    this.OnReceiveDisconnect(reason);
                break;

            case 255://255:資產相關種類: OperationType(1) + request_succeed(1) + 換取額度(d8), 剩餘額度(d8)
                    // OperationType:  1:取得額度
                    //                 2:換取額度
                    //                 3:歸還額度

                var operationType = msg.opType;
                var succeed = msg.succeed;
                var credit = msg.credit;
                var balance = msg.balance;

                if(this.OnReceiveCredit)
                    this.OnReceiveCredit(operationType, succeed, credit, balance);
                break;
            default :
                break;
        }
    }
});

CocosWidget.JsonPeer.ProtocolText = cc.Class.extend({
    GameID:0,
    Detail:""
});