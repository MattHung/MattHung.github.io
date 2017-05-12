/**
 * Created by helen_pai on 2016/11/24.
 */

var ChipState = {
    NOT_EXIST: -1,
    VISIBLE_FALSE: 0,
    VISIBLE_TRUE: 1
};

var BtnControlState = {
    Normal: "Normal",
    NormalBet: "NormalBet",
    HideBet: "HideBet",
    ChangeToNormal: "ChangeToNormal",
    NoTouch: "NoTouch"
};

var SystemClassify = {
    Web: "Web_Node",
    // Mobile: "Mobile_Node"
};

var ui_BetChip = gameLayer.extend({
    MAX_BET: 4,
    UNDER_MINI_BET: 2,
    VisibleArray: [],
    PageInfo: {a: 0},
    WebChipFactor: {a: 0},
    btnPrevious: null,
    btnNext: null,
    betChipControl: [],
    btnControlState: null,
    imgChipHover: {},
    watchBox: {},
    lastBetState: null,
    betSpec: {},
    controlPic: {},
    _room: null,
    _btnOpen: null,
    _betNodes: {a: []},
    _mainNode: null,
    _webTarget: null,
    _betCount: null,
    _webChoose: null,
    _isTakeSeat: false,
    _btn_bet_control: null,

    ctor: function (room, mainNode, nodeName) {
        this._super(mainNode);
        this._room = room;
        this.initVariable();
        this._mainNode = mainNode;
        this._betNodes.webArray = this.getNode("Chip_Node/Web_Node/Chip_Bet_Node").getChildren();
        this.initControlPic();
        this.initWebBet();
        this.initWatchBox();
        this.initBtnControl();
        this.initControlEvent();
        this.initialBetControl();
    },

    initialBetControl: function () {
        this._btn_bet_control = {};
        this._btn_bet_control.data = {pass_count: 0, hide_count: 0};
        this._btn_bet_control.send_data = {pass_count: 0, hide_count: 0};
        this._btn_bet_control.node_pass = this.getNode("Other_Node/PassAndBlind_Node/Pass_Node");
        this._btn_bet_control.node_hide = this.getNode("Other_Node/PassAndBlind_Node/Blind_Node");
        this._btn_bet_control.btn_pass = this.getNode("Other_Node/PassAndBlind_Node/Pass_Node/Btn_Pass");
        this._btn_bet_control.btn_hide = this.getNode("Other_Node/PassAndBlind_Node/Blind_Node/Btn_Blind");
        this._btn_bet_control.pic_pass = this.getNode("Other_Node/PassAndBlind_Node/Pass_Node/Pic_Over");
        this._btn_bet_control.pic_hide = this.getNode("Other_Node/PassAndBlind_Node/Blind_Node/Pic_Over");
        this._btn_bet_control.pic_hide_click = this.getNode("Other_Node/PassAndBlind_Node/Blind_Node/Pic_choose");
        this._btn_bet_control.pic_hide_shine = this.getNode("Other_Node/PassAndBlind_Node/Blind_Node/Pic_Light");
        this._btn_bet_control.icon_no_hide = this.getNode("Other_Node/PassAndBlind_Node/Blind_Node/pic_no");
        this._btn_bet_control.icon_no_pass = this.getNode("Other_Node/PassAndBlind_Node/Pass_Node/pic_no");
        this._btn_bet_control.icon_up_hide = this.getNode("Other_Node/PassAndBlind_Node/Blind_Node/pic_up");
        this._btn_bet_control.icon_up_pass = this.getNode("Other_Node/PassAndBlind_Node/Pass_Node/pic_up");
        this._btn_bet_control.pos_pass = this.getNode("Other_Node/PassAndBlind_Node/Pass_Node/pic_up").getPosition();
        this._btn_bet_control.pos_hide = this.getNode("Other_Node/PassAndBlind_Node/Blind_Node/pic_up").getPosition();
        this.initTxtBetControl();
        this.updateBetControl(0, 0);

        this._btn_bet_control.curtState = {};
        this._btn_bet_control.curtState["isBet"] = false;
        this._btn_bet_control.curtState["isAdd"] = false;
        this._btn_bet_control.curtState["isClick"] = false;
        this._btn_bet_control.curtState["isMouseEnter"] = false;
        this._btn_bet_control.shineTime = {};
        this._btn_bet_control.shineTime["shineTime"] = 15;
        this._btn_bet_control.shineTime["originTime"] = 25;
        this._btn_bet_control.shineTime["existTime"] = 0;

        this.registerMouseEvent(this._btn_bet_control.btn_pass, this.mouseDownBetCtrl.bind(this), this.mouseUpPass.bind(this), this.enterBetStateBtn.bind(this), this.overBetStateBtn.bind(this));
        this.registerMouseEvent(this._btn_bet_control.btn_hide, this.mouseDownBetCtrl.bind(this), this.mouseUpHide.bind(this), this.enterBetStateBtn.bind(this), this.overBetStateBtn.bind(this));
    },

    initTxtBetControl: function () {
        this._btn_bet_control.txtContent = {};
        this._btn_bet_control.text_pass = new CocosWidget.TextField();
        this._btn_bet_control.text_pass.setAnchorPoint(cc.p(0.5, 0.5));
        this._btn_bet_control.text_pass.setFontSize(17);
        this._btn_bet_control.text_pass.setPosition(cc.p(825, 145));
        this._btn_bet_control.text_pass.setSize(80, 20);
        var txtPass = String.format("@#FFFFFF" + language_manager.getInstance().getTextID(141) + "@#BEFFFFx{0}", 0);
        this._btn_bet_control.text_pass.setString(txtPass);
        this._btn_bet_control.node_pass.addChild(this._btn_bet_control.text_pass);

        this._btn_bet_control.text_hide = new CocosWidget.TextField();
        this._btn_bet_control.text_hide.setAnchorPoint(cc.p(0.5, 0.5));
        this._btn_bet_control.text_hide.setFontSize(17);
        this._btn_bet_control.text_hide.setPosition(cc.p(952, 145));
        this._btn_bet_control.text_hide.setSize(80, 20);
        var txtHide = String.format("@#FFFFFF" + language_manager.getInstance().getTextID(140) + "@#E1BFFDx{0}", 0);
        this._btn_bet_control.text_hide.setString(txtHide);
        this._btn_bet_control.node_hide.addChild(this._btn_bet_control.text_hide);
    },

    mouseUpPass: function (sender) {
        if (!sender.isBright())
            return;
        this.cancelCurrentBet(sender);
        this.sendBet(sender);
    },

    mouseUpHide: function (sender) {
        if (!sender.isBright())
            return;
        this.sendBet(sender);
    },

    mouseDownBetCtrl: function (sender) {
        if (!sender.isBright())
            return;
        sender.removeAllChildren();
        this._btn_bet_control.curtState["isMouseEnter"] = true;
    },

    overBetStateBtn: function (sender) {
        if (!sender.isBright())
            return;

        sender.removeAllChildren();
        if (sender._onPressStateChangedToNormal)
            sender._onPressStateChangedToNormal();
        this._btn_bet_control.curtState["isMouseEnter"] = false;
    },

    enterBetStateBtn: function (sender) {
        if (!sender.isBright())
            return;
        if (sender.getName() == "Btn_Blind") {
            if (!this._btn_bet_control.btn_hide.isBright())
                return;
            this.hoverSpriteSet(this._btn_bet_control.pic_hide.getTexture().url, this._btn_bet_control.btn_hide);
            this._btn_bet_control.curtState["isMouseEnter"] = true;
        }

        if (sender.getName() == "Btn_Pass")
            this.hoverSpriteSet(this._btn_bet_control.pic_pass.getTexture().url, this._btn_bet_control.btn_pass);
    },

    updateBetControl: function (hideCount, passCount) {
        this._btn_bet_control.data.pass_count = passCount;
        this._btn_bet_control.data.hide_count = hideCount;
    },

    updateWebBet: function (list) {
        this._webChoose = [];
        var existCount = 0;
        this._betCount = Object.keys(list).length / 2;
        for (var i = 0; i < this._betCount; i++) {
            if (!list[i] || !this.checkChooseChip(this._betNodes.webArray[i].getName())) {
                this.VisibleArray.WebVisible[i] = ChipState.NOT_EXIST;
                continue;
            }
            this._webChoose.push(this._betNodes.webArray[i]);
            var startIndex = (this.PageInfo._currentPage - this.PageInfo._firstPage) * this.MAX_BET;
            if (existCount >= startIndex && existCount < startIndex + this.MAX_BET) {
                this._betNodes.webArray[i].setPositionX(this.PageInfo._initPosX + existCount * this.PageInfo.ObjectInterval);
                this.VisibleArray.WebVisible[i] = ChipState.VISIBLE_TRUE;
            }
            if (existCount < startIndex || existCount >= this.MAX_BET + startIndex) {
                this.VisibleArray.WebVisible[i] = ChipState.VISIBLE_FALSE;
                // continue;
            }

            existCount++;
        }
        this.PageInfo._endPage = Math.ceil(this._webChoose.length / this.MAX_BET);
        if (this.PageInfo._endPage == 0)
            this.PageInfo._endPage = this.PageInfo._firstPage;
        this.PageInfo.remainder = this._webChoose.length % this.MAX_BET;

    },

    updateWebVisible: function () {
        if (this._betNodes.webArray == null || this.VisibleArray.WebVisible == null)return;
        for (var i = 0; i < this._betNodes.webArray.length; i++) {
            switch (this.VisibleArray.WebVisible[i]) {
                case ChipState.VISIBLE_TRUE:
                    this._betNodes.webArray[i].setVisible(true);
                    break;
                case ChipState.VISIBLE_FALSE:
                    this._betNodes.webArray[i].setVisible(false);
                    break;
                case ChipState.NOT_EXIST:
                    this._betNodes.webArray[i].setVisible(false);
                    break;
            }
        }
    },

    updateWebTarget: function (sender) {
        if (this._webTarget)
            this._webTarget.setPosition(this.WebChipFactor.OriginY);
        this._webTarget = sender;
        this._room.setChipChoice(this._webTarget.getName().split("_")[2]);
        AccountCenter.getInstance().setSelectName(sender.getName());
    },

    enterPageControl: function (sender) {
        if (sender == this.btnPrevious)
            sender.setPositionX(this.btnPrevious.enterX);

        if (sender == this.btnNext)
            sender.setPositionX(this.btnNext.enterX)
    },

    overPageControl: function (sender) {
        if (sender == this.btnPrevious)
            sender.setPositionX(this.btnPrevious.originBtnX);
        if (sender == this.btnNext)
            sender.setPositionX(this.btnNext.originBtnX);
    },

    mouseDownChip: function (sender) {
        this._room.uiTableArea.hideQuickBet();
        if (sender == this._webTarget)
            return;
        this.getNode("Chip_Node/Web_Node/Chip_Bet_Hover_Node/" + sender.getName()).setPosition(this.WebChipFactor.outPos);
        sender.setPositionY(this.WebChipFactor.OriginY);
    },

    mouseUpChip: function (sender) {
        if (sender == this._webTarget)
            return;
        sender.setPositionY(this.WebChipFactor.ChipUpY);
        this.updateWebTarget(sender);
    },

    enterChip: function (sender) {
        sender.setPositionY(this.WebChipFactor.ChipUpY);
        sender.isEnter = true;

        var worldPos = sender.convertToWorldSpace(new cc.Point(0, 0));
        worldPos.x += sender.width / 2 * sender.getScaleX();
        worldPos.y += sender.height / 2 * sender.getScaleY();
        this.getNode("Chip_Node/Web_Node/Chip_Bet_Hover_Node/" + sender.getName()).setPosition(worldPos.x, worldPos.y);
    },

    overChip: function (sender) {
        this.getNode("Chip_Node/Web_Node/Chip_Bet_Hover_Node/" + sender.getName()).setPosition(this.WebChipFactor.outPos);

        sender.isEnter = false;
        sender.setPositionY(this.WebChipFactor.OriginY);
        if (sender._onPressStateChangedToNormal)
            sender._onPressStateChangedToNormal();
    },

    previousPage: function () {
        this._room.uiTableArea.hideQuickBet();
        this.PageInfo._currentPage--;
        if (this.PageInfo._currentPage <= this.PageInfo._firstPage) {
            this.PageInfo._currentPage = this.PageInfo._firstPage;
        }
        this.btnNext.setVisible(true);
    },

    nextPage: function () {
        this._room.uiTableArea.hideQuickBet();
        this.PageInfo._currentPage++;

        if (this.PageInfo._currentPage >= this.PageInfo._endPage) {
            this.PageInfo._currentPage = this.PageInfo._endPage;
        }
        this.btnPrevious.setVisible(true);

    },

    updateWebPage: function () {
        if (this.PageInfo._currentPage >= this.PageInfo._endPage) {
            this._btnOpen.web_right.setVisible(true);
            this._btnOpen.web_left.setVisible(false);
            this.btnNext.setVisible(false);
            this.btnPrevious.setVisible(true);
        }

        if (this.PageInfo._currentPage < this.PageInfo._endPage) {
            this.btnNext.setVisible(true);
            this._btnOpen.web_right.setVisible(false);
            this._btnOpen.web_left.setVisible(false);
        }

        if (this.PageInfo._currentPage <= this.PageInfo._firstPage) {
            this.btnPrevious.setVisible(false);
            this.btnNext.setVisible(true);
            this._btnOpen.web_right.setVisible(false);
            this._btnOpen.web_left.setVisible(true);
        }

        if (this.PageInfo._firstPage == this.PageInfo._endPage) {
            this.btnNext.setVisible(false);
            this.btnPrevious.setVisible(false);
            this._btnOpen.web_right.setVisible(false);
            this._btnOpen.web_left.setVisible(true);
            this.PageInfo._currentPage = 1;
        }

        this.PageInfo.objectCount = 0;

        var startIndex = (this.PageInfo._currentPage - this.PageInfo._firstPage) * this.MAX_BET;
        for (var i = 0; i < this._webChoose.length; i++) {
            var index = this._betNodes.webArray.indexOf(this._webChoose[i]);
            if (startIndex + this.MAX_BET > this._webChoose.length) {
                startIndex = this._webChoose.length - this.MAX_BET;
            }

            if (i >= startIndex && i < startIndex + this.MAX_BET) {
                this.VisibleArray.WebVisible[index] = ChipState.VISIBLE_TRUE;
                this._webChoose[i].setPositionX(this.PageInfo._initPosX + this.PageInfo.ObjectInterval * this.PageInfo.objectCount);
                this.PageInfo.objectCount++;
                continue;
            }
            this.VisibleArray.WebVisible[index] = ChipState.VISIBLE_FALSE;
        }
    },

    updateWebBetPos: function () {
        var isExist = false;
        for (var i = 0; i < this._webChoose.length; i++) {
            if (!this._webTarget)
                continue;
            if (this._webChoose[i].getName() != this._webTarget.getName())
                continue;
            isExist = true;
        }
        if (!isExist) {
            if (this._webChoose.length > 0) {
                this._webTarget = this._webChoose[0];
                this._room.setChipChoice(this._webTarget.getName().split("_")[2]);
                AccountCenter.getInstance().setSelectName(this._webTarget.getName());
            }
            if (this._webChoose.length <= 0) {
                if (this._webTarget)
                    this.imgChipHover[this._webTarget.getName()].setPosition(this.WebChipFactor.outPos);
                this._webTarget = null;
                if (this._room.getChipChoice() != 0) {
                    this._room.setChipChoice(0);
                    AccountCenter.getInstance().setSelectName(0);
                }
            }
        }
        for (var i = 0; i < this._betNodes.webArray.length; i++) {
            if (!this._webTarget)
                continue;
            if (this._betNodes.webArray[i].getName() == this._webTarget.getName()) {
                this._betNodes.webArray[i].setPositionY(this.WebChipFactor.ChipUpY);
                if (this._webTarget.isVisible()) {
                    var worldPos = this._betNodes.webArray[i].convertToWorldSpace(new cc.Point(0, 0));
                    worldPos.x += this._betNodes.webArray[i].width / 2 * this._betNodes.webArray[i].getScaleX();
                    worldPos.y += this._betNodes.webArray[i].height / 2 * this._betNodes.webArray[i].getScaleY();
                    this.imgChipHover[this._betNodes.webArray[i].getName()].setPosition(worldPos.x, worldPos.y);
                    continue;
                }
                this.imgChipHover[this._betNodes.webArray[i].getName()].setPosition(this.WebChipFactor.outPos);
                continue;
            }
            if (!this._betNodes.webArray[i].isEnter) {
                this._betNodes.webArray[i].setPositionY(this.WebChipFactor.OriginY);
                this.imgChipHover[this._betNodes.webArray[i].getName()].setPosition(this.WebChipFactor.outPos);
            }
        }
    },





    updateControlColor: function () {
        var txtPass = "";
        var txtHide = "";
        if (this._btn_bet_control.btn_pass.isBright()) {
            txtPass = String.format("@#FFFFFF" + language_manager.getInstance().getTextID(141) + "@#BFFFFF x{0}", this._btn_bet_control.data.pass_count);
            this._btn_bet_control.text_pass.setString(txtPass);
        }

        if (!this._btn_bet_control.btn_pass.isBright()) {
            txtPass = String.format("@#666666" + language_manager.getInstance().getTextID(141) + " x{0}", this._btn_bet_control.data.pass_count);
            this._btn_bet_control.text_pass.setString(txtPass);
        }

        if (this._btn_bet_control.btn_hide.isBright()) {
            txtHide = String.format("@#FFFFFF" + language_manager.getInstance().getTextID(140) + "@#E1BFFD x{0}", this._btn_bet_control.data.hide_count);
            this._btn_bet_control.text_hide.setString(txtHide);
        }

        if (!this._btn_bet_control.btn_hide.isBright()) {
            txtHide = String.format("@#666666" + language_manager.getInstance().getTextID(140) + " x{0}", this._btn_bet_control.data.hide_count);
            this._btn_bet_control.text_hide.setString(txtHide);
        }
    },

    updateChipControl: function () {
        switch (this.btnControlState) {
            case BtnControlState.NoTouch:
                for (var i = 0; i < this.betChipControl.length; i++) {
                    this.toDisable(this.betChipControl[i]._btnPrevious);
                    this.toDisable(this.betChipControl[i]._btnBack);
                    this.toDisable(this.betChipControl[i]._btnCertain);
                    this.toDisable(this.betChipControl[i]._btnDelete);
                    this.betChipControl[i]._btnPrevious.removeAllChildren();
                    this.betChipControl[i]._btnBack.removeAllChildren();
                    this.betChipControl[i]._btnCertain.removeAllChildren();
                    this.betChipControl[i]._btnDelete.removeAllChildren();
                }
                this.toDisable(this._btn_bet_control.btn_pass);
                this.toDisable(this._btn_bet_control.btn_hide);
                this._btn_bet_control.btn_pass.removeAllChildren();
                if (!this._btn_bet_control.curtState["isClick"])
                    this._btn_bet_control.btn_hide.removeAllChildren();
                this._btn_bet_control.icon_no_hide.setPosition(this._btn_bet_control.pos_hide);
                this._btn_bet_control.icon_no_pass.setPosition(this._btn_bet_control.pos_pass);
                this._btn_bet_control.icon_up_hide.setPosition(this.WebChipFactor.outPos);
                this._btn_bet_control.icon_up_pass.setPosition(this.WebChipFactor.outPos);
                break;
            case BtnControlState.HideBet:
                this.toDisable(this._btn_bet_control.btn_pass);
                this.toDisable(this._btn_bet_control.btn_hide);

                this._btn_bet_control.btn_pass.removeAllChildren();
                this._btn_bet_control.icon_no_hide.setPosition(this._btn_bet_control.pos_hide);
                this._btn_bet_control.icon_no_pass.setPosition(this._btn_bet_control.pos_pass);
                this._btn_bet_control.icon_up_hide.setPosition(this.WebChipFactor.outPos);
                this._btn_bet_control.icon_up_pass.setPosition(this.WebChipFactor.outPos);
                break;
            case  BtnControlState.NormalBet:
                this.toDisable(this._btn_bet_control.btn_pass);
                this.toDisable(this._btn_bet_control.btn_hide);

                this._btn_bet_control.btn_pass.removeAllChildren();
                this._btn_bet_control.btn_hide.removeAllChildren();
                this._btn_bet_control.icon_no_hide.setPosition(this._btn_bet_control.pos_hide);
                this._btn_bet_control.icon_no_pass.setPosition(this._btn_bet_control.pos_pass);
                this._btn_bet_control.icon_up_hide.setPosition(this.WebChipFactor.outPos);
                this._btn_bet_control.icon_up_pass.setPosition(this.WebChipFactor.outPos);
                break;

            case BtnControlState.ChangeToNormal:
                for (var i = 0; i < this.betChipControl.length; i++) {
                    this.betChipControl[i]._btnPrevious.setBright(true);
                    this.betChipControl[i]._btnBack.setBright(true);
                    this.betChipControl[i]._btnCertain.setBright(true);
                    this.betChipControl[i]._btnDelete.setBright(true);
                }
                this.checkTimes();
                this._btn_bet_control.btn_hide.removeAllChildren();
                this._btn_bet_control.curtState["isClick"] = false;
                this.btnControlState = BtnControlState.Normal;
                break;

            case BtnControlState.Normal:
                break;
        }
        this.updateControlColor();

        if (this._isTakeSeat) {
            this._btn_bet_control.node_pass.setVisible(true);
            this._btn_bet_control.node_hide.setVisible(true);
        }
        if (!this._isTakeSeat) {
            this._btn_bet_control.node_pass.setVisible(false);
            this._btn_bet_control.node_hide.setVisible(false);
        }

    },

    toDisable: function (node) {
        if (node.isBright())
            node.setBright(false);
    },

    checkTimes: function () {
        if (!this._isTakeSeat)
            return;
        if (this._btn_bet_control.data.pass_count > 0) {
            this._btn_bet_control.btn_pass.setBright(true);
            this._btn_bet_control.icon_up_pass.setPosition(this._btn_bet_control.pos_pass);
            this._btn_bet_control.icon_no_pass.setPosition(this.WebChipFactor.outPos);
        }
        if (this._btn_bet_control.data.hide_count > 0) {
            this._btn_bet_control.btn_hide.setBright(true);
            this._btn_bet_control.icon_up_hide.setPosition(this._btn_bet_control.pos_hide);
            this._btn_bet_control.icon_no_hide.setPosition(this.WebChipFactor.outPos);
        }
    },

    resetBtnCurtState: function () {
        this._btn_bet_control.curtState["isBet"] = false;
        this._btn_bet_control.curtState["isAdd"] = false;
        this._btn_bet_control.shineTime["existTime"] = 0;
        for (var i = 0; i < this._btn_bet_control.btn_hide.getChildrenCount(); i++) {
            if (this._btn_bet_control.btn_hide.children[i].getName() == "hide_shine") {
                var pic = this._btn_bet_control.btn_hide.children[i];
                this._btn_bet_control.btn_hide.removeChild(pic);
            }
        }
    },

    updateHide: function () {
        if (this.btnControlState == BtnControlState.NoTouch || this.btnControlState == BtnControlState.NormalBet) {
            this.resetBtnCurtState();
            this._btn_bet_control.curtState["isMouseEnter"] = false;
            this.toDisable(this._btn_bet_control.btn_hide);
            return;
        }

        if (this._btn_bet_control.curtState["isMouseEnter"]) {
            this.resetBtnCurtState();
            return;
        }

        if (!this._btn_bet_control.btn_hide.isBright())
            return;

        this._btn_bet_control.curtState["isBet"] = false;
        var currentAreasBet = this._room.getPlayer().getPlayerAreaBetMoney();
        for (var i = 0; i < currentAreasBet.length; i++) {
            if (currentAreasBet[i] <= 0)
                continue;
            this._btn_bet_control.curtState["isBet"] = true;
        }

        if (!this._btn_bet_control.curtState["isBet"]) {
            this.resetBtnCurtState();
            return;
        }

        if (!this._btn_bet_control.curtState["isAdd"]) {
            if (this._btn_bet_control.curtState["isBet"]) {
                var shine = cc.Sprite.create(this._btn_bet_control.pic_hide_shine.getTexture().url);
                var btnHide = this._btn_bet_control.btn_hide;
                btnHide.addChild(shine);
                shine.setPosition(btnHide.width / 2 * btnHide.getScaleX(), btnHide.height / 2 * btnHide.getScaleY());
                shine.setName("hide_shine");
                this._btn_bet_control.curtState["isAdd"] = true;
            }
        }

        if (this._btn_bet_control.curtState["isAdd"]) {
            if (!this._btn_bet_control.btn_hide.getChildByName("hide_shine"))
                return;
            this._btn_bet_control.shineTime["existTime"]++;

            if (this._btn_bet_control.shineTime["existTime"] < this._btn_bet_control.shineTime["shineTime"])
                this._btn_bet_control.btn_hide.getChildByName("hide_shine").setVisible(true);
            if (this._btn_bet_control.shineTime["existTime"] > this._btn_bet_control.shineTime["shineTime"])
                this._btn_bet_control.btn_hide.getChildByName("hide_shine").setVisible(false);
            if (this._btn_bet_control.shineTime["existTime"] > this._btn_bet_control.shineTime["originTime"])
                this._btn_bet_control.shineTime["existTime"] = 0;
        }
    },

    showHideBet: function (id) {
        if (id == AccountCenter.getInstance().getUserID()) {
            this._btn_bet_control.curtState["isClick"] = true;
            var sprite = this._btn_bet_control.pic_hide_click;
            this.hoverSpriteSet(sprite.getTexture().url, this._btn_bet_control.btn_hide);
        }

    },

    updateLanguage: function () {
        switch (language_manager.getInstance().getLanguage()) {
            case language_manager.getInstance().Choose_Language.lan_English:
                if (this.btnControlState == BtnControlState.NoTouch) {
                    this.languagePicSet("Other_Node/no");
                    break;
                }
                this.languagePicSet("Other_Node/up");
                break;

            case language_manager.getInstance().Choose_Language.lan_simCh:
                if (this.btnControlState == BtnControlState.NoTouch) {
                    this.languagePicSet("Other_Node/no/cn");
                    break;
                }
                this.languagePicSet("Other_Node/up/cn");


                break;

            case language_manager.getInstance().Choose_Language.lan_tradCh:
                if (this.btnControlState == BtnControlState.NoTouch) {
                    this.languagePicSet("Other_Node/no");
                    break;
                }
                this.languagePicSet("Other_Node/up");

                break;
        }


    },


    languagePicSet: function (parent_string) {
        var picNode = null;
        switch (parent_string) {
            case "Other_Node/no":
                picNode = this.controlPic.disable_icon;
                break;
            case "Other_Node/up":
                picNode = this.controlPic.general_icon;
                break;
            case "Other_Node/no/cn":
                picNode = this.controlPic.disable_cn;
                break;
            case "Other_Node/up/cn":
                picNode = this.controlPic.general_cn;
                break;
        }

        for (var i = 0; i < this.controlPic.control_node.getChildrenCount(); i++) {
            var bet_control = this.controlPic.control_node.children[i];
            if (bet_control.getChildByName(parent_string.split("/")[1]))
                continue;
            bet_control.removeAllChildren();
            this.hoverSpriteSet(picNode.children[i].getTexture().url, bet_control);
            bet_control.children[0].setName(parent_string.split("/")[1]);
        }
    },


    enterBtnControl: function (sender) {
        if (!sender.isBright())
            return;
        this.hoverSpriteSet(this.getNode("Other_Node/Setting_over").getTexture().url, sender, 0);
    },

    overBtnControl: function (sender) {
        if (!sender.isBright())
            return;
        sender.removeAllChildren();
    },

    mouseDownBtnControl: function (sender) {
        if (!sender.isBright())
            return;
        if (sender.getChildByName(sender.getName() + "_over"))
            sender.getChildByName(sender.getName() + "_over").setVisible(false);
    },

    mouseUpBtnControl: function (sender) {
        if (sender.getChildByName(sender.getName() + "_over"))
            sender.getChildByName(sender.getName() + "_over").setVisible(true);
    },

    checkSendBtn: function (sender) {
        if (this.lastBetState == null) {
            switch (sender.getName()) {
                case "Btn_Certain":
                    this._btn_bet_control.send_data.pass_count = 0;
                    this._btn_bet_control.send_data.hide_count = 0;
                    break;
                case "Btn_Pass":
                    this._btn_bet_control.send_data.pass_count = 1;
                    this._btn_bet_control.send_data.hide_count = 0;
                    break;
                case "Btn_Blind":
                    this._btn_bet_control.send_data.pass_count = 0;
                    this._btn_bet_control.send_data.hide_count = 1;
                    break;
                default:
                    this._btn_bet_control.send_data.pass_count = 0;
                    this._btn_bet_control.send_data.hide_count = 0;
                    break;
            }
        }
    },

    sendBet: function (sender) {
        if (!sender.isBright())
            return;
        this.mouseUpBtnControl(sender);
        var currentAreasBet = GameManager.getInstance().Room.getPlayer().getPlayerAreaBetMoney();
        var send_bet = [];
        var currentBet = 0;
        this.checkSendBtn(sender);
        for (var i = 0; i < currentAreasBet.length; i++) {
            if (currentAreasBet[i] == 0)
                continue;
            currentBet += currentAreasBet[i];
            send_bet.push({BetArea: i + 1, Amount: currentAreasBet[i]});
        }

        if (currentBet == 0 && sender.getName() != "Btn_Pass") {
            ui_MessageBox.getInstance().showTextByID(116);
            return;
        }

        // 請求下注: PlaceBet: {Hide:0, Pass: 0, Bet: [{BetArea: 1, Amount:10}]}
        baccaratPeer.getInstance().sendMessage("PlaceBet", {
            Hide: this._btn_bet_control.send_data.hide_count,
            Pass: this._btn_bet_control.send_data.pass_count,
            Bet: send_bet
        });
    },

    getBeforeBet: function (sender) {
        if (!sender.isBright())
            return;
        this.mouseUpBtnControl(sender);
        if (GameManager.getInstance().Room.getStatus() != RoundStatus.DealCard)
            return;
        GameManager.getInstance().Room.getPlayer().resetBet();
        this._room.uiTableArea.showBet();
        this._room.uiTableArea.hideQuickBet();
    },

    getBeforeAction: function (sender) {
        if (!sender.isBright())
            return;
        this.mouseUpBtnControl(sender);

        if (GameManager.getInstance().Room.getStatus() != RoundStatus.DealCard)
            return;
        GameManager.getInstance().Room.getPlayer().setLastAction();
        this._room.uiTableArea.showBet();
        this._room.uiTableArea.hideQuickBet();
    },

    cancelCurrentBet: function (sender) {
        if (!sender.isBright())
            return;
        this.mouseUpBtnControl(sender);
        this._room.getPlayer().clearCurrentBet();
        this._room.getPlayer().setCancelAction();
        this._room.uiTableArea.hideQuickBet();
    },

    updateRoundStatus: function (status) {
        if (status == RoundStatus.DealCard) {
            this.lastBetState = null;
            this.btnControlState = BtnControlState.ChangeToNormal;
            return;
        }
        this.btnControlState = BtnControlState.NoTouch;
    },

    setBetControlState: function (result, hide, pass) {
        if (result != 1)
            return;

        if (pass != 0) {
            this.btnControlState = BtnControlState.NoTouch;
            return;
        }

        if (hide != 0) {
            if (this.btnControlState == BtnControlState.Normal)
                this.btnControlState = BtnControlState.HideBet;
        }

        if (hide == 0)
            if (this.btnControlState == BtnControlState.Normal)
                this.btnControlState = BtnControlState.NormalBet;

        this.lastBetState = this.btnControlState;
    },

    updateBetBtnToNormal: function (user_id) {
        if (user_id == AccountCenter.getInstance().getUserID()) {
            if (this.btnControlState == BtnControlState.Normal) {
                this.btnControlState = BtnControlState.ChangeToNormal;
                this._btn_bet_control.curtState["isMouseEnter"] = false;
                this.resetBtnCurtState();
            }
        }
    },

    updateToNoTouch: function (user_id) {
        if (user_id == AccountCenter.getInstance().getUserID())
            this.btnControlState = BtnControlState.NoTouch;
    },

    updateWatchBox: function () {
        var SeatsData = GameManager.getInstance().Room.getSeatData();
        var seatUserIdArray = [];
        var indexSeat = -1;
        for (var i = 0; i < SeatsData.length; i++)
            seatUserIdArray.push(SeatsData[i].getSeatUserId());

        indexSeat = seatUserIdArray.indexOf(AccountCenter.getInstance().getUserID());
        if (indexSeat < 0) {
            this._isTakeSeat = false;
            this.getNode("Watching_Node").setVisible(true);

            for (var i = 0; i < this.watchBox.pic_node.getChildrenCount(); i++) {
                if (i == language_manager.getInstance().getLanguage()) {
                    this.watchBox.pic_node.children[i].setPosition(this.watchBox.pos_node);
                    continue;
                }
                this.watchBox.pic_node.children[i].setPosition(this.watchBox.pos_out_scene);
            }
            return;
        }

        this._isTakeSeat = true;
        this.getNode("Watching_Node").setVisible(false);

    },

    hoverSpriteSet: function (sprite_path, parent_node, z_order) {
        var hoverSprite = cc.Sprite.create(sprite_path);
        parent_node.addChild(hoverSprite, z_order);
        hoverSprite.setPosition(cc.p(parent_node.width / 2 * parent_node.getScaleX(), parent_node.height / 2 * parent_node.getScaleY()));
        hoverSprite.setName(parent_node.getName() + "_" + sprite_path.split("_")[sprite_path.split("_").length - 1].split(".")[0]);
    },

    checkChooseChip: function (chip_name) {
        var chipValue = parseInt(chip_name.split("_")[chip_name.split("_").length - 1]);
        if (!this.betSpec.min_val)
            this.betSpec.min_val = 0;
        if (!this.betSpec.max_val)
            this.betSpec.max_val = 99999999999;
        return (chipValue >= this.betSpec.min_val && chipValue <= this.betSpec.max_val) ? true : false;
    },

    initWebBet: function () {
        var existCount = 0;
        this._webChoose = [];
        this.imgChipHover = {};
        this.VisibleArray.WebVisible = {};
        var initPosX = this._betNodes.webArray[0].getPositionX();
        this.PageInfo.ObjectInterval = this._betNodes.webArray[1].getPositionX() - this._betNodes.webArray[0].getPositionX();
        for (var i = 0; i < this._betNodes.webArray.length; i++) {
            this.imgChipHover[this._betNodes.webArray[i].getName()] = this.getNode("Chip_Node/Web_Node/Chip_Bet_Hover_Node/" + this._betNodes.webArray[i].getName());
            this._betNodes.webArray[i].setPositionX(initPosX + i * this.PageInfo.ObjectInterval);
            this._betNodes.webArray[i].setAnchorPoint(cc.p(0.5, 0.5));
            this._betNodes.webArray[i].isEnter = false;
            this.registerMouseEvent(this._betNodes.webArray[i], this.mouseDownChip.bind(this), this.mouseUpChip.bind(this), this.enterChip.bind(this), this.overChip.bind(this));

            this._webChoose.push(this._betNodes.webArray[i]);
            this.VisibleArray.WebVisible[i] = ChipState.VISIBLE_TRUE;
            if (i > this.MAX_BET) {
                this.VisibleArray.WebVisible[i] = ChipState.VISIBLE_FALSE;
                this._betNodes.webArray[i].setVisible(false);
            }
            existCount++;

            if (this._betNodes.webArray[i].getName() == AccountCenter.getInstance().getSelectName())
                this._webTarget = this._webChoose[i];
        }

        if (!this._webTarget)
            this._webTarget = this._webChoose[0];
        this._room.setChipChoice(this._webTarget.getName().split("_")[2]);

        this.WebChipFactor.DeltaY = 7;
        this.WebChipFactor.outPos = this.getNode("Chip_Node/Web_Node/Chip_Bet_Hover_Node/ChipHover_Position").getPosition();
        this.WebChipFactor.OriginY = this._betNodes.webArray[0].getPositionY();
        this.WebChipFactor.ChipUpY = this._betNodes.webArray[0].getPositionY() + this.WebChipFactor.DeltaY;

        this.PageInfo._currentPage = 1;
        this.PageInfo._initPosX = this._betNodes.webArray[0].getPositionX();
        this.PageInfo._endPage = Math.ceil(this._webChoose.length / this.MAX_BET);
        this.PageInfo._firstPage = 1;
        this.PageInfo.remainder = this._webChoose.length % this.MAX_BET;
    },

    setSpecBet: function (min_bet, max_bet) {
        this.betSpec = {};
        this.betSpec.min_val = min_bet;
        this.betSpec.max_val = max_bet;

        var chipArray = [];
        for (var i = 0; i < this._betNodes.webArray.length; i++) {
            var name = this._betNodes.webArray[i].getName();
            var Value = parseInt(name.split("_")[name.split("_").length - 1]);
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



    initControlEvent: function () {
        this.btnPrevious = this.getNode("Chip_Node/Web_Node/SetChipBtn_Node/Btn_previous");
        this.btnPrevious.originBtnX = this.btnPrevious.getPositionX();
        this.btnPrevious.enterX = this.btnPrevious.getPositionX() - 3;
        this.registerMouseEvent(this.btnPrevious, this.overPageControl.bind(this), this.previousPage.bind(this), this.enterPageControl.bind(this), this.overPageControl.bind(this));
        this.btnPrevious.setVisible(false);
        this.btnNext = this.getNode("Chip_Node/Web_Node/SetChipBtn_Node/Btn_next");
        this.btnNext.originBtnX = this.btnNext.getPositionX();
        this.btnNext.enterX = this.btnNext.getPositionX() + 3;
        this.registerMouseEvent(this.btnNext, this.overPageControl.bind(this), this.nextPage.bind(this), this.enterPageControl.bind(this), this.overPageControl.bind(this));
        this._btnOpen = {};
        this._btnOpen.web_left = this.getNode("Chip_Node/Web_Node/SetChipBtn_Node/btn_Set_chip");
        this._btnOpen.web_right = this.getNode("Chip_Node/Web_Node/SetChipBtn_Node/btn_Set_chip_1");

        for (var i = 0; i < this.betChipControl.length; i++) {
            this.registerMouseEvent(this.betChipControl[i]._btnPrevious, this.mouseDownBtnControl.bind(this), this.getBeforeAction.bind(this), this.enterBtnControl.bind(this), this.overBtnControl.bind(this));
            this.registerMouseEvent(this.betChipControl[i]._btnCertain, this.mouseDownBtnControl.bind(this), this.sendBet.bind(this), this.enterBtnControl.bind(this), this.overBtnControl.bind(this));
            this.registerMouseEvent(this.betChipControl[i]._btnBack, this.mouseDownBtnControl.bind(this), this.getBeforeBet.bind(this), this.enterBtnControl.bind(this), this.overBtnControl.bind(this));
            this.registerMouseEvent(this.betChipControl[i]._btnDelete, this.mouseDownBtnControl.bind(this), this.cancelCurrentBet.bind(this), this.enterBtnControl.bind(this), this.overBtnControl.bind(this));
        }

    },

    initControlPic: function () {
        this.controlPic = {};
        this.controlPic.control_node = this.getNode("Chip_Node/Web_Node/Pic_Node");
        this.controlPic.general_icon = this.getNode("Other_Node/Set_Chip/up");
        this.controlPic.disable_icon = this.getNode("Other_Node/Set_Chip/no");
        this.controlPic.general_cn = this.getNode("Other_Node/Set_Chip/up/cn");
        this.controlPic.disable_cn = this.getNode("Other_Node/Set_Chip/no/cn");
    },

    initBtnControl: function () {
        for (var item in SystemClassify) {
            var controlInfo = {};
            controlInfo._classification = item;
            controlInfo._nodeName = SystemClassify[item];
            controlInfo._btnPrevious = this.getNode("Chip_Node/" + SystemClassify[item] + "/SetChipGroup_Node/Btn_Previous");
            controlInfo._btnBack = this.getNode("Chip_Node/" + SystemClassify[item] + "/SetChipGroup_Node/Btn_Back");
            controlInfo._btnCertain = this.getNode("Chip_Node/" + SystemClassify[item] + "/SetChipGroup_Node/Btn_Certain");
            controlInfo._btnDelete = this.getNode("Chip_Node/" + SystemClassify[item] + "/SetChipGroup_Node/Btn_Delete");
            this.betChipControl.push(controlInfo);
        }
        this.btnControlState = BtnControlState.NoTouch;
    },

    initWatchBox: function () {
        this.watchBox = {};
        this.watchBox.pic_node = this.getNode("Watching_Node/Pic_Node");
        this.watchBox.pos_node = this.getNode("Watching_Node/Pic_PositionNode").getPosition();
        this.watchBox.pos_out_scene = this.getNode("Watching_Node/Pic_Node/pic_side_bet_tw").getPosition();

    },

    initVariable: function () {
        this.VisibleArray = [];
        this.PageInfo = {a: 0};
        this.WebChipFactor = {a: 0};
        this.betChipControl = [];
        this.btnControlState = null;
        this._betNodes = {a: []};
        this._webTarget = null;
        this._betCount = null;
        this._webChoose = null;
        this.lastBetState = null;
    },

    update: function (dt) {
        this.updateLanguage();
        this.updateChipControl();
        this.updateWatchBox();
        this.updateHide();

        this.updateWebVisible();
        this.updateWebBetPos();
        this.updateWebPage();

    }
});
