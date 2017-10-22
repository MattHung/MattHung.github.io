/**
 * Created by Matt Hung on 2016/12/6.
 */

 var SceneEnum = {
    NULL:0,
    RoomList:1,
    Room:2
};

var CURRENT_SCENE = SceneEnum.NULL;

var LeaveCause = {
        KickLoser: "KickLoser",
        kickAll: "kickAll",
        SessionOver: "SessionOver",
        Active: "Active",
        KickSeat: "KickSeat",
        Disconnect: "Disconnect",
        KickIdle: "KickIdle",
        MergeTable: "MergeTable",
        SessionAbort:"SessionAbort"
    };

GameManager = cc.Class.extend({
    RankUpdateTime: 180,
    RoomListUpdateTime: 3,
    CurrentRoomInfo: null,
    Room: null,
    SignUpRoom: null,
    Node_SceneRoot: null,
    Node_RoomSceneRoot: null,
    EnrollHistoryData: [],

    UserNameMap: {},
    GameResult: false,
    checkEnterRoom: true,
    _resolveProtocol: true,
    _dateAry: null,
    _leaveRoomCause: null,

    _changingScene:false,
    _checkPass:true,
    _scene_queue:null,
    _hideCount:0,

    _times:[],

    isChangingScene:function(){
        return this._changingScene;
    },

    getDateData: function () {
        return this._dateAry;
    },

    getTick:function(){
        return new Date().getTime();
    },

    ctor: function () {        
        cc.director.getScheduler().scheduleUpdate(this);
        // cc.director.getScheduler().schedule(this.rankUpdate, this, this.RankUpdateTime);        
        cc.director.getScheduler().schedule(this.roomListUpdate, this, this.RoomListUpdateTime);
        
        this._scene_queue = [];
        this.CurrentRoomInfo ={RoomID:0, RestoreSession:false}

        // this._times["elapsed 2"] = [];

        for(var i=1; i<=4; i++){
            this._times["elapsed " + i.toString()]={};
            this._times["elapsed " + i.toString()]["count"] = 0;
            this._times["elapsed " + i.toString()]["time"] = 0;
            this._times["elapsed " + i.toString()]["avg"] = 0;
        }

        // this._times["elapsed 1"] = [["count":0], ["time":0], ["avg":0]];
        // this._times["elapsed 2"] = [["count":0], ["time":0], ["avg":0]];
        // this._times["elapsed 3"] = [["count":0], ["time":0], ["avg":0]];
        // this._times["elapsed 4"] = [["count":0], ["time":0], ["avg":0]];
    },

    setGameResult: function (val) {
        this.GameResult = val;
    },

    update: function (dt) {
        var last_tick =  this.getTick();
        this.checkSceneTransition();
        this._times["elapsed 1"]["count"] ++;
        this._times["elapsed 1"]["time"] += (this.getTick() - last_tick);
        this._times["elapsed 1"]["avg"] = this._times["elapsed 1"]["time"] / this._times["elapsed 1"]["count"];
                
        if (CURRENT_SCENE == SceneEnum.Room){
            last_tick =  this.getTick();
            this.Room.update(dt);
            this._times["elapsed 2"]["count"] ++;
            this._times["elapsed 2"]["time"] += (this.getTick() - last_tick);
            this._times["elapsed 2"]["avg"] = this._times["elapsed 2"]["time"] / this._times["elapsed 2"]["count"];
        }
        

        last_tick =  this.getTick();
        ui_MessageBox.getInstance().update();
        this._times["elapsed 3"]["count"] ++;
        this._times["elapsed 3"]["time"] += (this.getTick() - last_tick);
        this._times["elapsed 3"]["avg"] = this._times["elapsed 3"]["time"] / this._times["elapsed 3"]["count"];

        if (CURRENT_SCENE == SceneEnum.RoomList){
            last_tick =  this.getTick();
            this.SignUpRoom.update(dt);
            this._times["elapsed 4"]["count"] ++;
            this._times["elapsed 4"]["time"] += (this.getTick() - last_tick);
            this._times["elapsed 4"]["avg"] = this._times["elapsed 4"]["time"] / this._times["elapsed 4"]["count"];
        }
    },

    checkSceneTransition:function(){
        if(this._scene_queue.length <=0 )
            return;

        var transInfo = this._scene_queue.shift();
        var sceneEnum = transInfo.sceneEnum;
        var skipFade = transInfo.skipFade;

        this.checkPauseVideo(sceneEnum);

        if (sceneEnum != SceneEnum.Room)
            VideoController.getInstance().CloseRushVideo();

        switch (sceneEnum) {
            case SceneEnum.RoomList:
                if (CURRENT_SCENE != sceneEnum) {
                    if (this.Room != null) {
                        this.Room.quitBG();
                    }

                    if(skipFade)
                        cc.director.runScene(new RoomScene());
                    else
                        cc.director.runScene(new cc.TransitionFade(FADEIN_SECS, new RoomScene()));
                }
                break;
            case SceneEnum.Room:
                    cc.director.runScene(new cc.TransitionFade(FADEIN_SECS, new MainScene()));
                break;
        }

        // CocosWidget.eventRegister.getInstance().clear();
    },

    rankUpdate: function () {
        if (CURRENT_SCENE == SceneEnum.RoomList) {
            this.SignUpRoom.msgUpdate();
        }
    },

    roomListUpdate: function () {
        if (this.SignUpRoom) {
            this.SignUpRoom.roomUpdate();
        }
    },

    getUserName:function(user_id){
        if(user_id in this.UserNameMap)
            return this.UserNameMap[user_id];

        return "";
    },

    initialMainSceneUI: function (scene_root) {
        this.Node_SceneRoot = scene_root;
    },

    initialRoomSceneUI: function (scene_root) {
        this.Node_RoomSceneRoot = scene_root;
    },

    checkPauseVideo:function(sceneEnum){
        //merge table, pause video

        if(sceneEnum == SceneEnum.Room){
            VideoController.getInstance().PauseRushVideo();

            cc.director.getScheduler().schedule(
                function(){                    
                    VideoController.getInstance().ResumeRushVideo();
                }, 
            this, 0, 0, FADEIN_SECS, false, this);
        }
    },

    changeScene: function (sceneEnum, skipFade) {
        this._changingScene = true;
        
        if (CURRENT_SCENE != sceneEnum)
            CocosWidget.eventRegister.getInstance().clear();
            
        this._scene_queue.push({sceneEnum:sceneEnum, skipFade:skipFade});
    },

    onChangeSceneCompelted:function(sceneEnum){
        CURRENT_SCENE = sceneEnum;
        this._changingScene = false;

        if (CURRENT_SCENE == SceneEnum.RoomList)
            this.SignUpRoom = new SignUpRoom(this._leaveRoomCause);

        cc.director.getScheduler().schedule(
            function(){                    
                screenWidget.getInstance().adjustResolution();
                screenWidget.getInstance().adjustResolution();                    
            }, 
        this, 0, 0, FADEIN_SECS / 2, false, this);
    },

    onRoomList: function (roomType, rooms) {
        switch (roomType) {
            case RoomType.Baccarat:
                if (this.SignUpRoom == null && GameManager.getInstance().checkEnterRoom) {
                    // baccaratPeer.getInstance().sendMessage("EnterRoom", {RoomID: rooms[0].RoomID});
                    GameManager.getInstance().checkEnterRoom = false;
                }
                break;
            case RoomType.GodOfGambler:
                    this.SignUpRoom.updateRoomData(rooms);
                break;
        }
    },

    onMainSceneLoadCompleted: function () {
        if(this.CurrentRoomInfo.RoomID>0)
            this.Room = new BaccaratRoom(this.CurrentRoomInfo.RoomID);
    },

    enterRoom: function (room_id, result, restoreSession, showRegisteredMsg) {        
        // 1:成功
        // 2:已在房間內
        // 3:無此房間

        // 11:入房失敗(兌換分數失敗)
        // 12:等待入房中
        // 13:人數已滿
        // 14:已報名過此賽事
        // 15:有效投注額不足
        this.checkEnterRoom = true;
        switch (result) {
            case 1:
                this.CurrentRoomInfo.RoomID = room_id;
                this.CurrentRoomInfo.RestoreSession = restoreSession;
                this.CurrentRoomInfo.ShowRegisteredMsg = showRegisteredMsg;
                AccountCenter.getInstance().setSeatNo(0);

                var room_info = GameManager.getInstance().SignUpRoom.getRoomInfo(this.CurrentRoomInfo.RoomID);
                GameManager.getInstance().SignUpRoom.setRoomSelect(room_info);
                this.changeScene(SceneEnum.Room);
                break;
            case 2:
                // "95":"@#FF0000報名失敗",
                ui_MessageBox.getInstance().showTitleTextByID(95, 96);
                break;
            case 11:
                // "95":"@#FF0000報名失敗",
                ui_MessageBox.getInstance().showTitleTextByID(95, 104);
                break;
            case 12:
                this.checkEnterRoom = false;
                break;
            case 13:
                // "95":"@#FF0000報名失敗",
                ui_MessageBox.getInstance().showTitleTextByID(95, 97);
                break;
            case 14:
                ui_MessageBox.getInstance().showTitleTextByID(95, 157);
                break;
            case 15:
                ui_MessageBox.getInstance().showTitleTextByID(95,100);
                break;
            default:
                break
        }
    },

    leaveRoom: function () {
        this.CurrentRoomInfo.RoomID = 0;
        this.CurrentRoomInfo.RestoreSession = false;
        this.CurrentRoomInfo.ShowRegisteredMsg = false;
        this.Room = null;
    },

    takeSeat: function (seat_id) {
        this.Room.takeSeat(seat_id, this.CurrentRoomInfo.RestoreSession, this.CurrentRoomInfo.ShowRegisteredMsg);
        AccountCenter.getInstance().setSeatNo(seat_id);
    },

    onPlaceBet: function (data) {        
        this.Room.onPlaceBet(data);
    },

    updateRoundStatus: function (status) {
        this.Room.updateStatus(status);
    },

    updateRoundID: function (RoomID, RoundID, ShoeInfo) {
        this.Room.updateRoundID(RoomID, RoundID, ShoeInfo);
    },

    updateRoomInfo: function (data) {
        this.Room.updateRoomInfo(data);
    },

    updateChipInfo: function (seat_id, user_id, chips) {
        this.Room.updateChipInfo(seat_id, user_id, chips);
    },

    updateBillBroad: function (data) {
        var todayData = JSON.parse(data.Today);
        var pastData = JSON.parse(data.Past);
        this.SignUpRoom.updateBillBroad(todayData, pastData);
    },

    onReceiveCard: function (order, card_num, visible) {
        this.Room.updateCard(order, card_num, visible);
    },

    onCountDown: function (remain_tick) {
        this.Room.onCountDown(remain_tick);
    },

    onGameResult: function (hit_areas, winners, result_id) {
        this.Room.onGameResult(hit_areas, winners, result_id);
    },

    onLeaveRoom: function (result, userID, seatID, cause) {
        if (result != 1)
            return;
        
        if(seatID > 0){
            this.Room.clearSeatChip(result, userID, seatID);
            this.Room.onLeaveRoom(userID, seatID);
        }

        if (cause == "KickIdle")
            if (GameManager.getInstance().Room != null)
                GameManager.getInstance().Room.settingBystander();



        if(cause == "SessionAbort"){
            this.addCancelGameMsg();
        }

        if (userID == AccountCenter.getInstance().getUserID()) {
            this._leaveRoomCause = cause;
            GameManager.getInstance().changeScene(SceneEnum.RoomList);
            this.addAskEnrollEvent();

            if (seatID != 0 && cause == LeaveCause.Active)
                this.addLeaveRoomMsg();
        }
    },

    addLeaveRoomMsg: function (seatID, cause) {
        if (this.GameResult)
            return;
        if (this.SignUpRoom)
            var signRoom = this.SignUpRoom;

        cc.director.getScheduler().schedule(
            function () {
                if (signRoom)
                    ui_MessageBox.getInstance().showTitleTextByID(147, 148);
            },
            this, 0, 0, FADEIN_SECS, false, this);
    },


    addCancelGameMsg:function(){

        if (this.SignUpRoom)
            var signRoom = this.SignUpRoom;

        var title;
        var text ;
        var Register;

        cc.director.getScheduler().schedule(
            function () {
                if (signRoom){

                    Register = this.Room._roomMessage.RegisterFee-this.Room._roomMessage.Service_fee;
                    title = language_manager.getInstance().getTextID(98);
                    text = language_manager.getInstance().getTextID(166);

                    text = String.format(text ,Register,this.Room._roomMessage.sessionID);
                    ui_MessageBox.getInstance().showText(title, text);
                }
            },
            this, 0, 0, FADEIN_SECS, false, this);
    },


    addAskEnrollEvent: function () {
        if (!this.GameResult)
            return;

        if (this.Room)
            var room_id = this.Room.getRoomID();
        if (this.SignUpRoom)
            var room_msg = this.SignUpRoom.getSelectRoom();

        cc.director.getScheduler().schedule(
            function () {
                if (room_id)
                    if (room_msg)
                        this.SignUpRoom.showEnterOption(98, 151, room_id, room_msg, 152, 153);
            },
            this, 0, 0, FADEIN_SECS, false, this);
    },

    onLeaveSeat:function(data){        
        this.Room.onLeaveSeat(data.SeatID, data.UserID);
        var title;
        var text;

        if(data.UserID == AccountCenter.getInstance().getUserID()){
            if(data.Cause=="KickIdle"){
                title = language_manager.getInstance().getTextID(98);
                text = language_manager.getInstance().getTextID(144);

                text = String.format(text ,this._hideCount);

                ui_MessageBox.getInstance().showText(title, text);

                if(this._checkPass==false){
                    this._checkPass=true;
                    this._hideCount =0;
                }
            }
            //ui_MessageBox.getInstance().showTitleTextByID(98,144);
        }
    },

    onClearRoadMap:function(){
        this.Room.onClearRoadMap();
    },

    onAddUserName:function(user_name, user_id){
        this.UserNameMap[user_id] = user_name;
    },

    onMergeTable:function(src, dest){
        this.Room.onMergeTable(src, dest);

        var seats = this.Room.getSeatData();

        if (AccountCenter.getInstance().getUserID() > 0)
            for (var i = 0; i < seats.length; i++)
                if (seats[i].getPlayerID() == AccountCenter.getInstance().getUserID()) {
                    // "121":"恭喜您！您已晉級到下一輪比賽！基於公平競爭原則，已將您換至本桌，祝您好運！",
                    ui_MessageBox.getInstance().showTitleTextByID(120, 121);
                    return;
                }

        // 基於公平原則，桌台已合併，以保持玩家數量平均",
        ui_MessageBox.getInstance().showTitleTextByID(98, 99);
    },

    onRoadMap:function(mapStr){
        this.Room.onRoadMap(mapStr);
    },

    onSessionRank:function(data){
        VideoController.getInstance().CloseRushVideo();
        screenWidget.getInstance().adjustResolution();
        screenWidget.getInstance().adjustResolution();                    

        cc.director.getScheduler().schedule(
            function () {
                this.Room.onSessionRank(data);
                VideoController.getInstance().ResumeRushVideo();
            },
            this, 0, 0, 2, false, this);
    },

    onBetControl:function(hideCount, passCount){
        this.Room.onBetControl(hideCount, passCount);

        if(this._checkPass == true){
            this._hideCount = passCount;
            this._checkPass=false;
        }

    },

    onEnrollHistory: function (data) {
        if (data.TotalPage <= 0 || data == null) {
            this.SignUpRoom.uiAccumulated.settingSearchScroll(null);
            return;
        }

        var dateData = JSON.parse(data.Data);
        for (var i = 0; i < dateData.length; i++)
            this.EnrollHistoryData.push(dateData[i]);

        if (data.TotalPage == data.Page) {
            this.dateClassify(this.EnrollHistoryData);
            this.EnrollHistoryData = [];
        }
    },

    dateClassify: function (data) {
        var memory = data.slice(0);

        var _dateClassify = {};
        var _dates = [];
        var dayInterval = 7;

        for (var i = 0; i < memory.length; i++) {
            if (!_dates.some(function (value, index, array) {
                    return value == memory[i].D ? true : false;
                })) {
                _dates.push(memory[i].D);
                _dateClassify[memory[i].D] = new Array(0);
            }

            var date = memory[i];
            for (var j = 0; j < _dates.length; j++) {
                switch (date.D) {
                    case _dates[j]:
                        _dateClassify[_dates[j]].push(date);
                        break
                }
            }
        }

        _dates.sort(function(a, b){
            return a > b ? 1 : -1;
        });

        if (this.SignUpRoom.uiAccumulated != null) {
            this._dateAry = [];
            for (var i = 0; i < _dates.length; i++) {
                var data = {};
                data.date = _dates[i];
                data.dateAry = _dateClassify[_dates[i]];
                data.no = i;

                this._dateAry.push(data);
            }

            if (this._dateAry.length > dayInterval) {
                this._dateAry.splice(0, this._dateAry.length - dayInterval);
            }
            this.SignUpRoom.updateParticipator(this._dateAry);
            this.SignUpRoom.updateParticipatorList(this._dateAry);
            this.SignUpRoom.uiAccumulated.settingSearchScroll(this._dateAry);
        }
    },

    onChipSetting:function (data) {
       AccountCenter.getInstance().setChipSelect(data);
    },

    onBetLimitation:function(data){
        this.Room.onBetLimitation(data);
    }
});

GameManager._instance = null;

GameManager.getInstance = function () {

    if (GameManager._instance == null)
        GameManager._instance = new GameManager();

    return GameManager._instance;
};