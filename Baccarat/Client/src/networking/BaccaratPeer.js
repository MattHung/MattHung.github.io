/**
 * Created by Matt Hung on 2016/12/6.
 */

 var BaccaratAction={
    RoomList:"RoomList",
    ChipInfo:"ChipInfo",
    EnterRoom:"EnterRoom",
    TakeSeat:"TakeSeat",
    PlaceBet:"PlaceBet",
    RoomInfo:"RoomInfo",
    RoundStatus:"RoundStatus",
    RoundID:"RoundID",
    CountDown:"CountDown",
    CardInfo:"CardInfo",
    GameResult:"GameResult",
    LeaveRoom:"LeaveRoom",
    LeaveSeat:"LeaveSeat",
    Billboard:"Billboard",
    ClearRoadMap:"ClearRoadMap",
    UserName:"UserName",
    RevokeRound:"RevokeRound",
    MergeTable:"MergeTable",
    RankInfo:"RankInfo",
    RoadMap:"RoadMap",
    SessionRank:"SessionRank",
    BetControl:"BetControl",
    EnrollHistory:"EnrollHistory",
    SessionNotification:"SessionNotification",
    BetLimitation:"BetLimitation",
    ChipSetting:"ChipSetting"
 };

 var ExchangeType = {
    Balance:1,     //get balance
    Exchange:2,    //exchange score
    Recompensate:3 //return score
 };

var RoomType = {
    Baccarat:1,
    GodOfGambler:2
}

var CURRENT_ROOM_TYPE = RoomType.GodOfGambler;

