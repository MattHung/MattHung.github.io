/**
 * Created by jeff_chien on 2016/12/22.
 */

var uiSignUpArea = gameLayer.extend({
    _deviation: 0,
    _distance: 168.5,
    _StatusBarWidth: 180,
    _trunCount: 0,
    _roomMsg: null,
    _roomNode: null,
    _roomNo: null,
    _roomID: null,
    _targetScrollView: null,
    _baseNode: null,
    _detailsNode: null,
    _buttons: null,
    _playerListScrollBar: null,
    _playerScroll: null,
    _time: null,
    _playerMessageUI: null,
    _gameStatus: null,
    _loadingBarSamplePic: null,
    _playerListMask: null,
    _btnImgs: null,
    _barPic: null,
    uiMsg: null,
    roomName: null,
    playerDataMemory: [],
    mouseCheck: null,

    ctor: function (roomNode, roomMsg, roomNo, scrollView) {
        this._super(roomNode);
        this._roomNode = roomNode;
        this._roomMsg = roomMsg;
        this._roomNo = roomNo;
        this._roomID = roomMsg.RoomID;
        this._targetScrollView = scrollView;

        this.initialBaseNode();
        this.initialDetailNode();
        this.initialBtnImg();

        this._distance = this._baseNode.bg.height + 2.5;

        this.createRoom();

        this.initialUI();
        this.initialBtn();
        this.initialPlayerScrollView();
        this.initialScrollBar();
        this.initialStatusBar();
        this.initialUIMsgNode();
        this.languageUIMsg();

        this.updateMessage(roomMsg);
        this.initialVisible();
        this.settingMouseCheck();
    },

    initialBaseNode: function () {
        this._baseNode = {};
        var point = new gameLayer();
        point.setName("room_" + this._roomNo);
        this.roomName = "room_" + this._roomNo;
        this._targetScrollView.addChild(point);
        this._baseNode["room_" + this._roomNo] = this._targetScrollView.getChildByName("room_" + this._roomNo);
        this._baseNode["room_" + this._roomNo].removeAllChildren();

        this._baseNode.bg = this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/Gaming_Node/Sample/bg");
        this._baseNode.detail = this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/Gaming_Node/Sample/Btn_Search");
        this._baseNode.tittle = this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/Gaming_Node/Sample/Tittle_Node");
        this._baseNode.signUpMsg = this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/Gaming_Node/Sample/SignUp_Node");
        this._baseNode.gameStatus = this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/Gaming_Node/Sample/GameStatus_Node");
        // this._baseNode.timeStatus = this.getNode("RoomInfo_Node/"+this._targetScrollView.getName()+"/Sample/WaitNewGame_Node");
        this._baseNode.playing = this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/Gaming_Node/Sample/Playing_Node");
        this._baseNode.SampleTexture = this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/Gaming_Node/Sample/Btn_Textures");
        this._baseNode.listBar = this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/Gaming_Node/Sample/List_Bar_Node");
    },

    initialBtnImg: function () {
        this._btnImgs = {};
        this._btnImgs.signUpImg = this._baseNode.SampleTexture.getChildByName("Btn_SignUpPic").getChildren();
        this._btnImgs.standByImg = this._baseNode.SampleTexture.getChildByName("Btn_StandByPic").getChildren();
        this._btnImgs.detailImg = this._baseNode.SampleTexture.getChildByName("Btn_DetailsPic").getChildren();
        this._btnImgs.quitImg = this._baseNode.SampleTexture.getChildByName("Btn_QuitPic").getChildren();
    },

    settingMouseCheck: function () {
        this.mouseCheck = {};
        this.mouseCheck.button = null;
        this.mouseCheck.position = null;
        this.mouseCheck.enter = false;
        this.mouseCheck.over = false;

    },

    createRoom: function () {

        var _bg = cc.Sprite.create(this._baseNode.bg.getTexture());
        var point = new cc.Node();
        point.setName(this._baseNode.bg.getName());
        this._baseNode["room_" + this._roomNo].addChild(point);
        _bg.setPosition(this._baseNode.bg.getPosition().x, this._baseNode.bg.getPosition().y + this._targetScrollView.getInnerContainerSize().height - this._deviation - this._distance * (this._roomNo + 2));
        point.addChild(_bg);

        var _detail = this._baseNode.detail.clone();
        _detail.setName(this._baseNode.detail.getName());
        this._baseNode["room_" + this._roomNo].addChild(_detail);
        _detail.setPosition(this._baseNode.detail.getPosition().x, this._baseNode.detail.getPosition().y + this._targetScrollView.getInnerContainerSize().height - this._deviation - this._distance * (this._roomNo + 2));

        var _tittle = this._baseNode.tittle.getChildren();
        var point = new cc.Node();
        point.setName(this._baseNode.tittle.getName());
        this._baseNode["room_" + this._roomNo].addChild(point);
        for (var i = 0; i < _tittle.length; i++) {
            var clone = _tittle[i].clone();
            clone.setPosition(_tittle[i].getPosition().x, _tittle[i].getPosition().y + this._targetScrollView.getInnerContainerSize().height - this._deviation - this._distance * (this._roomNo + 2));
            clone.setName(_tittle[i].getName());
            point.addChild(clone);
        }

        var point = new cc.Node();
        point.setName(this._baseNode.signUpMsg.getName());
        this._baseNode["room_" + this._roomNo].addChild(point);
        var _sampleScroll = this._baseNode.signUpMsg.getChildByName("PlayerScroll");
        var playerScroll = _sampleScroll.clone();
        playerScroll.setName(_sampleScroll.getName());
        point.addChild(playerScroll);

        var _gameStatus = this._baseNode.gameStatus.getChildren();
        var point = new cc.Node();
        point.setName(this._baseNode.gameStatus.getName());
        this._baseNode["room_" + this._roomNo].addChild(point);
        for (var i = 0; i < _gameStatus.length; i++) {
            var clone = _gameStatus[i].clone();
            clone.setPosition(_gameStatus[i].getPosition().x, _gameStatus[i].getPosition().y + this._targetScrollView.getInnerContainerSize().height - this._deviation - this._distance * (this._roomNo + 2));
            clone.setName(_gameStatus[i].getName());
            point.addChild(clone);
        }

        // var _timeStatus = this._baseNode.timeStatus.getChildren();
        // var point = new cc.Node();
        // point.setName(this._baseNode.timeStatus.getName());
        // this._baseNode["room_" + this._roomNo].addChild(point);
        // for (var i = 0; i < _timeStatus.length; i++) {
        //     if (_timeStatus[i] instanceof cc.Sprite) {
        //         var _sp = cc.Sprite.create(_timeStatus[i].getTexture());
        //         _sp.setPosition(_timeStatus[i].getPosition().x, _timeStatus[i].getPosition().y - this._roomNo * this._distance);
        //         _sp.setScale(0.5);
        //         _sp.setName(_timeStatus[i].getName());
        //         point.addChild(_sp);
        //         continue;
        //     }
        //
        //     var clone = _timeStatus[i].clone();
        //     clone.setPosition(_timeStatus[i].getPosition().x, _timeStatus[i].getPosition().y - this._roomNo * this._distance);
        //     clone.setName(_timeStatus[i].getName());
        //     point.addChild(clone);
        // }


        var point = new cc.Node();
        point.setName(this._baseNode.playing.getName());
        this._baseNode["room_" + this._roomNo].addChild(point);

        var listMask = this.getNode("RoomInfo_Node/Gaming_Scroll/Gaming_Node/Sample/bg_list_mask");
        this._playerListMask = {};
        if (listMask != null) {
            this._playerListMask.bottom = cc.Sprite.create(listMask.getTexture());
            this._playerListMask.bottom.setVisible(true);
            this._playerListMask.bottom.setPosition(listMask.getPositionX(),
                listMask.getPositionY() + this._targetScrollView.getInnerContainerSize().height - this._deviation - this._distance * (this._roomNo + 2) - 1);
            this._playerListMask.bottom.setName("room_" + this._roomNo + " playerListMask.bottom");
            this._baseNode["room_" + this._roomNo].addChild(this._playerListMask.bottom, 0, "maskBottom");

            this._playerListMask.top = cc.Sprite.create(listMask.getTexture());
            this._playerListMask.top.setVisible(false);
            this._playerListMask.top.setFlippedY(true);
            this._playerListMask.top.setPosition(listMask.getPositionX(),
                listMask.getPositionY() + this._targetScrollView.getInnerContainerSize().height - this._deviation - this._distance * (this._roomNo + 2) + _sampleScroll.height - listMask.height + 1);
            this._playerListMask.bottom.setName("room_" + this._roomNo + " playerListMask.top");
            this._baseNode["room_" + this._roomNo].addChild(this._playerListMask.top, 0, "maskTop");
        }

        var _listBar = this._baseNode.listBar.getChildren();
        var point = new cc.Node();
        point.setName(this._baseNode.listBar.getName());
        this._baseNode["room_" + this._roomNo].addChild(point);
        for (var i = 0; i < _listBar.length; i++) {
            if (_listBar[i] instanceof cc.Sprite) {
                var _sp = cc.Sprite.create(_listBar[i].getTexture());
                _sp.setPosition(_listBar[i].getPosition().x, _listBar[i].getPosition().y + this._targetScrollView.getInnerContainerSize().height - this._deviation - this._distance * (this._roomNo + 2));
                _sp.setName(_listBar[i].getName());
                point.addChild(_sp);
                continue;
            }

            var clone = _listBar[i].clone();
            clone.setPosition(_listBar[i].getPosition().x, _listBar[i].getPosition().y + this._targetScrollView.getInnerContainerSize().height - this._deviation - this._distance * (this._roomNo + 2));
            clone.setName(_listBar[i].getName());
            point.addChild(clone);
        }
    },

    initialDetailNode: function () {
        this._detailsNode = {};
        this._detailsNode.detail = this.getNode("Details_Node");
    },

    initialUI: function () {
        this._time = {};
        this._time.min = this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/" + ("room_" + this._roomNo) + "/WaitNewGame_Node/CountDown_Min");
        this._time.sec = this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/" + ("room_" + this._roomNo) + "/WaitNewGame_Node/CountDown_Sec");
        this._time.colon = this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/" + ("room_" + this._roomNo) + "/WaitNewGame_Node/colon");
        this._time.waitNewGame = this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/" + ("room_" + this._roomNo) + "/WaitNewGame_Node/waitNewGame");

        this._playerMessageUI = {};
        this._playerMessageUI.signUpPlayerText = this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/" + ("room_" + this._roomNo) + "/Tittle_Node/SignUpPopulation");
        this._playerMessageUI.gameWaitingPlayer = this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/" + ("room_" + this._roomNo) + "/Tittle_Node/GamePlayer");

        this._gameStatus = {};
        this._gameStatus.roomMsgText = this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/" + ("room_" + this._roomNo) + "/GameStatus_Node/full");
        this._gameStatus.sessionID = this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/" + ("room_" + this._roomNo) + "/GameStatus_Node/GameNumber");
        this._gameStatus.roomMsgText.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);

        this._barPic = {};
        this._barPic.bg = this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/" + ("room_" + this._roomNo) + "/List_Bar_Node/bg_listl_bar");
        this._barPic.slider = this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/" + ("room_" + this._roomNo) + "/List_Bar_Node/Btn_list");
    },

    initialScrollBar: function () {
        this._playerListScrollBar = new uiScrollBar(this._roomNode, this._targetScrollView, this._playerScroll, this._barPic.bg, this._barPic.slider);

        this._barPic.bg.setVisible(false);
        this._barPic.slider.setVisible(false);

        this.registerMouseEvent(this._playerScroll,
            null,
            null,
            function (sender) {
                if (this._playerListScrollBar.barScaleY < this._barPic.bg.height / this._barPic.slider.height) {
                    this._barPic.bg.setVisible(true);
                    this._barPic.slider.setVisible(true);
                }
            }.bind(this),
            function (sender) {
                this._barPic.bg.setVisible(false);
                this._barPic.slider.setVisible(false);
            }.bind(this)
        );

    },

    initialPlayerScrollView: function () {
        var _Deviation_SecScroll = 95;
        var _sampleScroll = this._baseNode.signUpMsg.getChildByName("PlayerScroll");
        var _playerMsgNode = _sampleScroll.getChildByName("playerNode");
        var winBgSample = _playerMsgNode.getChildByName("Signup_BG");
        var topLine = _playerMsgNode.getChildByName("Signup_BGLine");
        var _dis = winBgSample.height;

        this._playerScroll = this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/" + ("room_" + this._roomNo) + "/SignUp_Node/PlayerScroll");
        this._playerScroll.setDirection(ccui.ScrollView.DIR_VERTICAL);
        this._playerScroll.setVisible(true);
        // this._playerScroll.setBounceEnabled(true);
        this._playerScroll.setAnchorPoint(cc.p(0, 0));
        this._playerScroll.setContentSize(cc.size(_sampleScroll.width, _sampleScroll.height));
        this._playerScroll.setScrollBarEnabled(false);

        var len = this._roomMsg.RegisteredPlayers.length % 2 == 0 ? this._roomMsg.RegisteredPlayers.length / 2 : Math.floor(this._roomMsg.RegisteredPlayers.length / 2) + 1;

        this._playerScroll.setInnerContainerSize(cc.size(_playerMsgNode.getChildByName("Signup_BG").width, _dis * len));
        this._playerScroll.y = _sampleScroll.getPositionY() + this._targetScrollView.getInnerContainerSize().height - this._deviation - this._distance * (this._roomNo + 2);
        this._playerScroll.x = _sampleScroll.getPositionX();

        this._playerScroll.removeAllChildren();

        if (len < 3)
            for (var i = 0; i < 3; i++) {
                var _sp1 = cc.Sprite.create(winBgSample.getTexture());
                _sp1.setVisible(true);
                _sp1.setPosition(winBgSample.getPositionX(), winBgSample.getPositionY() + this._playerScroll.getInnerContainerSize().height - i * (_sp1.height -1) - _Deviation_SecScroll);
                this._playerScroll.addChild(_sp1);
            }
        else
            for (var i = 0; i < len; i++) {
                var _sp1 = cc.Sprite.create(winBgSample.getTexture());
                _sp1.setVisible(true);
                _sp1.setPosition(winBgSample.getPositionX(), winBgSample.getPositionY() + this._playerScroll.getInnerContainerSize().height - i * (_sp1.height -1) - _Deviation_SecScroll);
                this._playerScroll.addChild(_sp1);
            }

        var tp = cc.Sprite.create(topLine.getTexture());
        tp.setPosition(topLine.getPositionX(),
            topLine.getPositionY() + this._playerScroll.getInnerContainerSize().height - _Deviation_SecScroll);
        this._playerScroll.addChild(tp);

        this._playerScroll.jumpToTop();

        this.settingPlayerData(_playerMsgNode, _Deviation_SecScroll, winBgSample.height);
    },

    settingPlayerData: function (playerMsgNode, Deviation_SecScroll, txtHeight) {
        var playerNode_1 = playerMsgNode.getChildByName("player1_Node").getChildByName("player_ID");
        var playerNode_2 = playerMsgNode.getChildByName("player2_Node").getChildByName("player_ID");
        playerNode_1.setString(this._roomMsg.RegisteredPlayers[0]);
        var playerData = new Array(this._roomMsg.RegisteredPlayers.length);

        for (var i = playerData.length-1; i >= 0; i--) {
            var txtName = playerNode_1.clone();
            txtName.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            var nameToCharArray = this._roomMsg.RegisteredPlayers[i].split('');
            var name = "***";
            for (var j = nameToCharArray.length - 3; j < nameToCharArray.length; j++) {
                name += nameToCharArray[j];
            }
            txtName.setString(name);
            if (i % 2 == 0)
                txtName.setPosition(playerNode_1.getPositionX(), playerNode_1.getPositionY() + this._playerScroll.getInnerContainerSize().height - Deviation_SecScroll - i / 2 * (txtHeight - 1));
            else
                txtName.setPosition(playerNode_2.getPositionX(), playerNode_2.getPositionY() + this._playerScroll.getInnerContainerSize().height - Deviation_SecScroll - Math.floor(i / 2) * (txtHeight - 1));
            this._playerScroll.addChild(txtName);
            playerData[i] = txtName;
        }
    },

    initialUIMsgNode: function () {
        this.uiMsg = {};

        this.uiMsg.BaccaratGame = new CocosWidget.TextField();
        this.uiMsg.BaccaratGame.setAnchorPoint(cc.p(0.5,0.5));
        this.uiMsg.BaccaratGame.setFontSize(16);
        this.uiMsg.BaccaratGame.setPosition(280, 238 + this._targetScrollView.getInnerContainerSize().height - this._deviation - this._distance * (this._roomNo + 2));
        this.uiMsg.BaccaratGame.setSize(250, 32);

        this.uiMsg.winnerBonus = new CocosWidget.TextField();
        this.uiMsg.winnerBonus.setAnchorPoint(cc.p(0.5,0.5));
        this.uiMsg.winnerBonus.setFontSize(14);
        this.uiMsg.winnerBonus.setPosition(280, 216 + this._targetScrollView.getInnerContainerSize().height - this._deviation - this._distance * (this._roomNo + 2));
        this.uiMsg.winnerBonus.setSize(250, 32);

        this.uiMsg.SignupCost = new CocosWidget.TextField();
        this.uiMsg.SignupCost.setAnchorPoint(cc.p(0.5,0.5));
        this.uiMsg.SignupCost.setFontSize(14);
        this.uiMsg.SignupCost.setPosition(280, 196 + this._targetScrollView.getInnerContainerSize().height - this._deviation - this._distance * (this._roomNo + 2));
        this.uiMsg.SignupCost.setSize(250, 32);

        this.uiMsg.SignupNum = new CocosWidget.TextField();
        this.uiMsg.SignupNum.setAnchorPoint(cc.p(0.5,0.5));
        this.uiMsg.SignupNum.setFontSize(14);
        this.uiMsg.SignupNum.setPosition(280, 176 + this._targetScrollView.getInnerContainerSize().height - this._deviation - this._distance * (this._roomNo + 2));
        this.uiMsg.SignupNum.setSize(250, 32);

        this.uiMsg.totalBonus = new CocosWidget.TextField();
        this.uiMsg.totalBonus.setAnchorPoint(cc.p(0.5, 0.5));
        this.uiMsg.totalBonus.setFontSize(40);
        this.uiMsg.totalBonus.setPosition(72, 155 + this._targetScrollView.getInnerContainerSize().height - this._deviation - this._distance * (this._roomNo + 2));
        this.uiMsg.totalBonus.setSize(250, 78);
        this.uiMsg.totalBonus._text_richText_context.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);

        this.uiMsg.msgText = new CocosWidget.TextField();
        this.uiMsg.msgText.setAnchorPoint(cc.p(0.5, 0.5));
        this.uiMsg.msgText.setFontSize(14);
        this.uiMsg.msgText.setPosition(565, 153 + this._targetScrollView.getInnerContainerSize().height - this._deviation - this._distance * (this._roomNo + 2));
        this.uiMsg.msgText.setSize(150, 30);
        this.uiMsg.msgText._text_richText_context.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);

        this.uiMsg.signUpText = new CocosWidget.TextField();
        this.uiMsg.signUpText.setAnchorPoint(cc.p(0.5, 0.5));
        this.uiMsg.signUpText.setFontSize(14);
        this.uiMsg.signUpText.setPosition(549, 250 + this._targetScrollView.getInnerContainerSize().height - this._deviation - this._distance * (this._roomNo + 2));
        this.uiMsg.signUpText.setSize(180, 16);

        this._baseNode["room_" + this._roomNo].addChild(this.uiMsg.BaccaratGame);
        this._baseNode["room_" + this._roomNo].addChild(this.uiMsg.winnerBonus);
        this._baseNode["room_" + this._roomNo].addChild(this.uiMsg.SignupCost);
        this._baseNode["room_" + this._roomNo].addChild(this.uiMsg.SignupNum);
        this._baseNode["room_" + this._roomNo].addChild(this.uiMsg.totalBonus);
        this._baseNode["room_" + this._roomNo].addChild(this.uiMsg.msgText);
        this._baseNode["room_" + this._roomNo].addChild(this.uiMsg.signUpText);

        this.uiMsg.TotalPool = this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/" + ("room_" + this._roomNo) + "/Tittle_Node/TotalPool");
    },

    languageUIMsg:function () {
        this.uiMsg.BaccaratGame.setString(language_manager.getInstance().getTextID(30)+(this._roomMsg.RegisterFee - this._roomMsg.Service_fee)+language_manager.getInstance().getTextID(31));
        this.uiMsg.winnerBonus.setString(language_manager.getInstance().getTextID(32) + " " + "@#F1CB3E" + this._roomMsg.RankReward[0]);
        this.uiMsg.SignupCost.setString(language_manager.getInstance().getTextID(33)+" "+"@#E3DB92"+(this._roomMsg.RegisterFee - this._roomMsg.Service_fee)+"+"+this._roomMsg.Service_fee+language_manager.getInstance().getTextID(34));
        this.uiMsg.TotalPool.setString(language_manager.getInstance().getTextID(29));
        this.uiMsg.SignupNum.setString(language_manager.getInstance().getTextID(35) + " " + "@#FFBF00" + this._roomMsg.RegisteredPlayers.length + "/" + this._roomMsg.TotalTickets);
        this._gameStatus.sessionID.setString("(" + language_manager.getInstance().getTextID(38) + this._roomMsg.SessionID + ")");
        this.uiMsg.TotalPool.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this._gameStatus.sessionID.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);
        this.uiMsg.totalBonus.setString("@#FFBF00" + this._roomMsg.TotalReward);
        this.uiMsg.msgText.setString("@#B2A379" + language_manager.getInstance().getTextID(42) + (this._roomMsg.Turn_Count + 1) + language_manager.getInstance().getTextID(43));

        if (this._roomMsg.Status == "Running") {
            this._gameStatus.roomMsgText.setString(language_manager.getInstance().getTextID(41));
            this.uiMsg.signUpText._text_richText_context.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            this.uiMsg.signUpText.setString("@#999999" + language_manager.getInstance().getTextID(40));
        } else {
            if (this._roomMsg.Quit == true)
                this._gameStatus.roomMsgText.setString(language_manager.getInstance().getTextID(150));
            else {
                if (this._roomMsg.RegisteredPlayers.length == this._roomMsg.TotalTickets)
                    this._gameStatus.roomMsgText.setString(language_manager.getInstance().getTextID(102));
                else
                    this._gameStatus.roomMsgText.setString(language_manager.getInstance().getTextID(37));
            }
           
            switch (this._roomMsg.Type) {
                case 0:
                    break;
                case 1:
                    this.uiMsg.signUpText._text_richText_context.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
                    this.uiMsg.signUpText.setString("@#999999" + language_manager.getInstance().getTextID(36));
                    break;
                case 2:
                    this.uiMsg.signUpText._text_richText_context.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
                    this.uiMsg.signUpText.setString("@#999999"+language_manager.getInstance().getTextID(176) + "            " + "@#FFFFFF"+this._roomMsg.StartTime);
                    break;
            }
        }
    },

    initialBtn: function () {
        if (this._buttons == null)
            this._buttons = [];
        this._buttons.push(this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/" + ("room_" + this._roomNo) + "/GameStatus_Node/Btn_signUP"));
        this._buttons.push(this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/" + ("room_" + this._roomNo) + "/GameStatus_Node/Btn_onlooker"));
        this._buttons.push(this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/" + ("room_" + this._roomNo) + "/Btn_Search"));
        this._buttons.push(this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/" + ("room_" + this._roomNo) + "/GameStatus_Node/Btn_quit"));
        this._buttons.push(this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/" + ("room_" + this._roomNo) + "/GameStatus_Node/Btn_full"));

        this._buttons.signUpBtn = this._buttons[0];
        this._buttons.standbyBtn = this._buttons[1];
        this._buttons.detailBtn_On = this._buttons[2];
        this._buttons.quitBtn = this._buttons[3];
        this._buttons.fulledBtn = this._buttons[4];

        for (var i = 0; i < this._buttons.length - 1; i++) {
            var _sp = cc.Sprite.create(this.checkBtnPic(this._buttons[i])[0].getTexture());
            _sp.setName("_sp");
            _sp.setAnchorPoint(0, 0);
            _sp.setPosition(0, 0);
            this._buttons[i].addChild(_sp);
        }

        this._buttons.signUpBtn._isClick = false;
        this._buttons.standbyBtn._isClick = false;
        this._buttons.fulledBtn._isClick = false;
        this._buttons.detailBtn_On._isClick = false;

        this.registerMouseEvent(this._buttons.signUpBtn,
            this.downBtn.bind(this),
            this.upBtn.bind(this),
            this.enterBtn.bind(this),
            this.overBtn.bind(this));

        this.registerMouseEvent(this._buttons.standbyBtn,
            this.downBtn.bind(this),
            this.upBtn.bind(this),
            this.enterBtn.bind(this),
            this.overBtn.bind(this));

        this.registerMouseEvent(this._buttons.detailBtn_On,
            this.downBtn.bind(this),
            this.upBtn.bind(this),
            this.enterBtn.bind(this),
            this.overBtn.bind(this));
        var mousePos = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            posM: null,

            onMouseMove: function (event) {
                this.mouseCheck.position = event.getLocation();
                return false;
            }.bind(this),
        });
        cc.eventManager.addListener(mousePos, this._buttons.detailBtn_On);
    },

    downBtn: function (sender) {
        var pics = this.checkBtnPic(sender);
        if (!GameManager.getInstance().SignUpRoom.getMsgOpen()) {
            sender._isClick = true;
            sender.getChildByName("_sp").setTexture(pics[1].getTexture());
            this.enterBtn(sender);
        }
    },

    upBtn: function (sender) {
        var pics = this.checkBtnPic(sender);
        if (!sender._isClick)return;
        switch (sender) {
            case this._buttons.signUpBtn:
                if (!GameManager.getInstance().SignUpRoom.getMsgOpen()) {
                    GameManager.getInstance().SignUpRoom.showEnterOption(155, 156, this._roomMsg.RoomID, this._roomMsg, 37, 149);
                    GameManager.getInstance().SignUpRoom.setMsgOpen(true);
                }
                break;
            case this._buttons.standbyBtn:
                if (!GameManager.getInstance().SignUpRoom.getMsgOpen() && GameManager.getInstance().checkEnterRoom) {
                    baccaratPeer.getInstance().sendMessage("EnterRoom", {RoomID: this._roomMsg.RoomID});
                    GameManager.getInstance().SignUpRoom.setRoomSelect(this._roomMsg);
                    GameManager.getInstance().checkEnterRoom = false;
                }
                break;
            case this._buttons.detailBtn_On:
                this.detailOn();
                break;
            case this._buttons.quitBtn:
                break;
        }

        sender._isClick = false;
        sender.getChildByName("_sp").setTexture(pics[0].getTexture());
    },

    enterBtn: function (sender) {
        var pics = this.checkBtnPic(sender);
        if (sender == this._buttons.detailBtn_On) {
            this.mouseCheck.enter = true;
            return;
        }

        if (!GameManager.getInstance().SignUpRoom.getMsgOpen()) {
            if (sender._isClick) {
                sender.getChildByName("_sp").setTexture(pics[1].getTexture());
                return;
            }
            sender.getChildByName("_sp").setTexture(pics[2].getTexture());
        }
    },

    overBtn: function (sender) {
        var pics = this.checkBtnPic(sender);
        if (sender == this._buttons.detailBtn_On) {
            this.mouseCheck.enter = false;
        }

        if (!GameManager.getInstance().SignUpRoom.getMsgOpen()) {
            sender._isClick = false;
            sender.getChildByName("_sp").setTexture(pics[0].getTexture());
        }
    },

    checkBtnPic: function (sender) {
        var pics = null;
        switch (sender) {
            case this._buttons.signUpBtn:
                pics = this._btnImgs.signUpImg;
                break;
            case this._buttons.standbyBtn:
                pics = this._btnImgs.standByImg;
                break;
            case this._buttons.detailBtn_On:
                pics = this._btnImgs.detailImg;
                break;
            case this._buttons.quitBtn:
                pics = this._btnImgs.quitImg;
                break;
        }

        return pics;
    },

    detailOn: function () {
        if (eventInTransparentMask(this._buttons.detailBtn_On, this.mouseCheck.position))
            return;
        this._detailsNode.detail.setVisible(true);
        GameManager.getInstance().SignUpRoom.uiDetail.updateMessage(this._roomMsg);
        GameManager.getInstance().SignUpRoom.setMsgOpen(true);
    },

    initialStatusBar: function () {
        if (this._targetScrollView.getName() != "IntheContest_Scroll")return;
        var playing_Node = this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/" + ("room_" + this._roomNo) + "/Playing_Node");
        var point = new cc.Node();
        point.setName("StatusBar");
        playing_Node.addChild(point);

        this._gameStatus.statusBar = this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/" + ("room_" + this._roomNo) + "/Playing_Node/StatusBar");

        this._loadingBarSamplePic = {};
        this._loadingBarSamplePic.bg_Dot = this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/Gaming_Node/Sample/Playing_Node/LoadingBar_Node/Bg/Group/dot");// 16 * 16
        this._loadingBarSamplePic.bg_Line = this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/Gaming_Node/Sample/Playing_Node/LoadingBar_Node/Bg/Group/line");// 20 * 4
        this._loadingBarSamplePic.bg_End = this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/Gaming_Node/Sample/Playing_Node/LoadingBar_Node/Bg/End");// 28 * 28
        this._loadingBarSamplePic.light_Dot = this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/Gaming_Node/Sample/Playing_Node/LoadingBar_Node/Light/Group/dot");
        this._loadingBarSamplePic.light_Line = this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/Gaming_Node/Sample/Playing_Node/LoadingBar_Node/Light/Group/line");
        this._loadingBarSamplePic.light_End = this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/Gaming_Node/Sample/Playing_Node/LoadingBar_Node/Light/End");

        var point = new cc.Node();
        point.setName("bg");
        this._gameStatus.statusBar.addChild(point);

        var totalRoundCount = this._roomMsg.Total_Turn + 1;
        var scaleX_Size = this._StatusBarWidth / (totalRoundCount - 1) / this._loadingBarSamplePic.bg_Line.width;
        var posX = this._loadingBarSamplePic.bg_Line.getPosition().x;

        for (var i = 0; i < totalRoundCount - 1; i++) {
            var cloneLine = cc.Sprite.create(this._loadingBarSamplePic.bg_Line.getTexture());
            cloneLine.setPosition(posX, this._loadingBarSamplePic.bg_Line.getPosition().y + this._targetScrollView.getInnerContainerSize().height - this._deviation - this._distance * (this._roomNo + 2));
            cloneLine.setAnchorPoint(0, 0.5);
            cloneLine.setScaleX(scaleX_Size);
            point.addChild(cloneLine);

            var cloneDot = cc.Sprite.create(this._loadingBarSamplePic.bg_Dot.getTexture());
            cloneDot.setPosition(posX, this._loadingBarSamplePic.bg_Dot.getPosition().y + this._targetScrollView.getInnerContainerSize().height - this._deviation - this._distance * (this._roomNo + 2));
            cloneDot.setAnchorPoint(0.5, 0.5);
            point.addChild(cloneDot);

            posX += this._loadingBarSamplePic.bg_Line.width * scaleX_Size;
        }

        var cloneEnd = cc.Sprite.create(this._loadingBarSamplePic.bg_End.getTexture());
        cloneEnd.setPosition(posX, this._loadingBarSamplePic.bg_Dot.getPosition().y + this._targetScrollView.getInnerContainerSize().height - this._deviation - this._distance * (this._roomNo + 2));
        cloneEnd.setAnchorPoint(0.5, 0.5);
        point.addChild(cloneEnd);

        this.settingStatusBar();

        var cloneDot = cc.Sprite.create(this._loadingBarSamplePic.light_Dot.getTexture());
        cloneDot.setPosition(this._loadingBarSamplePic.light_Line.getPosition().x, this._loadingBarSamplePic.light_Dot.getPosition().y + this._targetScrollView.getInnerContainerSize().height - this._deviation - this._distance * (this._roomNo + 2));
        cloneDot.setAnchorPoint(0.5, 0.5);
        point.addChild(cloneDot);
    },

    settingStatusBar: function () {
        if (this._targetScrollView.getName() != "IntheContest_Scroll")return;

        if (this._trunCount == this._roomMsg.Turn_Count + 1)return;
        this._trunCount = this._roomMsg.Turn_Count + 1;

        if (this._gameStatus.statusBar.getChildByName("light") == null) {
            var point = new cc.Node();
            point.setName("light");
            this._gameStatus.statusBar.addChild(point);
        } else {
            this._gameStatus.statusBar.getChildByName("light").removeAllChildrenWithCleanup(true);
        }

        var statusBar_light = this._gameStatus.statusBar.getChildByName("light");
        var posX = this._loadingBarSamplePic.light_Line.getPosition().x;
        var scaleX_Size = this._StatusBarWidth / (this._roomMsg.Total_Turn) / this._loadingBarSamplePic.light_Line.width;

        for (var i = 0; i < this._roomMsg.Turn_Count; i++) {
            var cloneLine = cc.Sprite.create(this._loadingBarSamplePic.light_Line.getTexture());
            cloneLine.setPosition(posX, this._loadingBarSamplePic.light_Line.getPosition().y + this._targetScrollView.getInnerContainerSize().height - this._deviation - this._distance * (this._roomNo + 2));
            cloneLine.setAnchorPoint(0, 0.5);
            cloneLine.setScaleX(scaleX_Size);
            statusBar_light.addChild(cloneLine);

            posX += this._loadingBarSamplePic.light_Line.width * scaleX_Size;

            if (i < this._roomMsg.Total_Turn - 1) {
                var cloneDot = cc.Sprite.create(this._loadingBarSamplePic.light_Dot.getTexture());
                cloneDot.setPosition(posX, this._loadingBarSamplePic.light_Dot.getPosition().y + this._targetScrollView.getInnerContainerSize().height - this._deviation - this._distance * (this._roomNo + 2));
                cloneDot.setAnchorPoint(0.5, 0.5);
                statusBar_light.addChild(cloneDot);
            } else {
                var cloneEnd = cc.Sprite.create(this._loadingBarSamplePic.light_End.getTexture());
                cloneEnd.setPosition(posX, this._loadingBarSamplePic.light_Dot.getPosition().y + this._targetScrollView.getInnerContainerSize().height - this._deviation - this._distance * (this._roomNo + 2));
                cloneEnd.setAnchorPoint(0.5, 0.5);
                statusBar_light.addChild(cloneEnd);
            }
        }
    },

    initialVisible: function () {
        var sample = this.getNode("RoomInfo_Node/" + this._targetScrollView.getName() + "/Gaming_Node/Sample");
        sample.setPosition(10000, 10000);
        sample.setVisible(true);
    },

    checkPlayerList: function (roomMsg) {
        var playerData = roomMsg.RegisteredPlayers;

        for (var i = 0; i < playerData.length; i++) {
            var match = false;

            for (var j = 0; j < this.playerDataMemory.length; j++) {
                if (playerData[i] != this.playerDataMemory[j])continue;
                match = true;
                break;
            }

            if (!match) {
                this.playerDataMemory = playerData;
                this.initialPlayerScrollView();
                this._playerListScrollBar.updateSlider();
                this._barPic.bg.setVisible(false);
                this._barPic.slider.setVisible(false);
                return;
            }
        }

        for (var i = 0; i < this.playerDataMemory.length; i++) {
            var match = false;

            for (var j = 0; j < playerData.length; j++) {
                if (this.playerDataMemory[i] != playerData[j])continue;
                match = true;
                break;
            }

            if (!match) {
                this.playerDataMemory = playerData;
                this.initialPlayerScrollView();
                this._playerListScrollBar.updateSlider();
                this._barPic.bg.setVisible(false);
                this._barPic.slider.setVisible(false);
                return;
            }
        }
    },

    updateRoom: function (dt) {
        var playerData = this._roomMsg.RegisteredPlayers;

        if (playerData.length > 6) {
            if (this._playerScroll.getInnerContainerPosition().y >= -3)
                this._playerListMask.bottom.setVisible(false);
            else
                this._playerListMask.bottom.setVisible(true);

            if (this._playerScroll.getInnerContainerPosition().y <= this._playerScroll.height - this._playerScroll.getInnerContainerSize().height + 3)
                this._playerListMask.top.setVisible(false);
            else
                this._playerListMask.top.setVisible(true);
        }

        if (this.mouseCheck.enter) {
            if (!eventInTransparentMask(this._buttons.detailBtn_On, this.mouseCheck.position)) {
                if (!GameManager.getInstance().SignUpRoom.getMsgOpen()) {
                    var pics = this.checkBtnPic(this._buttons.detailBtn_On);
                    if (this._buttons.detailBtn_On._isClick) {
                        this._buttons.detailBtn_On.getChildByName("_sp").setTexture(pics[1].getTexture());
                        return;
                    }
                    this._buttons.detailBtn_On.getChildByName("_sp").setTexture(pics[2].getTexture());
                }
            }

            if (eventInTransparentMask(this._buttons.detailBtn_On, this.mouseCheck.position)) {
                if (!GameManager.getInstance().SignUpRoom.getMsgOpen()) {
                    var pics = this.checkBtnPic(this._buttons.detailBtn_On);
                    this._buttons.detailBtn_On._isClick = false;
                    this._buttons.detailBtn_On.getChildByName("_sp").setTexture(pics[0].getTexture());
                }
            }
        }

        this._playerListScrollBar.update();
    },

    updateMessage: function (roomMsg) {
        this._roomMsg = roomMsg;
        this.checkPlayerList(roomMsg);

        this.languageUIMsg();
        this.settingStatusBar(roomMsg);

        this.uiMsg.SignupNum.setString(language_manager.getInstance().getTextID(35) + " " + "@#F1CB3E" + this._roomMsg.RegisteredPlayers.length + "/" + this._roomMsg.TotalTickets);

        switch (roomMsg.Status) {
            case "Running":
                this._buttons.signUpBtn.setVisible(false);
                this._buttons.standbyBtn.setVisible(true);
                this._buttons.fulledBtn.setVisible(false);
                this._buttons.quitBtn.setVisible(false);
                this._playerScroll.setVisible(false);
                this._barPic.bg.setVisible(false);
                this._barPic.slider.setVisible(false);
                this.uiMsg.msgText.setVisible(true);
                break;
            case "Enrolling":
                if (roomMsg.Quit == true) {
                    this._buttons.signUpBtn.setVisible(false);
                    this._buttons.fulledBtn.setVisible(false);
                    this._buttons.quitBtn.setVisible(true);
                } else if (roomMsg.RegisteredPlayers.length == roomMsg.TotalTickets) {
                    this._buttons.signUpBtn.setVisible(false);
                    this._buttons.fulledBtn.setVisible(true);
                    this._buttons.quitBtn.setVisible(false);
                } else {
                    this._buttons.signUpBtn.setVisible(true);
                    this._buttons.fulledBtn.setVisible(false);
                    this._buttons.quitBtn.setVisible(false);
                }
                this._buttons.standbyBtn.setVisible(false);
                this._playerScroll.setVisible(true);
                this.uiMsg.msgText.setVisible(false);
                break;
        }
    }
});