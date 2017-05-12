/**
 * Created by jeff_chien on 2016/11/23.
 */

var ui_TableArea = gameLayer.extend({//ChipsCoin
    _BYSTANDER: 7,
    _SPACE: 2.5,
    _VELOCITY: 0.1,
    _NO_SEAT: 4,
    _mainLayerNode: null,
    _mask: null,
    _tableMask: [],
    _betText: null,
    _room: null,
    _btnBetPos: {},
    _betMoney: {},
    _isShine: false,
    isPass: false,
    _betAreaHit: [],
    _betChipArray: [],
    _chipFinPos: cc.p(),
    _tableArea: {},
    quickBet: {},
    quickBetPos: {},
    mouseCheck: null,
    UnitCount: {
        "Unit_100000": 0,
        "Unit_50000": 1,
        "Unit_10000": 2,
        "Unit_5000": 3,
        "Unit_1000": 4,
        "Unit_500": 5,
        "Unit_100": 6,
        "Unit_50": 7,
        "Unit_10": 8,
        "Unit_5": 9,
        "Unit_1": 10
    },
    BetBtnNo: {
        Tie: 0, Play: 1, Bank: 2, BankerPairs: 3, PlayerPairs: 4, AnyPairs: 5, PerfectPairs: 6, Big: 7, Small: 8
    },
    betAreaBg: {},

    _text_images:null,

    ctor: function (mainNode, room) {
        this._super(mainNode);
        this._mainLayerNode = mainNode;
        this._room = room;
        this._mainLayerNode.getChildByName("Table_Node").addChild(this);

        this._betText = ccui.helper.seekWidgetByName(this._mainLayerNode.getChildByName("Table_Node"), "txt_Total_Money");

        this.initQuickBet();
        this.initialImgs();
        this.initialBetPosition();
        this.initialPlayerBankerBet();
        this.initTable();
        this.btnConstruct();
        this.settingMouseCheck();
        this.scheduleUpdate();
    },

    initQuickBet: function () {
        this.quickBet.parent_node = this.getNode("FastBet_Node");
        this.quickBet.background_mask = this.getNode("Table_Node/quick_mask");
        this.quickBet.btn_node = this.getNode("FastBet_Node/Btn_fastBet");
        this.quickBet.pic_hover = this.getNode("FastBet_Node/Btn_fastBet/Btn_fastBet_over");
        this.quickBet.pic_hover.setVisible(false);

        this.registerMouseEvent(this.quickBet.btn_node, function () {
            this.quickBet.pic_hover.setVisible(false);
        }.bind(this), function (node, mouseHitPoint) {
            this._room.uiBetChip.sendBet(node);
            node.setVisible(false);
        }.bind(this), function () {
            this.quickBet.pic_hover.setVisible(true);
        }.bind(this), function () {
            this.quickBet.pic_hover.setVisible(false);
        }.bind(this));

        this.registerMouseEvent(this.quickBet.background_mask,null,this.hideQuickBet.bind(this));
        this.quickBet.background_mask.setLocalZOrder(-1);

        var imgUrl = "";
        switch (language_manager.getInstance().getLanguage()) {
            case language_manager.getInstance().Choose_Language.lan_English:
                imgUrl = this.getNode("Other_Node/Set_Chip/up/Btn_Certain").getTexture().url;
                break;
            case language_manager.getInstance().Choose_Language.lan_simCh:
                imgUrl = this.getNode("Other_Node/Set_Chip/up/cn/Btn_Certain").getTexture().url;
                break;
            case language_manager.getInstance().Choose_Language.lan_tradCh:
                imgUrl = this.getNode("Other_Node/Set_Chip/up/Btn_Certain").getTexture().url;
                break;
        }
        var quickImg = new cc.Sprite.create(imgUrl);
        this.quickBet.btn_node.addChild(quickImg);
        quickImg.setPosition(cc.p(this.quickBet.btn_node.width / 2, this.quickBet.btn_node.height / 2));

        this.quickBetPos = {};
        var table_node = this.getNode("Table_Node");
        for (var i = 0; i < table_node.getChildrenCount(); i++) {
            if (table_node.children[i].getName().split("_")[0] == "BetPosition")
                this.quickBetPos[table_node.children[i].getName()] = table_node.children[i];
        }
    },

    initTable: function () {
        this.betAreaBg = {};
        this.betAreaBg["Btn_Player_Pair"] = 1;
        this.betAreaBg["Btn_Player"] = 2;
        this.betAreaBg["Btn_Tie"] = 3;
        this.betAreaBg["Btn_Banker_Pair"] = 4;
        this.betAreaBg["Btn_Banker"] = 5;

        this._tableArea = {};
        var tableHover = this.getNode("Table_Hover_Node").children;
        for (var i = 0; i < tableHover.length; i++) {
            var bgNum = i + 1;
            this._tableArea[bgNum] = {};
            this._tableArea[bgNum].lightBg = this.getNode("Table_Hover_Node/bet_area_bet_" + (i + 1).toString());
        }

        this._tableArea.normalArea = {};
        this._tableArea.normalArea[this.betAreaBg["Btn_Player_Pair"]] = this.getNode("Table_Node/Btn_Player_Pair");
        this._tableArea.normalArea[this.betAreaBg["Btn_Player"]] = this.getNode("Table_Node/Btn_Player");
        this._tableArea.normalArea[this.betAreaBg["Btn_Tie"]] = this.getNode("Table_Node/Btn_Tie");
        this._tableArea.normalArea[this.betAreaBg["Btn_Banker_Pair"]] = this.getNode("Table_Node/Btn_Banker_Pair");
        this._tableArea.normalArea[this.betAreaBg["Btn_Banker"]] = this.getNode("Table_Node/Btn_Banker");

        var mousePos = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            posM: null,

            onMouseMove: function (event) {
                this.mouseCheck.position = event.getLocation();
                return false;
            }.bind(this),
        });
        cc.eventManager.addListener(mousePos, this._tableArea.normalArea[this.betAreaBg["Btn_Player_Pair"]]);
    },

    initialImgs: function () {
        this._text_images = {};

        this._text_images.player = this.getNode("Table_Node/txt_Player");
        this._text_images.banker = this.getNode("Table_Node/txt_Banker");
        this._text_images.player_pair = this.getNode("Table_Node/txt_Player_Pair");
        this._text_images.banker_pair = this.getNode("Table_Node/txt_banker_pair_tw");
        this._text_images.tie = this.getNode("Table_Node/txt_Tie");
        this._text_images.NoComm  = this.getNode("Table_Node/Table/txt_no_comm");

        //lang tw
        this._text_images.lang_textures = {};
        this._text_images.lang_textures.tw = {};
        this._text_images.lang_textures.cn = {};
        this._text_images.lang_textures.en = {};

        this.connectNode(this.getNode("Table_Lan_Pic_Node/Table_Pic_tw"), this._text_images.lang_textures.tw);
        this.connectNode(this.getNode("Table_Lan_Pic_Node/Table_Pic_cn"), this._text_images.lang_textures.cn);
        this.connectNode(this.getNode("Table_Lan_Pic_Node/Table_Pic_en"), this._text_images.lang_textures.en);

        this.updateLangImages();
    },

    onChangeSprite: function (sprite_path, parent_node, z_order) {
        var hoverSprite = cc.Sprite.create(sprite_path);
        parent_node.addChild(hoverSprite, z_order);
        hoverSprite.setPosition(cc.p(parent_node.width / 2 * parent_node.getScaleX(), parent_node.height / 2 * parent_node.getScaleY()));
        hoverSprite.setName(parent_node.getName() + "_" + sprite_path.split("_")[sprite_path.split("_").length - 1].split(".")[0]);
    },

    enterTable: function (sender, mouseHitPoint) {
        this.mouseCheck.enter = true;
        this.mouseCheck.button = sender;
    },

    overTable: function (sender, mouseHitPoint) {
        this.mouseCheck.enter = false;
        this.mouseCheck.button.removeChild(sender.getChildByName(sender.getName() + "_down"));
        this.mouseCheck.button = sender;
    },

    removeTableHover: function () {
        if (this._room._status != RoundStatus.DealCard ) {
            var tableCount = Object.keys(this._tableArea.normalArea).length;
            for (var i = 0; i < tableCount; i++) {
                i++;
                var area = this._tableArea.normalArea[i];
                if (area.getChildByName(area.getName() + "_down") == null)
                    continue;
                area.removeChild(area.getChildByName(area.getName() + "_down"));
            }
        }
    },

    checkIsBet: function (id) {
        if (AccountCenter.getInstance().getUserID() != id)
            return;
    },

    updateLangImages:function(){
        var img_player;
        var img_banker;
        var img_player_pair;
        var img_banker_pair;
        var img_tie;
        var img_no_comm;

        var lang_node;

        switch(language_manager.getInstance().getLanguage()){
            case language_manager.getInstance().Choose_Language.lan_English:
                lang_node =  this._text_images.lang_textures.en;
                break;
            case language_manager.getInstance().Choose_Language.lan_simCh:
                lang_node =  this._text_images.lang_textures.cn;
                break;
            case language_manager.getInstance().Choose_Language.lan_tradCh:
                lang_node =  this._text_images.lang_textures.tw;
                break;
        }

        this._text_images._current_lang = language_manager.getInstance().getLanguage();

        this._text_images.player.setTexture(lang_node.Player.getTexture());
        this._text_images.banker.setTexture(lang_node.Banker.getTexture());

        this._text_images.player_pair.setTexture(lang_node.PlayerPair.getTexture());
        this._text_images.banker_pair.setTexture(lang_node.BankerPair.getTexture());

        this._text_images.tie.setTexture(lang_node.Tie.getTexture());

        var node_nocomm = lang_node.NoComm ? lang_node.NoComm : lang_node.NoCmm;
        this._text_images.NoComm.setTexture(node_nocomm.getTexture());
    },

    update: function (dt) {
        this.shineStatusCtrl(dt);
        this.removeTableHover();
        // this._betMoney.PlayerTxt.setString(this._room.getBetArea()[1]);
        // this._betMoney.bankerTxt.setString(this._room.getBetArea()[2]);
        // this._betMoney.Player.setString(language_manager.getInstance().getTextID(12));
        // this._betMoney.banker.setString(language_manager.getInstance().getTextID(13));

        if (this.mouseCheck.enter) {
            if (eventInTransparentMask(this.mouseCheck.button, this.mouseCheck.position)) {
                if (this.mouseCheck.button.getChildByName(this.mouseCheck.button.getName() + "_down"))
                    this.mouseCheck.button.removeChild(this.mouseCheck.button.getChildByName(this.mouseCheck.button.getName() + "_down"));
            }


            if (!eventInTransparentMask(this.mouseCheck.button, this.mouseCheck.position)) {
                if (this._room._status != RoundStatus.DealCard)return;
                var areaName = this.mouseCheck.button.getName();
                var num = this.betAreaBg[areaName];
                if (!this.mouseCheck.button.getChildByName(this.mouseCheck.button.getName() + "_down"))
                    this.onChangeSprite(this._tableArea[num].lightBg.getTexture().url, this.mouseCheck.button);
            }
        }

        this.updateTextImgs();
    },

    updateTextImgs:function(){
        if(this._text_images._current_lang != language_manager.getInstance().getLanguage())
            this.updateLangImages();
    },

    betOn: function (btnNo, sender) {
        if (this._room.getPlayer() == null)
            return;

        if (this._room._status != RoundStatus.DealCard)
            return;

        if (this.isPass)
            return;

        if (this._room.getChipChoice() == 0)
            return;

        if (GameManager.getInstance().Room != null && !GameManager.getInstance().Room.checkOnSeat()) {
            if (this._room.getPlayer().getCurrentBetMoney() + parseInt(this._room.getChipChoice()) > AccountCenter.getInstance().getBalance()) {
                this.hideQuickBet();
                var text = language_manager.getInstance().getTextID(104);

                ui_MessageBox.getInstance().showPureText(text);
                return;
            }
        }

        sound_manager.getInstance().setEffectName("bet");
        GameManager.getInstance().Room.getPlayer().setBet(btnNo, parseInt(this._room.getChipChoice()));
        this.showBet();
        this.setQuickBetPosition(sender);
    },

    setQuickBetPosition: function (sender) {
        var touchPlace = null;

        switch (sender.getName()) {
            case "Btn_Player_Pair":
                touchPlace = this.quickBetPos["BetPosition_PlayPair"];
                break;
            case "Btn_Player":
                touchPlace = this.quickBetPos["BetPosition_Play"];
                break;
            case "Btn_Tie":
                touchPlace = this.quickBetPos["BetPosition_Tie"];
                break;
            case "Btn_Banker":
                touchPlace = this.quickBetPos["BetPosition_Bank"];
                break;
            case "Btn_Banker_Pair":
                touchPlace = this.quickBetPos["BetPosition_BankPair"];
                break;
        }


        var seatIndex = -1;

        for (var i = 0; i < this._room.getSeatData().length; i++) {
            if (this._room.getSeatData()[i].getSeatUserId() == AccountCenter.getInstance().getUserID())
                seatIndex = i;
        }

        if (seatIndex < 0)
            seatIndex = 7;
        var worldPos = touchPlace.children[seatIndex].convertToWorldSpace(new cc.Point(0, 0));
        this.quickBet.btn_node.setPosition(cc.p(worldPos.x + this.quickBet.btn_node.width, worldPos.y - this.quickBet.btn_node.height));
        this.quickBet.btn_node.setVisible(true);
    },

    hideQuickBet: function () {
        if (this.quickBet)
            if (this.quickBet.btn_node.isVisible()) {
                this.quickBet.pic_hover.setVisible(false);
                this.quickBet.btn_node.setVisible(false);
            }
    },

    settingMouseCheck: function () {
        this.mouseCheck = {};
        this.mouseCheck.button = null;
        this.mouseCheck.position = null;
        this.mouseCheck.enter = false;
        this.mouseCheck.over = false;

    },

    initialBetPosition: function () {
        var betPosition_Player = this.getNode("Table_Node/BetPosition_Play");
        this._btnBetPos.PlayerBetPos = betPosition_Player.getChildren();

        var betPosition_Banker = this.getNode("Table_Node/BetPosition_Bank");
        this._btnBetPos.BankerBetPos = betPosition_Banker.getChildren();

        var betPosition_Tie = this.getNode("Table_Node/BetPosition_Tie");
        this._btnBetPos.TieBetPos = betPosition_Tie.getChildren();

        var betPosition_PlayerPair = this.getNode("Table_Node/BetPosition_PlayPair");
        this._btnBetPos.PlayerPairPos = betPosition_PlayerPair.getChildren();

        var betPosition_BankerPair = this.getNode("Table_Node/BetPosition_BankPair");
        this._btnBetPos.BankerPairPos = betPosition_BankerPair.getChildren();
    },

    initialPlayerBankerBet: function () {
        var pNode = this.getNode("player_bankerBet_Node");
        pNode.setVisible(false);
        //     this._mainLayerNode.removeChild(pNode, true);
        //     this._mainLayerNode.getChildByName("Table_Node").addChild(pNode);
        //     this._betMoney.PlayerTxt = this.getNode("Table_Node/player_bankerBet_Node/Player_groupNode/txt_PlayerBet");
        //     this._betMoney.PlayerTxt.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);
        //     this._betMoney.bankerTxt = this.getNode("Table_Node/player_bankerBet_Node/Banker_groupNode/txt_bankerBet");
        //     this._betMoney.bankerTxt.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
        //     this._betMoney.Player = this.getNode("Table_Node/player_bankerBet_Node/Player_groupNode/txt_Player");
        //     this._betMoney.banker = this.getNode("Table_Node/player_bankerBet_Node/Banker_groupNode/txt_Banker");
        //
    },

    pileUpStack: function (betCoin, posX, posY, bet_area, seat_id) {
        var chipPics = this.betChipPics();
        var pileArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        if (betCoin == undefined || betCoin == 0)
            return;

        for (var i = 0; i < pileArray.length; i++) {
            switch (i) {
                case this.UnitCount.Unit_100000:
                    pileArray[0] = Math.floor(betCoin / 100000);
                    break;
                case this.UnitCount.Unit_50000:
                    pileArray[1] = Math.floor(betCoin % 100000 / 50000);
                    break;
                case this.UnitCount.Unit_10000:
                    pileArray[2] = Math.floor(betCoin % 100000 % 50000 / 10000);
                    break;
                case this.UnitCount.Unit_5000:
                    pileArray[3] = Math.floor(betCoin % 100000 % 50000 % 10000 / 5000);
                    break;
                case this.UnitCount.Unit_1000:
                    pileArray[4] = Math.floor(betCoin % 100000 % 50000 % 10000 % 5000 / 1000);
                    break;
                case this.UnitCount.Unit_500:
                    pileArray[5] = Math.floor(betCoin % 100000 % 50000 % 10000 % 5000 % 1000 / 500);
                    break;
                case this.UnitCount.Unit_100:
                    pileArray[6] = Math.floor(betCoin % 100000 % 50000 % 10000 % 5000 % 1000 % 500 / 100);
                    break;
                case this.UnitCount.Unit_50:
                    pileArray[7] = Math.floor(betCoin % 100000 % 50000 % 10000 % 5000 % 1000 % 500 % 100 / 50);
                    break;
                case this.UnitCount.Unit_10:
                    pileArray[8] = Math.floor(betCoin % 100000 % 50000 % 10000 % 5000 % 1000 % 500 % 100 % 50 / 10);
                    break;
                case this.UnitCount.Unit_5:
                    pileArray[9] = Math.floor(betCoin % 100000 % 50000 % 10000 % 5000 % 1000 % 500 % 100 % 50 % 10 / 5);
                    break;
                case this.UnitCount.Unit_1:
                    pileArray[10] = betCoin % 100000 % 50000 % 10000 % 5000 % 1000 % 500 % 100 % 50 % 10 % 5;
                    break;
            }
        }

        var picLength = 0;
        for (var i = 0; i < pileArray.length; i++) {
            picLength += pileArray[i];
        }

        var picArray = [];
        var count = 0;
        for (var j = 0; j < pileArray.length; j++) {
            for (var i = 0; i < pileArray[j]; i++) {
                var pic = cc.Sprite.create(chipPics[j].getTexture());
                picArray.push(pic);
                this.addChild(picArray[count]);
                if (seat_id == this._BYSTANDER)
                    picArray[count].setScale(0.6, 0.6);
                else
                    picArray[count].setScale(0.35,0.35);
                picArray[count].x = posX;
                picArray[count].y = this._SPACE * count + posY;
                count++;
            }
        }

        if (betCoin != 0) {
            var playerData = GameManager.getInstance().Room.getPlayer();
            var successBet = 0;
            var currentBet = 0;
            var currentBetText = "";

            var chipTextMessage_Past = this._betText.clone();
            this.addChild(chipTextMessage_Past);

            if (AccountCenter.getInstance().getSeatNo() == seat_id - this._BYSTANDER || AccountCenter.getInstance().getSeatNo() == seat_id + 1) {
                var chipTextMessage_Now = this._betText.clone();
                this.addChild(chipTextMessage_Now);
                currentBet = playerData.getPlayerAreaBetMoney()[bet_area];

                if (currentBet > 0)
                    currentBetText = "+" + currentBet;
                else
                    currentBetText = "";

                chipTextMessage_Now.setString(currentBetText);

                if (seat_id == this._BYSTANDER) {
                    chipTextMessage_Now.setScale(1.45, 1.45);
                    chipTextMessage_Now.setPosition(posX, this._SPACE * count + posY + 27);
                    chipTextMessage_Now.enableOutline(cc.color.BLACK, 3);
                    chipTextMessage_Now.setTextColor(cc.color.YELLOW, 3);//#664C00??

                } else {
                    chipTextMessage_Now.setScale(1, 1);
                    chipTextMessage_Now.setPosition(posX, this._SPACE * count + posY + 17);
                    chipTextMessage_Now.enableOutline(cc.color.BLACK, 3);
                    chipTextMessage_Now.setTextColor(cc.color.YELLOW, 3);
                }
            }

            chipTextMessage_Past.setString(betCoin - currentBet);
            if (seat_id == this._BYSTANDER) {
                chipTextMessage_Past.setScale(1.45, 1.45);
                chipTextMessage_Past.setPosition(posX, this._SPACE * count + posY + 27);
                chipTextMessage_Past.enableOutline(cc.color.BLACK, 3);
            } else {
                chipTextMessage_Past.setScale(1, 1);
                chipTextMessage_Past.setPosition(posX, this._SPACE * count + posY + 17);
                chipTextMessage_Past.enableOutline(cc.color.BLACK, 3);
            }

            var betChipInfo = {};
            betChipInfo.instanceArray = picArray;
            betChipInfo.betArea = bet_area;
            betChipInfo.betSeatId = seat_id;
            betChipInfo.isGetBack = false;
            betChipInfo.textBox = chipTextMessage_Past;
            this._betChipArray.push(betChipInfo);
        }
    },

    betChipPics: function () {
        var chipName = ["100000", "50000", "10000", "5000", "1000", "500", "100", "50", "10", "5", "1"];
        var pics = new Array(11);
        for (var i = 0; i < pics.length; i++) {
            pics[i] = this.getNode("Chip_Node/Web_Node/Chip_Bet_Hover_Node/chip_bet_" + chipName[i]);
        }

        return pics;
    },

    showBet: function () {
        this.dataClear();
        this._betChipArray = [];
        var btn = null;
        var seatData = GameManager.getInstance().Room.getSeatData().slice(0);

        if (!this._room.checkOnSeat()) {
            seatData.push(GameManager.getInstance().Room.getPlayer());
        }

        for (var j = 0; j < seatData.length; j++) {
            var infos = seatData[j].getSuccessBetArea();
            for (var i = 0; i < 5; i++) {
                switch (i) {
                    case this.BetBtnNo.Bank:
                        btn = this._btnBetPos.BankerBetPos;
                        this.pileUpStack(infos[i], btn[j].getPositionX(), btn[j].getPositionY(), i, j);
                        break;
                    case this.BetBtnNo.Tie:
                        btn = this._btnBetPos.TieBetPos;
                        this.pileUpStack(infos[i], btn[j].getPositionX(), btn[j].getPositionY(), i, j);
                        break;
                    case this.BetBtnNo.Play:
                        btn = this._btnBetPos.PlayerBetPos;
                        this.pileUpStack(infos[i], btn[j].getPositionX(), btn[j].getPositionY(), i, j);
                        break;
                    case this.BetBtnNo.PlayerPairs:
                        btn = this._btnBetPos.PlayerPairPos;
                        this.pileUpStack(infos[i], btn[j].getPositionX(), btn[j].getPositionY(), i, j);
                        break;
                    case this.BetBtnNo.BankerPairs:
                        btn = this._btnBetPos.BankerPairPos;
                        this.pileUpStack(infos[i], btn[j].getPositionX(), btn[j].getPositionY(), i, j);
                        break;
                }
            }
        }
    },

    shineBtn: function (areaNo) {
        this._isShine = true;
        switch (areaNo - 1) {
            case this.BetBtnNo.Bank:
                this._mask = new ui_TableMask(this._mainLayerNode, "Table_Node/Btn_Banker");
                this._tableMask.push(this._mask);
                this.addChild(this._mask);
                break;
            case this.BetBtnNo.Play:
                this._mask = new ui_TableMask(this._mainLayerNode, "Table_Node/Btn_Player");
                this._tableMask.push(this._mask);
                this.addChild(this._mask);
                break;
            case this.BetBtnNo.Tie:
                this._mask = new ui_TableMask(this._mainLayerNode, "Table_Node/Btn_Tie");
                this._tableMask.push(this._mask);
                this.addChild(this._mask);
                break;
            // case this.BetBtnNo.AnyPairs:
            //     this._mask = new ui_TableMask(this._mainLayerNode, "Table_Node/Btn_Either_Pair");
            //     this._tableMask.push(this._mask);
            //     this.addChild(this._mask);
            //     break;
            case this.BetBtnNo.PlayerPairs:
                this._mask = new ui_TableMask(this._mainLayerNode, "Table_Node/Btn_Player_Pair");
                this._tableMask.push(this._mask);
                this.addChild(this._mask);
                break;
            // case this.BetBtnNo.Big:
            //     this._mask = new ui_TableMask(this._mainLayerNode, "Table_Node/Btn_Big");
            //     this._tableMask.push(this._mask);
            //     this.addChild(this._mask);
            //     break;
            // case this.BetBtnNo.Small:
            //     this._mask = new ui_TableMask(this._mainLayerNode, "Table_Node/Btn_Small");
            //     this._tableMask.push(this._mask);
            //     this.addChild(this._mask);
            //     break;
            case this.BetBtnNo.BankerPairs:
                this._mask = new ui_TableMask(this._mainLayerNode, "Table_Node/Btn_Banker_Pair");
                this._tableMask.push(this._mask);
                this.addChild(this._mask);
                break;
            // case this.BetBtnNo.PerfectPairs:
            //     this._mask = new ui_TableMask(this._mainLayerNode, "Table_Node/Btn_Prefect_Pair");
            //     this._tableMask.push(this._mask);
            //     this.addChild(this._mask);
            //     break;
        }

    },

    shineStatusCtrl: function (dt) {
        if (this._room._status == RoundStatus.RoundStart) {
            this._isShine = false;
            for (var i = 0; i < 5; i++)
                if (this._tableMask[i] != null)
                    this._tableMask[i].clearMask();
            this._tableMask.length = 0;
        }

        if (this._isShine)
            for (var i = 0; i < 5; i++)
                if (this._tableMask[i] != null)
                    this._tableMask[i].update(dt);
    },

    btnConstruct: function () {
        this.registerMouseEvent(this.getNode("Table_Node/Btn_Tie"), null,
            function (node, mouseHitPoint) {
                if (!eventInTransparentMask(node, mouseHitPoint))
                    this.betOn(this.BetBtnNo.Tie, node);
            }.bind(this), this.enterTable.bind(this), this.overTable.bind(this));
        this.registerMouseEvent(this.getNode("Table_Node/Btn_Player"), null,
            function (node, mouseHitPoint) {
                if (!eventInTransparentMask(node, mouseHitPoint))
                    this.betOn(this.BetBtnNo.Play, node);
            }.bind(this), this.enterTable.bind(this), this.overTable.bind(this));
        this.registerMouseEvent(this.getNode("Table_Node/Btn_Banker"), null,
            function (node, mouseHitPoint) {
                if (!eventInTransparentMask(node, mouseHitPoint))
                    this.betOn(this.BetBtnNo.Bank, node);
            }.bind(this), this.enterTable.bind(this), this.overTable.bind(this));
        // this.registerMouseEvent(this.getNode("Table_Node/Btn_Either_Pair"),
        //     function (node, mouseHitPoint) {
        //         this.betOn(this.BetBtnNo.AnyPairs);
        //     }.bind(this));
        this.registerMouseEvent(this.getNode("Table_Node/Btn_Player_Pair"), null,
            function (node, mouseHitPoint) {
                if (!eventInTransparentMask(node, mouseHitPoint))
                    this.betOn(this.BetBtnNo.PlayerPairs, node);
            }.bind(this), this.enterTable.bind(this), this.overTable.bind(this));
        // this.registerMouseEvent(this.getNode("Table_Node/Btn_Big"),
        //     function (node, mouseHitPoint) {
        //         this.betOn(this.BetBtnNo.Big);
        //     }.bind(this));
        // this.registerMouseEvent(this.getNode("Table_Node/Btn_Small"),
        //     function (node, mouseHitPoint) {
        //         this.betOn(this.BetBtnNo.Small);
        //     }.bind(this));
        this.registerMouseEvent(this.getNode("Table_Node/Btn_Banker_Pair"), null,
            function (node, mouseHitPoint) {
                if (!eventInTransparentMask(node, mouseHitPoint))
                    this.betOn(this.BetBtnNo.BankerPairs, node);
            }.bind(this), this.enterTable.bind(this), this.overTable.bind(this));
        // this.registerMouseEvent(this.getNode("Table_Node/Btn_Prefect_Pair"),
        //     function (node, mouseHitPoint) {
        //         this.betOn(this.BetBtnNo.PerfectPairs);
        //     }.bind(this));
    },

    dataClear: function () {
        this.removeAllChildren();
    },

    getHitArea: function (hitAreas) {
        for (var i = 0; i < hitAreas.length; i++) {
            var hitArea = hitAreas[i].HitArea - 1;
            this._betAreaHit.push(hitArea);
        }
    }

});