baccaratPeer = CocosWidget.JsonPeer.extend({
    _gameID: null,
    _Scratch_Pad_Memory_Data: [],

    connect:function(url, onCallback_connect, onCallback_login){
        this._super(url,
                    //onopen
                    function() {                        
                        if(onCallback_connect)
                            onCallback_connect();
                        
                        baccaratPeer.getInstance().OnResponseLogin = function(res, AccountSave, error){
                            if(res==1){
                                AccountCenter.getInstance()._accountSave = AccountSave;
                                cc.log("receive account data: " + JSON.stringify(AccountSave));
                            }

                            if(onCallback_login)
                                onCallback_login(res, error);
                        }.bind(this);

                        baccaratPeer.getInstance().OnResponseEnterGame = function(res){
                            baccaratPeer.getInstance().requestExchange(ExchangeType.Balance, 0, 0, 0);                            
                        }.bind(this);

                        baccaratPeer.getInstance().OnReceiveDisconnect = function(reason){

                        }.bind(this);

                        baccaratPeer.getInstance().OnReceiveCredit = function(operationType, succeed, credit, balance){

                            switch(operationType){
                                case ExchangeType.Balance:
                                    var user_id = AccountCenter.getInstance().getUserID();
                                    AccountCenter.getInstance()._accountSave.Balance = balance; 
                                    cc.log("receive balance money=: " + balance);
                                    break;
                            }
                        }.bind(this);

                        baccaratPeer.getInstance().OnReceiveMessage = function(action, data){
                            try {
                                cc.log("receive protocol: " + JSON.stringify(data));
                                data = JSON.parse(data.Data);
                            }catch(err){
                                cc.log("receive protocol: error! action=" + action);
                            }

                    var _Scratch_Pad_Memory = {};
                    _Scratch_Pad_Memory.action = action;
                    _Scratch_Pad_Memory.data = data;
                    this._Scratch_Pad_Memory_Data.push(_Scratch_Pad_Memory);
                }.bind(this);

            },

            //onclose
            function () {
                cc.log("disconnect!!");
                // "與伺服器斷線",
                var txt = language_manager.getInstance().getTextID(105);
                var msg_panel = ui_MessageBox.getInstance().showText("", txt);

                msg_panel.addConfirmCallback(function(){
                    if(cc.sys.isNative)
                        return;

                    open(location, '_self').close();
                });
            }
        );
    },

    startUpdate: function () {
        cc.director.getScheduler().scheduleUpdate(this);
    },

    update: function () {
        for(var i=0; i<this._Scratch_Pad_Memory_Data.length; i++){
            if (GameManager.getInstance().isChangingScene()) 
                return;
            
            var _data = this._Scratch_Pad_Memory_Data.shift();
            this.sendData(_data.action, _data.data);
        }        
    },

    sendData: function (action, data) {
        switch (action) {
            case BaccaratAction.RoomList:
                this.onRoomList(data);
                break;
            case BaccaratAction.EnterRoom:
                this.onEnterRoom(data);
                break;
            case BaccaratAction.TakeSeat:
                this.onTakeSeat(data);
                break;
            case BaccaratAction.PlaceBet:
                this.onPlaceBet(data);
                break;
            case BaccaratAction.RoundStatus:
                this.onRoundStatus(data);
                break;
            case BaccaratAction.RoundID:
                this.onRoundID(data);
                break;
            case BaccaratAction.BetLimitation:
                this.onBetLimitation(data);
                break;
            case BaccaratAction.RoomInfo:
                this.onRoomInfo(data);
                break;
            case BaccaratAction.CountDown:
                this.onCountDown(data);
                break;
            case BaccaratAction.CardInfo:
                this.onCardInfo(data);
                break;
            case BaccaratAction.GameResult:
                this.onGameResult(data);
                break;
            case  BaccaratAction.ChipInfo:
                this.onChipInfo(data);
                break;
            case  BaccaratAction.Billboard:
                this.onBillBroad(data);
                break;
            case BaccaratAction.LeaveRoom:
                this.onLeaveRoom(data);
                break;
            case BaccaratAction.UserName:
                this.onAddUserName(data.UserName, data.UserID);
                break;
            case BaccaratAction.LeaveSeat:
                this.onLeaveSeat(data);
                break;
            case BaccaratAction.RevokeRound:
                // "91":"@#FF0000此局已註銷",
                ui_MessageBox.getInstance().showTextByID(91);
                break;
            case BaccaratAction.MergeTable:                
                this.onMergeTable(data.SourceTable, data.DestTable);
                break;
            case BaccaratAction.RankInfo:
                var session_id = data.RoundID;
                var rank = data.Rank;
                var award=data.Award;


                var title;
                var text;
                var registerFee;

                if(!GameManager.getInstance().Room)
                    return;

                if(data.Award <=0){
                    registerFee = (GameManager.getInstance().Room._roomMessage.RegisterFee)-(GameManager.getInstance().Room._roomMessage.Service_fee);
                    // "101":"很遺憾，您在@#FFBF00百家樂比賽(比賽場號:@#FFBF00{0})獲得第{1}名,被淘汰,下次繼續努力加油吧！",
                    title = language_manager.getInstance().getTextID(122);
                    text = language_manager.getInstance().getTextID(101);

                    text = String.format(text, session_id, rank,registerFee);
                    ui_MessageBox.getInstance().showText(title, text);

                    // GameManager.getInstance().Room.settingBystander();
                }
                //"165":您在@#FFBF00百家樂比賽(比賽場號:@#FFBF00{0})獲得第{1}名,獲得獎金 {2}
                else{
                    registerFee = (GameManager.getInstance().Room._roomMessage.RegisterFee)-(GameManager.getInstance().Room._roomMessage.Service_fee);
                    title = language_manager.getInstance().getTextID(120);//恭喜您
                    text = language_manager.getInstance().getTextID(165);
                    text = String.format(text,session_id,rank,award,registerFee);
                    ui_MessageBox.getInstance().showText(title,text);
                }
                
                break;
            case BaccaratAction.RoadMap:
                this.onRoadMap(data);
                break;
            case BaccaratAction.SessionRank:
                this.onSessionRank(data);
                break;
            case BaccaratAction.BetControl:
                this.onBetControl(data);
                break;
            case BaccaratAction.EnrollHistory:
                this.onEnrollHistory(data);
                break;
            case BaccaratAction.SessionNotification:
                if (!cc.sys.isNative) {                
                    try {                        
                        if (parent.godOfGambler)
                            parent.godOfGambler(data.remainMinutes);
                    }
                    catch (e) {

                    }
                }
                break;
            case  BaccaratAction.ChipSetting:
                this.onChipSetting(data);
                break;
        }
    },

    onRoomList:function(data){        
        GameManager.getInstance().onRoomList(data.RoomType, data.Rooms);
    },

    onEnterRoom: function (data) {
        GameManager.getInstance().enterRoom(data.RoomID, data.Result, data.RestoreSession, data.Registered);
    },

    onTakeSeat:function(data){
        if(data.Result==1){
            GameManager.getInstance().takeSeat(data.SeatID);
        }
    },

    onPlaceBet:function(data){
        GameManager.getInstance().onPlaceBet(data);
    },


    onCountDown:function(data){
        GameManager.getInstance().onCountDown(data.RemainTick);
    },

    onRoundStatus: function (data) {
        GameManager.getInstance().updateRoundStatus(data.Status);
    },

    onRoundID:function(data){
        GameManager.getInstance().updateRoundID(data.RoomID, data.RoundID, data.ShoeInfo);
    },

    onBetLimitation:function(data){
        GameManager.getInstance().onBetLimitation(data);
    },

    onRoomInfo:function(data){
        GameManager.getInstance().updateRoomInfo(data);
    },

    onCardInfo:function(data){
        GameManager.getInstance().onReceiveCard(data.Order, data.CardNum, data.Visible)
    },

    onGameResult:function(data){
        GameManager.getInstance().onGameResult(data.hit_areas, data.winners, data.result_id);
    },

    onChipInfo:function (data) {
        GameManager.getInstance().updateChipInfo(data.SeatID,data.User,data.Chips);
    },

    onBillBroad:function (data) {
        GameManager.getInstance().updateBillBroad(data);
    },

    onLeaveRoom:function(data){
        GameManager.getInstance().onLeaveRoom(data.Result, data.UserID, data.SeatID, data.Cause);
    },

    onLeaveSeat:function(data){
        GameManager.getInstance().onLeaveSeat(data);
    },

    onClearRoadMap:function(){
        GameManager.getInstance().onClearRoadMap();
    },

    onAddUserName:function(user_name, user_id){
        GameManager.getInstance().onAddUserName(user_name, user_id);
    },

    onMergeTable:function(src, dest){
        GameManager.getInstance().onMergeTable(src, dest);
    },

    onRoadMap:function(data){
        GameManager.getInstance().onRoadMap(data.MapStr);
    },

    onSessionRank:function(data){
        GameManager.getInstance().onSessionRank(data);
    },

    onBetControl:function(data){
        GameManager.getInstance().onBetControl(data.HideCount, data.PassCount);
    },

    onEnrollHistory:function (data) {
        GameManager.getInstance().onEnrollHistory(data);
    },

    onChipSetting:function (data) {
        GameManager.getInstance().onChipSetting(data);
    }

});

baccaratPeer._instance=null;

baccaratPeer.getInstance = function(){

    if (baccaratPeer._instance == null) {
        baccaratPeer._instance = new baccaratPeer();
        baccaratPeer._instance.startUpdate();
    }

    return baccaratPeer._instance;
};
