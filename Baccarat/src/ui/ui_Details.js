/**
 * Created by jeff_chien on 2017/1/16.
 */

var ui_Detail = gameLayer.extend({
    _roomMsg: null,
    _roomNode: null,
    _mainNode: null,
    _msgTitleNode: null,
    _msgTxtNode: null,
    _detailsNode: null,
    _RoomInfo: {},
    _buttons: null,
    _btnImgs: null,
    _bg: null,


    ctor: function (roomNode) {
        this._super(roomNode);
        this._roomNode = roomNode;
        this._RoomInfo = {};

        this.initialBaseNode();
        this.initialDetailNode();

        this.initialBtnImg();
        this.initialUI();
        this.initialTxt();
        this.initialBtn();

        this.setLocalZOrder(1);

        this._bg = this.getNode("Details_Node/black_alpha_70");
        this.registerMouseEvent(this._bg, null, null, function () {
        }, null);
        this._bg.setLocalZOrder(-1);
    },

    initialBaseNode: function () {
        this._mainNode = {};

        this._mainNode.main = this.getNode("Details_Node");
        this._mainNode.bg = this.getNode("Details_Node/Detail_bg");
        this._mainNode.titleTxt = this.getNode("Details_Node/Tittle_Node");
        this._mainNode.btns = this.getNode("Details_Node/GameStatus_Node");
        this._mainNode.btnTexture = this.getNode("Details_Node/Btn_Textures");
        this._mainNode.txt = this.getNode("Details_Node/Result");
    },

    initialBtnImg: function () {
        this._btnImgs = {};
        this._btnImgs.signUpImg = this._mainNode.btnTexture.getChildByName("Btn_EnrolledPic").getChildren();
        this._btnImgs.standByImg = this._mainNode.btnTexture.getChildByName("Btn_WatchPic").getChildren();
        this._btnImgs.exitImg = this._mainNode.btnTexture.getChildByName("Btn_DisablePic").getChildren();
    },

    initialUI: function () {
        this._msgTitleNode = {};

        this._msgTitleNode.BaccaratGame = this._mainNode.titleTxt.getChildByName("BaccaratGame");
        this._msgTitleNode.TotalPool = this._mainNode.titleTxt.getChildByName("TotalPool");
        this._msgTitleNode.TotalRound = this._mainNode.titleTxt.getChildByName("GameRound");
        this._msgTitleNode.SignUpCost = this._mainNode.titleTxt.getChildByName("SignUp");
        this._msgTitleNode.StartingPoints = this._mainNode.titleTxt.getChildByName("StartingPoints");
        this._msgTitleNode.BetLimit = this._mainNode.titleTxt.getChildByName("BetLimit");
        this._msgTitleNode.EnrolledPlayers = this._mainNode.titleTxt.getChildByName("EnrolledPlayers");
        this._msgTitleNode.PlayerPerTable = this._mainNode.titleTxt.getChildByName("PlayerPerTable");
        this._msgTitleNode.GameMaxCycle = this._mainNode.titleTxt.getChildByName("GameMaxCycle");
        this._msgTitleNode.NO1 = this._mainNode.titleTxt.getChildByName("NO1");
        this._msgTitleNode.NO4 = this._mainNode.titleTxt.getChildByName("No4");

        this._msgTitleNode.AwardStructure = this._mainNode.titleTxt.getChildByName("AwardStructure");
        this._msgTitleNode.MaxPass = this._mainNode.titleTxt.getChildByName("MaxPass");
        this._msgTitleNode.MaxBlind = this._mainNode.titleTxt.getChildByName("MaxBlind");
        this._msgTitleNode.GameRule = this._mainNode.titleTxt.getChildByName("GameRule");
        this._msgTitleNode.Notice = this._mainNode.titleTxt.getChildByName("Notice");

        this._msgTitleNode.txt_Contest = this._mainNode.titleTxt.getChildByName("Contest");
        this._msgTitleNode.txt_Round = this._mainNode.titleTxt.getChildByName("Round");

        this._msgTitleNode.txt_SignUp = this._mainNode.btns.getChildByName("txt_SignUp");
        this._msgTitleNode.txt_SignUp.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this._msgTitleNode.GameRule.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);
        this._msgTitleNode.BaccaratGame.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);

        this._msgTitleNode.Detail = new CocosWidget.TextField();
        this._msgTitleNode.Detail.setAnchorPoint(cc.p(0.5,0.5));
        this._msgTitleNode.Detail.setFontSize(24);
        this._msgTitleNode.Detail.setPosition(cc.p(630,581));
        this._msgTitleNode.Detail.setSize(100,24);

        this._msgTitleNode.NO2 = new CocosWidget.TextField();
        this._msgTitleNode.NO2.setAnchorPoint(cc.p(0.5,0.5));
        this._msgTitleNode.NO2.setFontSize(18);
        this._msgTitleNode.NO2.setPosition(cc.p(295,353));
        this._msgTitleNode.NO2.setSize(75,18);

        this._msgTitleNode.NO3 = new CocosWidget.TextField();
        this._msgTitleNode.NO3.setAnchorPoint(cc.p(0.5,0.5));
        this._msgTitleNode.NO3.setFontSize(18);
        this._msgTitleNode.NO3.setPosition(cc.p(295,330));
        this._msgTitleNode.NO3.setSize(75,18);

        this._mainNode.titleTxt.addChild(this._msgTitleNode.Detail);
        this._mainNode.titleTxt.addChild(this._msgTitleNode.NO2);
        this._mainNode.titleTxt.addChild(this._msgTitleNode.NO3);

        this._msgTitleNode.NO4.setVisible(false);
    },

    initialTxt: function () {
        this._msgTxtNode = {};

        this._msgTxtNode.txt_BetLimit = this._mainNode.txt.getChildByName("txt_BetLimit");
        this._msgTxtNode.txt_NO1 = this._mainNode.txt.getChildByName("txt_NO1");
        this._msgTxtNode.txt_NO2 = new CocosWidget.TextField();
        this._msgTxtNode.txt_NO2.setAnchorPoint(cc.p(0.5,0.5));
        this._msgTxtNode.txt_NO2.setFontSize(18);
        this._msgTxtNode.txt_NO2.setPosition(cc.p(360,353));
        this._msgTxtNode.txt_NO2.setSize(75,18);

        this._msgTxtNode.txt_NO3 = new CocosWidget.TextField();
        this._msgTxtNode.txt_NO3.setAnchorPoint(cc.p(0.5,0.5));
        this._msgTxtNode.txt_NO3.setFontSize(18);
        this._msgTxtNode.txt_NO3.setPosition(cc.p(360,330));
        this._msgTxtNode.txt_NO3.setSize(75,18);

        this._msgTxtNode.PoolMoney = new CocosWidget.TextField();
        this._msgTxtNode.PoolMoney.setAnchorPoint(cc.p(0.5,0.5));
        this._msgTxtNode.PoolMoney.setFontSize(30);
        this._msgTxtNode.PoolMoney.setPosition(cc.p(300,485));
        this._msgTxtNode.PoolMoney.setSize(150,35);

        this._mainNode.titleTxt.addChild(this._msgTxtNode.PoolMoney);
        this._mainNode.titleTxt.addChild(this._msgTxtNode.txt_NO2);
        this._mainNode.titleTxt.addChild(this._msgTxtNode.txt_NO3);

        for (var i = 3; i < 7; i++) {
            this._msgTxtNode["txt_NO" + (i + 1)] = this._msgTitleNode.NO4.clone();
            this._msgTxtNode["txt_NO" + (i + 1)].setAnchorPoint(cc.p(0.5, 0.5));
            this._msgTxtNode["txt_NO" + (i + 1)].setPosition(cc.p(this._msgTitleNode.NO4.getPositionX()+30, this._msgTitleNode.NO4.getPositionY() - 23 * (i - 3)));
            this._msgTxtNode["txt_NO" + (i + 1)].setVisible(true);
            this._msgTxtNode["txt_NO" + (i + 1)].setString("");
            this._mainNode.titleTxt.addChild(this._msgTxtNode["txt_NO" + (i + 1)]);
        }
    },

    initialDetailNode: function () {
        this._detailsNode = {};
        this._detailsNode.detail = this.getNode("Details_Node");
    },

    initialBtn: function () {
        this.registerMouseEvent(this._mainNode.bg, function () {
        }, null, function () {
        }.bind(this));

        if (this._buttons == null)
            this._buttons = [];
        this._buttons.push(this._mainNode.btns.getChildByName("Btn_Enrolled"));
        this._buttons.push(this._mainNode.btns.getChildByName("Btn_Watch"));
        this._buttons.push(this._mainNode.btns.getChildByName("Btn_Disable"));
        this._buttons.push(this._mainNode.btns.getChildByName("Btn_Next"));

        this._buttons.signUpBtn = this._buttons[0];
        this._buttons.standbyBtn = this._buttons[1];
        this._buttons.detailBtn_Off = this._buttons[2];
        this._buttons.nextBtn = this._buttons[3];

        for (var i = 0; i < this._buttons.length - 1; i++) {
            var _sp = cc.Sprite.create(this.checkBtn(this._buttons[i])[0].getTexture());
            _sp.setName("_sp");
            _sp.setAnchorPoint(0, 0);
            _sp.setPosition(0, 0);
            this._buttons[i].addChild(_sp, 1);
        }

        this._buttons.signUpBtn._isClick = false;
        this._buttons.standbyBtn._isClick = false;
        this._buttons.detailBtn_Off._isClick = false;
        this._buttons.nextBtn._isClick = false;

        this.registerMouseEvent(this._buttons.signUpBtn,
            this.downBtn.bind(this),
            this.upBtn.bind(this),
            this.enterBtn.bind(this),
            this.overBtn.bind(this));

        this.registerMouseEvent(this._buttons.detailBtn_Off,
            this.downBtn.bind(this),
            this.upBtn.bind(this),
            this.enterBtn.bind(this),
            this.overBtn.bind(this));

        this.registerMouseEvent(this._buttons.standbyBtn,
            this.downBtn.bind(this),
            this.upBtn.bind(this),
            this.enterBtn.bind(this),
            this.overBtn.bind(this));

        this.registerMouseEvent(this._buttons.nextBtn,
            null,
            function () {
                GameManager.getInstance().SignUpRoom.uiSignRoomEffect.upHelper();
            }.bind(this),
            null,
            null);

        this.registerMouseEvent(this._msgTitleNode.GameRule,
            null,
            function () {
                GameManager.getInstance().SignUpRoom.uiSignRoomEffect.upHelper();
            }.bind(this),
            null,
            null);
    },

    downBtn: function (sender) {
        var pics = this.checkBtn(sender);
        if (!GameManager.getInstance().SignUpRoom.getMsgOpen()) {
            sender._isClick = true;
            sender.getChildByName("_sp").setTexture(pics[1].getTexture());
            this.enterBtn(sender);
        }
    },

    upBtn: function (sender) {
        var pics = this.checkBtn(sender);
        switch (sender) {
            case this._buttons.signUpBtn:            
                    GameManager.getInstance().SignUpRoom.showEnterOption(155, 156, this._roomMsg.RoomID, this._roomMsg, 37, 149);
                    GameManager.getInstance().SignUpRoom.setMsgOpen(true);
                break;
            case this._buttons.standbyBtn:
                    baccaratPeer.getInstance().sendMessage("EnterRoom", {RoomID: this._roomMsg.RoomID});
                    GameManager.getInstance().SignUpRoom.setRoomSelect(this._roomMsg);
                    GameManager.getInstance().checkEnterRoom = false;
                break;
            case this._buttons.detailBtn_Off:
                this._detailsNode.detail.setVisible(false);
                GameManager.getInstance().SignUpRoom.setMsgOpen(false);
                break;
        }

        sender._isClick = false;
        sender.getChildByName("_sp").setTexture(pics[0].getTexture());

    },

    enterBtn: function (sender) {
        var pics = this.checkBtn(sender);
            if (sender._isClick) {
                sender.getChildByName("_sp").setTexture(pics[1].getTexture());
                return;
            }
            sender.getChildByName("_sp").setTexture(pics[2].getTexture());
    },

    overBtn: function (sender) {
            var pics = this.checkBtn(sender);

            sender._isClick = false;
            sender.getChildByName("_sp").setTexture(pics[0].getTexture());
    },

    checkBtn: function (sender) {
        var pics = null;
        switch (sender) {
            case this._buttons.signUpBtn:
                pics = this._btnImgs.signUpImg;
                break;
            case this._buttons.standbyBtn:
                pics = this._btnImgs.standByImg;
                break;
            case this._buttons.detailBtn_Off:
                pics = this._btnImgs.exitImg;
                break;
        }

        return pics;
    },

    update: function () {
        var SignUpCost = this._RoomInfo.RegisterFee - this._RoomInfo.Service_fee;

        this._msgTitleNode.Detail.setString(language_manager.getInstance().getTextID(46));
        this._msgTitleNode.BaccaratGame.setString(language_manager.getInstance().getTextID(30) + SignUpCost + language_manager.getInstance().getTextID(31));
        this._msgTitleNode.TotalRound.setString(language_manager.getInstance().getTextID(50) + (this._RoomInfo.Total_Turn+1) * 3);
        this._msgTitleNode.TotalPool.setString(language_manager.getInstance().getTextID(29));
        this._msgTitleNode.SignUpCost.setString(language_manager.getInstance().getTextID(33) + SignUpCost + "+" + this._RoomInfo.Service_fee + language_manager.getInstance().getTextID(34));
        this._msgTitleNode.StartingPoints.setString(language_manager.getInstance().getTextID(47) + " 300000");
        this._msgTitleNode.BetLimit.setString(language_manager.getInstance().getTextID(48));
        this._msgTitleNode.EnrolledPlayers.setString(language_manager.getInstance().getTextID(49) + " " + this._RoomInfo.RegisteredPlayers + " / " + this._RoomInfo.TotalTickets);
        this._msgTitleNode.GameMaxCycle.setString(language_manager.getInstance().getTextID(51) + " " + (this._RoomInfo.Total_Turn+1));
        this._msgTitleNode.PlayerPerTable.setString(language_manager.getInstance().getTextID(52) + " " + "3");
        this._msgTitleNode.NO1.setString(language_manager.getInstance().getTextID(59));
        this._msgTitleNode.NO2.setString(language_manager.getInstance().getTextID(60));
        this._msgTitleNode.NO3.setString(language_manager.getInstance().getTextID(61));
        this._msgTitleNode.AwardStructure.setString(language_manager.getInstance().getTextID(58));
        this._msgTitleNode.MaxPass.setString(language_manager.getInstance().getTextID(53) + this._RoomInfo.Pass_count);
        this._msgTitleNode.MaxBlind.setString(language_manager.getInstance().getTextID(54) + this._RoomInfo.Hide_count);
        this._msgTitleNode.GameRule.setString(language_manager.getInstance().getTextID(57));
        this._msgTitleNode.Notice.setString(language_manager.getInstance().getTextID(55) + " " + language_manager.getInstance().getTextID(56));
        this._msgTitleNode.AwardStructure.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);

        if (this._roomMsg != null)
            switch (this._roomMsg.Status) {
                case "Enrolling":
                    this._msgTitleNode.txt_SignUp.setString(language_manager.getInstance().getTextID(37));
                    break;
                case "Running":
                    this._msgTitleNode.txt_SignUp.setString(language_manager.getInstance().getTextID(41));
                    break;
            }
    },

    updateMessage: function (roomMsg) {

        this._roomMsg = roomMsg;

        this._RoomInfo.RegisterFee = roomMsg.RegisterFee;
        this._RoomInfo.Service_fee = roomMsg.Service_fee;
        this._RoomInfo.RegisteredPlayers = roomMsg.RegisteredPlayers.length;
        this._RoomInfo.TotalTickets = roomMsg.TotalTickets;
        this._RoomInfo.Total_Turn = roomMsg.Total_Turn;
        this._RoomInfo.Pass_count = roomMsg.PassCount;
        this._RoomInfo.Hide_count = roomMsg.HideCount;

        this._msgTxtNode.txt_BetLimit.setString(roomMsg.MinBet + " - " + roomMsg.MaxBet);
        this._msgTxtNode.PoolMoney.setString("@#FEBD01"+roomMsg.TotalReward);
        this._msgTxtNode.txt_NO1.setString(roomMsg.RankReward[0]);
        this._msgTxtNode.txt_NO2.setString("@#D2CDBA" + roomMsg.RankReward[1]);
        this._msgTxtNode.txt_NO3.setString("@#DA7050" + roomMsg.RankReward[2]);

        var Count =177;
        for (var i = 3; i < roomMsg.RankReward.length; i++) {
            Count+=1;
            this._msgTxtNode["txt_NO" + (i+1)].setString(language_manager.getInstance().getTextID(Count) + "    " + roomMsg.RankReward[i]);
        }

        this._msgTitleNode.txt_Contest.setString(language_manager.getInstance().getTextID(75) + " " + roomMsg.SessionID);
        this._msgTitleNode.txt_Round.setString(language_manager.getInstance().getTextID(51) + " " + (roomMsg.Total_Turn+1));

        this._msgTxtNode.PoolMoney._text_richText_context.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);

        this._msgTxtNode.txt_NO1.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);


        switch (roomMsg.Status) {
            case "Enrolling":
                this._buttons.signUpBtn.setVisible(true);
                this._buttons.standbyBtn.setVisible(false);
                this._msgTitleNode.txt_Contest.setVisible(false);
                this._msgTitleNode.txt_Round.setVisible(false);
                break;
            case "Running":
                this._buttons.signUpBtn.setVisible(false);
                this._buttons.standbyBtn.setVisible(true);
                this._msgTitleNode.txt_Contest.setVisible(true);
                this._msgTitleNode.txt_Round.setVisible(true);
                break;
        }
    }
});