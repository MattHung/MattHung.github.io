/**
 * Created by jeff_chien on 2017/1/9.
 */

var SignUpTableList = cc.Class.extend({
    _Room_Width: 0,
    _Room_Height: 0,
    roomTag: null,
    scrollViewCtrl: null,
    serverRoomData: null,
    uiSignUpArea: null,
    uiGamingArea: null,
    _barPic: null,
    _playerListScrollBar: null,
    _bystanderListScrollBar: null,

    ctor: function (roomList) {
        this.initialUINode();
        this.roomClassify(roomList);
        this.initialScrollView();
        this.dataInitial();
        this.initialScrollBarPic();
        this.initialVisible();

        this.createRoom();
    },

    dataInitial: function () {
        this.scrollViewCtrl.scrollList_SignUp._protectedChildren[0].getChildren().splice(1, this.scrollViewCtrl.scrollList_SignUp._protectedChildren[0].getChildren().length - 1);
        this.scrollViewCtrl.scrollList_SignUp._protectedChildren[1].getChildren().splice(1, this.scrollViewCtrl.scrollList_SignUp._protectedChildren[1].getChildren().length - 1);
        this.scrollViewCtrl.scrollList_Gaming._protectedChildren[0].getChildren().splice(1, this.scrollViewCtrl.scrollList_Gaming._protectedChildren[0].getChildren().length - 1);
        this.scrollViewCtrl.scrollList_Gaming._protectedChildren[1].getChildren().splice(1, this.scrollViewCtrl.scrollList_Gaming._protectedChildren[1].getChildren().length - 1);
    },

    roomClassify: function (roomList) {
        if (roomList.length <= 0)return;
        this.serverRoomData = {};
        this.serverRoomData.signUp = [];
        this.serverRoomData.standBy = [];

        for (var i = 0; i < roomList.length; i++) {
            var room = roomList[i];
            if (room.Status == "Enrolling") {
                this.serverRoomData.signUp.push(room);
            } else {
                this.serverRoomData.standBy.push(room);
            }
        }

        if (this.serverRoomData.standBy.length <= 0) {
            this.roomTag.gameTagBg.setVisible(false);
            this.roomTag.gameTagTxt.setVisible(false);
        } else {
            this.roomTag.gameTagBg.setVisible(true);
            this.roomTag.gameTagTxt.setVisible(true);
        }
    },

    initialUINode: function () {
        this.roomTag = {};
        this.roomTag.main = ccui.helper.seekWidgetByName(GameManager.getInstance().Node_RoomSceneRoot.getChildByName("RoomInfo_Node"), "Tag_Node");
        this.roomTag.gameTagBg = this.roomTag.main.getChildByName("tag_in_the_contest");
        this.roomTag.gameTagTxt = this.roomTag.main.getChildByName("Title_IntheContest");
        this.roomTag.signUpTagBg = this.roomTag.main.getChildByName("tag_signing_up");
        this.roomTag.signUpTagTxt = this.roomTag.main.getChildByName("Title_SigningUP");

        this.roomTag.gameTagTxt.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this.roomTag.signUpTagTxt.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
    },

    initialScrollView: function () {
        this.scrollViewCtrl = {};
        this.scrollViewCtrl.scrollList_SignUp = ccui.helper.seekWidgetByName(GameManager.getInstance().Node_RoomSceneRoot.getChildByName("RoomInfo_Node"), "Gaming_Scroll");

        this._Room_Width = this.scrollViewCtrl.scrollList_SignUp.width;
        this._Room_Height = this.scrollViewCtrl.scrollList_SignUp.height;

        this.scrollViewCtrl.scrollList_SignUp.setDirection(ccui.ScrollView.DIR_VERTICAL);
        this.scrollViewCtrl.scrollList_SignUp.setVisible(true);
        this.scrollViewCtrl.scrollList_SignUp.setAnchorPoint(cc.p(0, 0));
        this.scrollViewCtrl.scrollList_SignUp.setContentSize(cc.size(this._Room_Width, this._Room_Height));
        this.scrollViewCtrl.scrollList_SignUp.setScrollBarEnabled(false);

        var len = this.serverRoomData.signUp.length;
        this.scrollViewCtrl.scrollList_SignUp.setInnerContainerSize(cc.size(this._Room_Width, (this._Room_Height) * len / 2));
        this.scrollViewCtrl.scrollList_SignUp.y = this.scrollViewCtrl.scrollList_SignUp.getPositionY();
        this.scrollViewCtrl.scrollList_SignUp.x = this.scrollViewCtrl.scrollList_SignUp.getPositionX();
        this.scrollViewCtrl.scrollList_SignUp.jumpToTop();

        this.scrollViewCtrl.scrollList_Gaming = ccui.helper.seekWidgetByName(GameManager.getInstance().Node_RoomSceneRoot.getChildByName("RoomInfo_Node"), "IntheContest_Scroll");

        this._Room_Width = this.scrollViewCtrl.scrollList_Gaming.width;
        this._Room_Height = this.scrollViewCtrl.scrollList_Gaming.height;

        this.scrollViewCtrl.scrollList_Gaming.setDirection(ccui.ScrollView.DIR_VERTICAL);
        this.scrollViewCtrl.scrollList_Gaming.setVisible(true);
        this.scrollViewCtrl.scrollList_Gaming.setAnchorPoint(cc.p(0, 0));
        this.scrollViewCtrl.scrollList_Gaming.setContentSize(cc.size(this._Room_Width, this._Room_Height));
        this.scrollViewCtrl.scrollList_Gaming.setScrollBarEnabled(false);

        var len = this.serverRoomData.standBy.length;
        this.scrollViewCtrl.scrollList_Gaming.setInnerContainerSize(cc.size(this._Room_Width, (this._Room_Height) * len / 2));
        this.scrollViewCtrl.scrollList_Gaming.y = this.scrollViewCtrl.scrollList_Gaming.getPositionY();
        this.scrollViewCtrl.scrollList_Gaming.x = this.scrollViewCtrl.scrollList_Gaming.getPositionX();
        this.scrollViewCtrl.scrollList_Gaming.jumpToTop();
    },

    initialScrollBarPic: function () {
        this._barPic = {};
        this._barPic.playing = ccui.helper.seekWidgetByName(GameManager.getInstance().Node_RoomSceneRoot.getChildByName("RoomInfo_Node"), "List_Bar_SignUp_Node");
        this._barPic.bystander = ccui.helper.seekWidgetByName(GameManager.getInstance().Node_RoomSceneRoot.getChildByName("RoomInfo_Node"), "List_Bar_InGame_Node");

        this.initialScrollBar();
    },

    initialScrollBar: function () {
        this._playerListScrollBar = new uiScrollBar(GameManager.getInstance().Node_RoomSceneRoot, null, this.scrollViewCtrl.scrollList_SignUp, this._barPic.playing.getChildByName("bg_listl_bar"),  this._barPic.playing.getChildByName("Btn_list"));
        this._bystanderListScrollBar = new uiScrollBar(GameManager.getInstance().Node_RoomSceneRoot, null, this.scrollViewCtrl.scrollList_Gaming, this._barPic.bystander.getChildByName("bg_listl_bar"),  this._barPic.bystander.getChildByName("Btn_list"));
    },

    initialVisible: function () {
        this.scrollViewCtrl.scrollList_Gaming.getChildByName("Gaming_Node").setPosition(10000, 10000);
    },

    createRoom: function () {
        this.uiSignUpArea = [];
        this.uiGamingArea = [];

        for (var i = 0; i < this.serverRoomData.signUp.length; i++)
            this.uiSignUpArea.push(new uiSignUpArea(GameManager.getInstance().Node_RoomSceneRoot, this.serverRoomData.signUp[i], i, this.scrollViewCtrl.scrollList_SignUp));

        for (var i = 0; i < this.serverRoomData.standBy.length; i++)
            this.uiGamingArea.push(new uiSignUpArea(GameManager.getInstance().Node_RoomSceneRoot, this.serverRoomData.standBy[i], i, this.scrollViewCtrl.scrollList_Gaming));
    },

    addRoom: function () {
        for (var i = 0; i < this.serverRoomData.signUp.length; i++) {
            var severData = this.serverRoomData.signUp[i];
            var match = false;

            for (var j = 0; j < this.uiSignUpArea.length; j++) {

                if (severData.RoomID != this.uiSignUpArea[j]._roomID)continue;

                this.uiSignUpArea[j].updateMessage(severData);
                match = true;
                break;
            }

            if (!match) {
                this.initialRoom();
                this._playerListScrollBar.updateSlider();
                this._bystanderListScrollBar.updateSlider();
                return;
            }
        }

        for (var i = 0; i < this.serverRoomData.standBy.length; i++) {
            var severData = this.serverRoomData.standBy[i];
            var match = false;

            for (var j = 0; j < this.uiGamingArea.length; j++) {

                if (severData.RoomID != this.uiGamingArea[j]._roomID)continue;

                this.uiGamingArea[j].updateMessage(severData);
                match = true;
                break;
            }

            if (!match) {
                this.initialRoom();
                this._playerListScrollBar.updateSlider();
                this._bystanderListScrollBar.updateSlider();
                return;
            }
        }
    },

    removeRoom: function () {
        for (var i = 0; i < this.uiSignUpArea.length; i++) {
            var severData = this.uiSignUpArea[i];
            var match = false;

            for (var j = 0; j < this.serverRoomData.signUp.length; j++) {
                if (severData._roomID != this.serverRoomData.signUp[j].RoomID)continue;
                match = true;
                break;
            }

            if (!match) {
                this.initialRoom();
                this._playerListScrollBar.updateSlider();
                this._bystanderListScrollBar.updateSlider();
                return;
            }
        }

        for (var i = 0; i < this.uiGamingArea.length; i++) {
            var severData = this.uiGamingArea[i];
            var match = false;

            for (var j = 0; j < this.serverRoomData.standBy.length; j++) {
                if (severData._roomID != this.serverRoomData.standBy[j].RoomID)continue;
                match = true;
                break;
            }

            if (!match) {
                this.initialRoom();
                this._playerListScrollBar.updateSlider();
                this._bystanderListScrollBar.updateSlider();
                return;
            }
        }
    },

    initialRoom: function () {
        this.clearEvent();
        this.initialScrollView();
        this.dataInitial();
        this.initialVisible();

        this.createRoom();
    },

    clearEvent: function () {
        for (var i = 0; i < this.uiSignUpArea.length; i++) {
            var room = this.uiSignUpArea[i];

            CocosWidget.eventRegister.getInstance().removeTargetEvent(room, room._buttons.signUpBtn);
            CocosWidget.eventRegister.getInstance().removeTargetEvent(room, room._buttons.standbyBtn);
            CocosWidget.eventRegister.getInstance().removeTargetEvent(room, room._buttons.detailBtn_On);
        }

        for (var i = 0; i < this.uiGamingArea.length; i++) {
            var room = this.uiGamingArea[i];

            CocosWidget.eventRegister.getInstance().removeTargetEvent(room, room._buttons.signUpBtn);
            CocosWidget.eventRegister.getInstance().removeTargetEvent(room, room._buttons.standbyBtn);
            CocosWidget.eventRegister.getInstance().removeTargetEvent(room, room._buttons.detailBtn_On);
        }
    },

    update: function (dt) {
        if (this.uiGamingArea.length <= 0) {
            this.roomTag.gameTagBg.setVisible(false);
            this.roomTag.gameTagTxt.setVisible(false);
        } else {
            this.roomTag.gameTagBg.setVisible(true);
            this.roomTag.gameTagTxt.setVisible(true);
        }

        for (var j = 0; j < this.uiSignUpArea.length; j++) {
            this.uiSignUpArea[j].updateRoom(dt);
        }

        for (var j = 0; j < this.uiGamingArea.length; j++) {
            this.uiGamingArea[j].updateRoom(dt);
        }

        this.updateLanguage();
        this._playerListScrollBar.update();
        this._bystanderListScrollBar.update();
    },

    updateLanguage: function () {
        this.roomTag.gameTagTxt.setString(language_manager.getInstance().getTextID(39));
        this.roomTag.signUpTagTxt.setString(language_manager.getInstance().getTextID(28));
    },

    updateScroll: function (roomList) {
        if (roomList.length <= 0)return;
        this.roomClassify(roomList);
        this.addRoom();
        this.removeRoom();

        for (var i = 0; i < roomList.length; i++) {
            var msg = roomList[i];
            for (var j = 0; j < this.uiSignUpArea.length; j++) {
                if (msg.RoomID == this.uiSignUpArea[j]._roomID) {
                    this.uiSignUpArea[j].updateMessage(msg);
                    break;
                }
            }
        }
    }
});