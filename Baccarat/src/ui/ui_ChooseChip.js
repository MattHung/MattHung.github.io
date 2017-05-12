/**
 * Created by helen_pai on 2016/11/22.
 */

var ui_ChooseChip = gameLayer.extend({
    CHOOSE_CHIP_COUNT: 11,
    CHOOSE_CHIP_INTERVAL: 60,
    LAST_VISIBLE: 1,
    UNDER_MINI_BET: 2,
    chooseElement: null,
    betSpec: null,
    _room: null,
    _mainNode: null,
    _layerArray: null,
    _chooseNode: null,
    _chooseArray: null,
    _arrayCount: null,
    _hoverArray: null,
    _btnWebOpenLeft: null,
    _btnWebOpenRight: null,
    _btnSave: null,
    _isShow: false,
    _needSetChip: false,

    ctor: function (room, mainNode, nodeName) {
        this._super(mainNode);
        this._room = room;
        this._mainNode = mainNode;
        this.initVariable();
        this.initSet(nodeName);
        this.initArray();
        this.initChip();
        this.eventBuild();
    },

    lightUp: function (sender) {
        var index = this._chooseArray.indexOf(sender);
        if (!this.checkChooseChip(sender.getName()) && index >= this.CHOOSE_CHIP_COUNT) {  //
            var msg = String.format(language_manager.getInstance().getTextID(108) + " {0} ~ {1}", this.betSpec.min_val, this.betSpec.max_val);
            ui_MessageBox.getInstance().showPureText(msg);
        }

        if (this.checkIsLastChip(index) && this.checkChooseChip(sender.getName()))
            return;
        sender.setVisible(false);
        if (index < this.CHOOSE_CHIP_COUNT) {
            this._chooseArray[index + this.CHOOSE_CHIP_COUNT].setVisible(true);
        } else {
            this._chooseArray[index - this.CHOOSE_CHIP_COUNT].setVisible(true);
        }

        for (var i = 0; i < this._chooseArray.length; i++) {
            if (this._room.checkOnSeat())
                AccountCenter.getInstance().setContestantChoose(i, this._chooseArray[i].isVisible());
            if (!this._room.checkOnSeat()) {
                AccountCenter.getInstance().setViewerChoose(i, this._chooseArray[i].isVisible());
            }
        }

        if (this._room.checkOnSeat())
            this._room.uiBetChip.updateWebBet(AccountCenter.getInstance().getContestantChoose());
        if (!this._room.checkOnSeat())
            this._room.uiBetChip.updateWebBet(AccountCenter.getInstance().getViewerChoose());
    },

    showMoney: function (sender) {
        var index = this._chooseArray.indexOf(sender);
        this._hoverArray[index % this.CHOOSE_CHIP_COUNT].setVisible(true);
        this._hoverArray[index % this.CHOOSE_CHIP_COUNT].setPositionX(sender.getPositionX());
    },

    hideMoney: function (sender) {
        var index = this._chooseArray.indexOf(sender);
        this._hoverArray[index % this.CHOOSE_CHIP_COUNT].setVisible(false);
    },

    enterOpenBtn: function (sender) {
        this.hoverSpriteSet(sender._clickedFileName, sender);
    },

    overOpenBtn: function (sender) {
        sender.setScale(1, 1);
        sender.removeAllChildren();
    },

    mouseDownOpenBtn: function (sender) {
        this._room.uiTableArea.hideQuickBet();
        sender.setScale(0.9, 0.9);
        sender.removeAllChildren();
    },

    enterSave: function (sender) {
        this.hoverSpriteSet(this.chooseElement["HoverSave"].getTexture().url, sender);
    },

    overSave: function (sender) {
        sender.removeAllChildren();
    },

    mouseDownSave: function (sender) {
        sender.removeAllChildren();
    },

    hoverSpriteSet: function (sprite_path, parent_node) {
        var hoverSprite = cc.Sprite.create(sprite_path);
        parent_node.addChild(hoverSprite);
        hoverSprite.setPosition(cc.p(parent_node.width / 2 * parent_node.getScaleX(), parent_node.height / 2 * parent_node.getScaleY()));
    },

    eventBuild: function () {
        this.registerMouseEvent(this.chooseElement["Mask"], null, null, function () {
        });

        this._btnWebOpenLeft = this.getNode("Chip_Node/Web_Node/SetChipBtn_Node/btn_Set_chip");
        this._btnWebOpenRight = this.getNode("Chip_Node/Web_Node/SetChipBtn_Node/btn_Set_chip_1");
        this.registerMouseEvent(this._btnWebOpenLeft, this.mouseDownOpenBtn.bind(this), this.openChooseChip.bind(this), this.enterOpenBtn.bind(this), this.overOpenBtn.bind(this));
        this.registerMouseEvent(this._btnWebOpenRight, this.mouseDownOpenBtn.bind(this), this.openChooseChip.bind(this), this.enterOpenBtn.bind(this), this.overOpenBtn.bind(this));

        this._btnSave = this.getNode("Chip_Set_Node/save");
        this.registerMouseEvent(this._btnSave, this.mouseDownSave.bind(this), this.closeChooseChip.bind(this), this.enterSave.bind(this), this.overSave.bind(this));

        for (var i = 0; i < this._chooseArray.length; i++)
            this.registerMouseEvent(this._chooseArray[i], this.lightUp.bind(this), null, this.showMoney.bind(this), this.hideMoney.bind(this));
    },

    openChooseChip: function (sender) {
        this._isShow = true;
        var count = 0;
        sender.setScale(1, 1);
        if (sender._onPressStateChangedToNormal)
            sender._onPressStateChangedToNormal();
        this.chooseElement["ChooseNode"].setVisible(true);
        this.chooseElement["Money"].setVisible(true);
        this.chooseElement["Save"].setVisible(true);
        this.chooseElement["Mask"].setVisible(true);
        for (var i = 0; i < this._chooseArray.length; i++) {
            if (i < this._chooseArray.length / 2)
                this._chooseArray[i].children[0].setVisible(!this.checkChooseChip(this._chooseArray[i].getName()));

            if (this._room.checkOnSeat())
                this._chooseArray[i].setVisible(AccountCenter.getInstance().getContestantChoose()[i]);
            if (!this._room.checkOnSeat())
                this._chooseArray[i].setVisible(AccountCenter.getInstance().getViewerChoose()[i]);
            count++
        }

        this.setChipCenter(count);
    },

    closeChooseChip: function () {
        this._isShow = false;
        this.chooseElement["ChooseNode"].setVisible(false);
        this.chooseElement["Money"].setVisible(false);

        var chip_select = {};
        chip_select.viewer = AccountCenter.getInstance().getViewerChoose();
        chip_select.contestant = AccountCenter.getInstance().getContestantChoose();

        baccaratPeer.getInstance().sendMessage("ChipSetting", {Setting: JSON.stringify(chip_select)});
    },

    setChipCenter: function (exist_count) {
        var allChipWidth = (exist_count / 2) * this.CHOOSE_CHIP_INTERVAL;
        var boundLength = (cc.winSize.width - allChipWidth) / 2;
        var index = 0;

        for (var i = 0; i < this._chooseArray.length; i++) {
            if (i < this.CHOOSE_CHIP_COUNT) {
                var centerPosX = boundLength + (index + 0.5) * this.CHOOSE_CHIP_INTERVAL;
                this._chooseArray[i].setPositionX(centerPosX);
            } else {
                this._chooseArray[i].setPositionX(this._chooseArray[i - this.CHOOSE_CHIP_COUNT].getPositionX());
            }

            index++;
            if (index >= this.CHOOSE_CHIP_COUNT)
                index = index - this.CHOOSE_CHIP_COUNT;
        }
    },

    setDefaultChipOpen: function (val) {
        if (val && this._needSetChip)
            this.openChooseChip(this._btnWebOpenLeft);
        if (!val)
            this.closeChooseChip();
    },

    setDefaultContestant: function () {
        if (this._room.getRoomMessage().turnCount != 0)
            return;
        if (Object.keys(AccountCenter.getInstance().getContestantChoose()).length > 0)
            return;
        var chip_select = {};
        chip_select.viewer = AccountCenter.getInstance().getViewerChoose();
        chip_select.contestant = {};
        for (var i = 0; i < this._chooseArray.length; i++) {
            if (i >= this._chooseArray.length / 2)
                continue;
            if (this.checkChooseChip(this._chooseArray[i].getName())) {
                chip_select.contestant[i] = true;
                chip_select.contestant[i + this._chooseArray.length / 2] = false;
                continue;
            }
            chip_select.contestant[i] = false;
            chip_select.contestant[i + this._chooseArray.length / 2] = true;
        }
        AccountCenter.getInstance().chip_select.contestant = chip_select.contestant;
        baccaratPeer.getInstance().sendMessage("ChipSetting", {Setting: JSON.stringify(chip_select)});
    },

    setDefaultViewer: function () {
        if (Object.keys(AccountCenter.getInstance().getViewerChoose()).length > 0)
            return;
        var chip_select = {};
        chip_select.viewer = {};
        chip_select.contestant = AccountCenter.getInstance().getContestantChoose();

        for (var i = 0; i < this._chooseArray.length; i++) {
            if (i >= this._chooseArray.length / 2)
                continue;
            if (this.checkChooseChip(this._chooseArray[i].getName())) {
                chip_select.viewer[i] = true;
                chip_select.viewer[i + this._chooseArray.length / 2] = false;
                continue;
            }
            chip_select.viewer[i] = false;
            chip_select.viewer[i + this._chooseArray.length / 2] = true;
        }

        AccountCenter.getInstance().chip_select.viewer = chip_select.viewer;
        baccaratPeer.getInstance().sendMessage("ChipSetting", {Setting: JSON.stringify(chip_select)});
    },

    checkIsLastChip: function (index) {
        if (index >= this.CHOOSE_CHIP_COUNT)
            return false;
        var visibleCount = 0;
        for (var i = 0; i < this.CHOOSE_CHIP_COUNT; i++) {
            if (!this.checkChooseChip(this._chooseArray[i].getName()))
                continue;
            if (this._chooseArray[i].isVisible()) {
                visibleCount++;
                continue;
            }
        }
        return visibleCount <= this.LAST_VISIBLE ? true : false;
    },

    checkChooseChip: function (chip_name) {
        var chipValue = parseInt(chip_name.split("_")[chip_name.split("_").length - 1]);
        if (!this.betSpec.min_val)
            this.betSpec.min_val = 0;
        if (!this.betSpec.max_val)
            this.betSpec.max_val = 99999999999;
        return (chipValue >= this.betSpec.min_val && chipValue <= this.betSpec.max_val) ? true : false;
    },

    initChip: function () {
        var viewerEnterBefore = Object.keys(AccountCenter.getInstance().getViewerChoose()).length;

        //旁觀者 初次進入
        if (viewerEnterBefore <= 0)
            this._needSetChip = true;
        //旁觀者 曾經入房
        if (viewerEnterBefore > 0)
            this._needSetChip = false;
    },

    initArray: function () {
        this._layerArray = [];
        this._chooseArray = [];
        this._arrayCount = this._chooseNode.getChildrenCount();
        for (var i = 0; i < this._arrayCount; i++) {
            var itemName = this._chooseNode.children[i]._name;
            this._layerArray.push(this._chooseNode.children[i]);
            this._layerArray[i].setVisible(false);
            if (itemName.substr(0, 9) == "chip_chip") {
                this._chooseNode.children[i].chip_val = parseInt(itemName.split("_")[itemName.split("_").length - 1]);
                this._chooseArray.push(this._chooseNode.children[i]);
            }
        }

        var banCount = 0;
        for (var k = 0; k < this._chooseArray.length; k++) {
            if (k >= this._chooseArray.length / 2)
                continue;
            var banIcon = new cc.Sprite.create(this.chooseElement["BanIcon"].getTexture().url);
            this._chooseArray[k].addChild(banIcon);
            banIcon.setPosition(cc.p(this._chooseArray[k].width / 2, this._chooseArray[k].height + 30));
            banIcon.setName("BanIcon");
            banCount++;
        }
    },

    initSet: function (nodeName) {
        this.chooseElement = {};
        this.chooseElement["ChooseNode"] = this.getNode("Chip_Set_Node");
        this.chooseElement["Money"] = this.getNode("Chip_Set_Hover_Node");
        this.chooseElement["HoverSave"] = this.getNode("Save_Node/save");
        this.chooseElement["Mask"] = this.getNode("Chip_Set_Node/mask");
        this.chooseElement["Save"] = this.getNode("Chip_Set_Node/save");
        this.chooseElement["BanIcon"] = this.getNode("Other_Node/NoTouchChip_Node/NoTouch_chip");

        this.chooseElement["HoverSave"].setVisible(false);
        for (var i = 0; i < this._mainNode.children.length; i++) {
            if (this._mainNode.children[i]._name == nodeName) {
                this._chooseNode = this._mainNode.children[i];
            }
        }
        this._hoverArray = [];
        var moneyArray = this.chooseElement["Money"];
        for (var i = 0; i < moneyArray.getChildrenCount(); i++) {
            this._hoverArray.push(moneyArray.children[i]);
            moneyArray.children[i].setVisible(false);
        }
    },

    setSpecBet: function (min_bet, max_bet) {
        this.betSpec = {};
        this.betSpec.min_val = min_bet;
        this.betSpec.max_val = max_bet;

        var chipArray = [];
        for (var i = 0; i < this._hoverArray.length; i++) {
            var name = this._hoverArray[i].getName();
            var Value = parseInt(name.split("_")[1]);
            chipArray.push(Value);
        }

        var index = -1;
        var count = -1;
        for (var j = 0; j < chipArray.length; j++) {
            if (count >= 0)
                continue;
            if (this.betSpec.min_val <= chipArray[j]) {
                index = j;
                count++;
            }
        }

        if (index >= 2) {
            this.betSpec.min_val = chipArray[index - this.UNDER_MINI_BET];
            return;
        }
        this.betSpec.min_val = chipArray[0];
    },

    initVariable: function () {
        this._layerArray = null;
        this._chooseNode = null;
        this._chooseArray = null;
        this._arrayCount = null;
        this._hoverArray = null;
        this._isShow = false;
        this._needSetChip = false;
    },
});
