
var MediaData = (function(){
    var _instance;

    function createInstance(){
        function OnOpen(){}
        function OnClose(){}
        function OnMessage(data){}
        function OnStatusUpdate(status){}

        function Connect(remote_ws_address, info){

            this.gameCode = info.gameCode;
            this.gameType = info.gameType;

            this.ws = null;
            this.sendInfo = null;

            _instance.userInfo.sid = info.sid;

            this.ws = new WebSocket(remote_ws_address);

            var media_instance = this;

            this.ws.onopen = function() {
                info['action'] = "login";
                media_instance.Send(info);
            };

            this.ws.onclose = function() {

            };

            this.ws.onmessage = function(event) {
                if (!event.data)
                    return;

                var data = JSON.parse(event.data);

                if (data['amf'] && data['amf']['Name'] == "dadadaamf") {

                    infoData = data['amf']['Objects'][1];
                    var action = infoData['action'];

                    switch (action){
                        case "onLogin":
                            info['action'] = "userInfo";
                            media_instance.Send(info);
                            break;
                        case "onUserInfo":
                            info['action'] = "tableList";
                            media_instance.Send(info);
                            break;
                        case "onTableList":
                            info['action'] = "videoLink";
                            media_instance.Send(info);
                            break;
                        case "onVideoLink":
                            break;
                        default :
                            break;
                    }

                    data = data['amf']['Objects'][1];
                    media_instance.OnStatusUpdate(data);
                    media_instance.SaveStatus(data);

                    //logger.log(data);
                }

                media_instance.OnMessage(data);
            };

            this.SaveStatus = function(data){
                //action  onUpdate
                //gameCodeName		//房間名稱
                //countdown		//倒數
                //status 	waiting  	 // 目前該局的狀態  基本上有dealing betting waiting
                //roundSerial		//局號
                //poker	H.12,C.5	 // 牌型
                //roundNo			//靴局號
                //dealerName		//荷官名
                //result			//結果ID
                //roadmap			 // 路紙資訊
                //
                //payoff 	0 	  	 // 該玩家此局所贏的錢
                //credit	999933.2	 // 該用戶餘額
                //
                //
                //miing			 // 瞇牌狀態(ex. 0為無瞇牌   1為瞇牌中)
                //pokershow		 // 開牌狀態Y,Y,Y,Y,N,N(ps. Y為那張牌已翻開)
                //mitype			 // 瞇哪家牌(ex. player為莊家牌有人瞇   banker為閒家牌有人瞇   both兩家都有人瞇)
                //miname			 // 瞇莊家牌者的userID
                //miPName			 // 瞇閒家牌者的userID
                //pokerdown		 // 瞇牌倒數秒數

                media_instance.SetRoundInfo("gameCodeName", data);
                media_instance.SetRoundInfo("countdown", data);
                media_instance.SetRoundInfo("status", data);
                media_instance.SetRoundInfo("roundSerial", data);
                media_instance.SetRoundInfo("poker", data);
                media_instance.SetRoundInfo("roundNo", data);
                media_instance.SetRoundInfo("dealerName", data);
                media_instance.SetRoundInfo("result", data);
                media_instance.SetRoundInfo("roadmap", data);

                media_instance.SetRoundInfo("payoff", data);
                media_instance.SetRoundInfo("credit", data);

                media_instance.SetRoundInfo("miing", data);
                media_instance.SetRoundInfo("pokershow", data);
                media_instance.SetRoundInfo("mitype", data);
                media_instance.SetRoundInfo("miname", data);
                media_instance.SetRoundInfo("miPName", data);
                media_instance.SetRoundInfo("pokerdown", data);
            };

            this.SetRoundInfo = function(field, data){
                if(data.hasOwnProperty(field))
                    media_instance.RoundInfo[field]=data[field];
            };

            this._setInfoData = function(_info){
                this.sendInfo = {};

                this.sendInfo['sid'] = this.userInfo.sid;
                this.sendInfo["gameCode"] = this.gameCode;
                this.sendInfo["gameType"] = this.gameType;

                if (_info != undefined && typeof _info == 'object') {
                    for (var key in _info) {
                        if(_info.hasOwnProperty(key))
                            this.sendInfo[key] = _info[key];
                    }
                }
            }
        }

        function Close(){
            if (this.ws)
                this.ws.close();
        }

        function Send(_info){
            this._setInfoData(_info);
            var request = {command: "serverHandlerAMF", args: [JSON.stringify(this.sendInfo)]};
            this.ws.send(JSON.stringify(request));
        }


        return{
            //members variable
            userInfo : [],
            RoundInfo:{},

            //functions
            OnStatusUpdate : OnStatusUpdate,
            OnOpen : OnOpen,
            OnClose : OnClose,
            OnMessage: OnMessage,
            Connect : Connect,
            Close : Close,
            Send : Send
        };
    }

    return{
        getInstance : function(){
            if(!_instance)
                _instance = createInstance();

            return _instance;
        }
    };
})();