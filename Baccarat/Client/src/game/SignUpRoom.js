/**
 * Created by jeff_chien on 2016/12/22.
 */

var SignUpRoom = cc.Class.extend({
    _roomList: null,
    _roomListData: null,
    _roomSelect: null,
    uiRank: null,
    uiDetail: null,
    uiLanguage: null,
    uiAccumulated: null,
    uiSignRoomEffect: null,
    uiTip: null,
    _todayArray: [],
    _pastArray: [],
    _dateAry: null,
    _ParticipatorInfo: {},
    _msgOpen: false,
    _EnterRoomResult: {
        InRoom: 2,
        Full: 13
    },
    _leaveRoomCause: null,

    getMsgOpen: function () {
        return this._msgOpen;
    },

    setMsgOpen: function (val) {
        this._msgOpen = val;
    },

    getSelectRoom: function () {
        return this._roomSelect;
    },

    getTodayList: function () {
        return this._todayArray;
    },

    getPastList: function () {
        return this._pastArray;
    },

    getParticipatorList: function () {
        return this._ParticipatorInfo;
    },

    ctor: function (leaveRoomCause) {
        GameManager.getInstance().Node_RoomSceneRoot.getChildByName("RoomInfo_Node").setVisible(false);
        GameManager.getInstance().Node_RoomSceneRoot.getChildByName("Ranking_Node").setVisible(false);

        this._dateAry = GameManager.getInstance().getDateData();
        this._leaveRoomCause = leaveRoomCause;

        this.uiAccumulated = new ui_Accumulated(GameManager.getInstance().Node_RoomSceneRoot, this);
        this.uiRank = new ui_Rank(GameManager.getInstance().Node_RoomSceneRoot, this);
        this.uiDetail = new ui_Detail(GameManager.getInstance().Node_RoomSceneRoot);
        this.uiLanguage = new ui_Language(GameManager.getInstance().Node_RoomSceneRoot, this);
        this.uiSignRoomEffect = new ui_SignRoomEffect(GameManager.getInstance().Node_RoomSceneRoot, this);
        this.uiTip = new ui_tip(GameManager.getInstance().Node_RoomSceneRoot,this);
        CocosWidget.getNode(GameManager.getInstance().Node_RoomSceneRoot, "Details_Node").setVisible(false);

        if (this._leaveRoomCause != "Active" || this._leaveRoomCause != "MergeTable")
            this.sendBillboard();
        this.sendGameEnrollHistory();
        if (GameManager.getInstance().getDateData())
            this.updateParticipator(GameManager.getInstance().getDateData());
    },

    update: function (dt) {
        if (this._roomList != null)
            this._roomList.update(dt);
        if (this.uiRank != null)
            this.uiRank.update(dt);
        if (this.uiDetail != null) {
            this.uiDetail.update(dt);
        }
        if (this.uiAccumulated != null)
            this.uiAccumulated.update(dt);

        if (this.uiSignRoomEffect != null)
            this.uiSignRoomEffect.update(dt);
    },

    initialScrollView: function (roomList) {
        this._roomList = new SignUpTableList(roomList);
    },

    sendBillboard: function () {
        baccaratPeer.getInstance().sendMessage("Billboard", {});
    },

    sendGameEnrollHistory: function () {
        if (GameManager.getInstance().getDateData() == null) {
            baccaratPeer.getInstance().sendMessage("EnrollHistory", {});
        } else {
            this.updateParticipatorList(this._dateAry);
            this.uiAccumulated.settingSearchScroll(this._dateAry);

            if (this._leaveRoomCause != "Active" || this._leaveRoomCause != "MergeTable")
                cc.director.getScheduler().schedule(function () {
                    baccaratPeer.getInstance().sendMessage("EnrollHistory", {});
                }.bind(this), this, 0, 0, 5, false);
        }
    },

    updateParticipator: function (array) {
        var todayCount = 0;
        var totalCount = 0;
        for (var i = 0; i < array.length; i++) {
            for (var j = 0; j < array[i].dateAry.length; j++) {
                if (array[i].dateAry[j].T > 0)
                    todayCount++;
            }
            totalCount += array[i].dateAry.length;
        }
        this.uiRank.updatePeopleCount(todayCount, totalCount);
    },

    updateParticipatorList: function (dateArray) {
        this._ParticipatorInfo = {};
        this._ParticipatorInfo.Today = [];
        for (var i = 0; i < dateArray.length; i++) {
            for (var j = 0; j < dateArray[i].dateAry.length; j++) {
                if (dateArray[i].dateAry[j].T == 1)
                    this._ParticipatorInfo.Today.push(new GamblerParticipator(dateArray[i].dateAry[j]));
            }
        }

        this._ParticipatorInfo.Today.sort(function (a, b) {
            return new Date(a.gameTime).getTime() - new Date(b.gameTime).getTime()
        });
    },

    updateSearchDate: function (dateArray) {
        this._ParticipatorInfo.Total = [];
        for (var i = 0; i < dateArray.length; i++) {
            if (dateArray[i] == null)return;
            for (var j = 0; j < dateArray[i].dateAry.length; j++)
                this._ParticipatorInfo.Total.push(new GamblerParticipator(dateArray[i].dateAry[j]));
        }
    },

    showEnterOption: function (title_id, text_id, room_id, room_msg, int_enter, int_cancel) {
        var panel = new ui_MessageEnter();
        GameManager.getInstance().Node_RoomSceneRoot.addChild(panel.root_node);
        panel.root_node.setName("enterMsg");
        panel.setRoomInfo(room_id, room_msg);
        panel.setBtnString(int_enter, int_cancel);
        panel.showEnterQuestion(title_id, text_id);
        return panel;
    },

    updateBillBroad: function (today_data, past_data) {
        this._todayArray = [];
        this._pastArray = [];
        for (var i = 0; i < today_data.length; i++)
            this._todayArray.push(new GamblerRank(i, today_data[i], "today"));

        for (var i = 0; i < past_data.length; i++)
            this._pastArray.splice(0, 0, new GamblerRank(i, past_data[i], "past"));

        this.uiRank.updateRankUI(this._todayArray, RankClassify.Today);
        this.uiRank.updateRankUI(this._pastArray, RankClassify.Formerly);
    },

    msgUpdate: function () {
        this.sendBillboard();
    },

    roomUpdate: function () {
        baccaratPeer.getInstance().sendMessage("RoomList", {RoomType: RoomType.GodOfGambler});
    },

    getRoomInfo: function (room_id) {
        for (var i = 0; i < this._roomList.uiSignUpArea.length; i++)
            if (this._roomList.uiSignUpArea[i]._roomMsg.RoomID == room_id)
                return this._roomList.uiSignUpArea[i]._roomMsg;

        for (var i = 0; i < this._roomList.uiGamingArea.length; i++)
            if (this._roomList.uiGamingArea[i]._roomMsg.RoomID == room_id)
                return this._roomList.uiGamingArea[i]._roomMsg;

        return null;
    },

    languageUpdate: function () {
        if (this._roomList != null)
            for (var i = 0; i < this._roomList.uiSignUpArea.length; i++) {
                this._roomList.uiSignUpArea[i].languageUIMsg();
            }
    },

    setRoomSelect: function (roomMsg) {
        this._roomSelect = roomMsg;
    },

    updateRoomData: function (roomList) {
        this._roomListData = roomList;
        if (roomList.length <= 0)return;

        if (this._roomSelect != null) {
            for (var i = 0; i < roomList.length; i++) {
                if (this._roomSelect.RoomID == roomList[i].RoomID) {
                    this._roomSelect = roomList[i];
                }
            }
        }

        if (CURRENT_SCENE != SceneEnum.RoomList)return;
        if (this._roomList == null) {
            this.initialScrollView(roomList);
            GameManager.getInstance().Node_RoomSceneRoot.getChildByName("RoomInfo_Node").setVisible(true);
        } else
            this._roomList.updateScroll(roomList);
    },

    searchDate: function (_dateSearch) {
        var startDate = _dateSearch.start.substr(3, 1);//1~7
        var endDate = _dateSearch.end.substr(3, 1);//1~7
        var searchDateData = [];

        if (startDate > endDate) {
            var i = null;
            i = startDate;
            startDate = endDate;
            endDate = i;
        }

        for (var i = startDate; i <= endDate; i++) {
            searchDateData.push(GameManager.getInstance().getDateData()[i - 1]);
        }
        this.updateSearchDate(searchDateData);
        return searchDateData;
    }
});