var cc;
(function (cc) {
    var render;
    (function (render) {
        var util;
        (function (util) {
            function getAlphaChannel(image) {
                return getChannel(image, 3);
            }

            util.getAlphaChannel = getAlphaChannel;

            function getRedChannel(image) {
                return getChannel(image, 0);
            }

            util.getRedChannel = getRedChannel;

            function getGreenChannel(image) {
                return getChannel(image, 1);
            }

            util.getGreenChannel = getGreenChannel;

            function getBlueChannel(image) {
                return getChannel(image, 2);
            }

            util.getBlueChannel = getBlueChannel;

            function getChannel(image, channel) {
                var canvas = null;
                var ctx = null;
                if (image instanceof HTMLCanvasElement) {
                    canvas = image;
                    ctx = canvas.getContext("2d");
                } else {
                    var canvas = createCanvas(image.width, image.height);
                    ctx = canvas.getContext("2d");
                    ctx.drawImage(image, 0, 0);
                }
                var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                return extractChannel(imageData.data, canvas.width, canvas.height, 3);
            }

            util.getChannel = getChannel;

            function createCanvas(w, h) {
                var canvas = document.createElement("canvas");
                canvas.width = w;
                canvas.height = h;
                return canvas;
            }

            util.createCanvas = createCanvas;

            function extractChannel(data, width, height, channel) {
                var ret = typeof Uint8Array !== "undefined" ? new Uint8Array(width * height) : new Array(width * height);
                var pos = 0;
                for (var i = 0; i < data.length; i += 4) {
                    ret[pos++] = data[i + channel];
                }
                return ret;
            }

            util.extractChannel = extractChannel;
        })(util = render.util || (render.util = {}));
    })(render = cc.render || (cc.render = {}));
})(cc || (cc = {}));

function eventInTransparentMask(target, point, threshold) {
    threshold = threshold || 30;

    if (!target.mask) {
        target.mask = cc.render.util.getAlphaChannel(target._buttonClickedSpriteFrame._texture._htmlElementObj);
    }

    var tp = target.convertToNodeSpace(point);
    var lx = tp.x >> 0;
    var ly = tp.y >> 0;

    var transparentIndex = lx + (target._buttonClickedSpriteFrame._texture.height - ly) * target._buttonClickedSpriteFrame._texture.width;

    return target.mask[transparentIndex] <= threshold;
}
