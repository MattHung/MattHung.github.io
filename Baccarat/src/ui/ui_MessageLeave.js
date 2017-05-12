/**
 * Created by helen_pai on 2017/2/6.
 */


var ui_MessageLeave = ui_MessageBoxPanel.extend({
    btn_option: null,
    option: {leave: 0, cancel: 1},

    ctor: function () {
        this._super();
        this.initSetting();
    },

    initSetting: function () {
        this._btn_confirm.setVisible(false);
        this._text_count_down.setVisible(false);
        this.btn_option = [];

        this.initBtn(this.option.leave);
        this.initBtn(this.option.cancel);

        this.registerMouseEvent(this.btn_option[this.option.leave].btn, this.mouseDown.bind(this), this.leaveConfirm.bind(this), this.mouseEnter.bind(this), this.mouseOver.bind(this));
        this.registerMouseEvent(this.btn_option[this.option.cancel].btn, this.mouseDown.bind(this), this.cancelConfirm.bind(this), this.mouseEnter.bind(this), this.mouseOver.bind(this));
    },

    initBtn: function (option) {
        var btnInfo = {};
        btnInfo.btn = new ccui.Button();
        btnInfo.btn.setTouchEnabled(true);
        if (option == this.option.leave)
            btnInfo.btn.loadTextures(msg_res.leave_mouse_up, msg_res.leave_mouse_down);
        if (option == this.option.cancel)
            btnInfo.btn.loadTextures(msg_res.red_mouse_up, msg_res.red_mouse_down);
        btnInfo.btn.setAnchorPoint(cc.p(0.5, 0.5));
        btnInfo.btn.setPosition(-70 + 150 * option, -88);
        btnInfo.btn.setName(option.toString());
        btnInfo.txtOption = new cc.LabelTTF("", "Msjh", this._content_font_size, cc.TEXT_ALIGNMENT_CENTER, cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
        btnInfo.txtOption.setColor(new cc.Color(255, 255, 255));
        btnInfo.txtOption.setAnchorPoint(cc.p(0.5, 0.5));
        btnInfo.txtOption.setPosition(cc.p(-70 + 150 * option, -87));


        this.root_node.addChild(btnInfo.btn);
        this.root_node.addChild(btnInfo.txtOption);

        if (option == this.option.leave)
            btnInfo.txtOption.setString(String.format("{0}", language_manager.getInstance().getTextID(150)));
        if (option == this.option.cancel)
            btnInfo.txtOption.setString(String.format("{0}", language_manager.getInstance().getTextID(149)));
        this.btn_option.push(btnInfo);
    },

    mouseDown: function (sender) {
        if (sender.getChildByName(sender.getName() + "_over"))
            sender.getChildByName(sender.getName() + "_over").setVisible(false);
    },

    mouseEnter: function (sender) {
        switch (sender.getName()) {
            case this.option.leave.toString():
                this.onChangSprite(msg_res.leave_mouse_over, sender);
                break;
            case this.option.cancel.toString():
                this.onChangSprite(msg_res.red_mouse_over, sender);
                break;
        }
    },

    mouseOver: function (sender) {
        sender.removeAllChildren();
    },

    showLeaveQuestion: function (title, text) {
        this.btn_option.txtOption = text;
        this.showContext(text);
        this.showTitle(title);
    },

    leaveConfirm: function () {
        this.root_node.setVisible(false);
        this.setVisible(false);
        baccaratPeer.getInstance().sendMessage("LeaveRoom", {RoomID: GameManager.getInstance().Room.getRoomID()});
        GameManager.getInstance().Room.uiEffectController.setLeaveOpen(false);
        CocosWidget.eventRegister.getInstance().removeTargetEvent(this, this.btn_option[this.option.leave].btn);
        CocosWidget.eventRegister.getInstance().removeTargetEvent(this, this.btn_option[this.option.cancel].btn);
    },

    cancelConfirm: function () {
        this.root_node.setVisible(false);
        this.setVisible(false);
        GameManager.getInstance().Room.uiEffectController.setLeaveOpen(false);
        CocosWidget.eventRegister.getInstance().removeTargetEvent(this, this.btn_option[this.option.leave].btn);
        CocosWidget.eventRegister.getInstance().removeTargetEvent(this, this.btn_option[this.option.cancel].btn);
    }


});

var ui_MessageEnter = ui_MessageBoxPanel.extend({
    _room_id: null,
    _room_msg: null,
    btn_option: null,
    option: {enter: 0, cancel: 1},

    ctor: function () {
        this._super();
        this.initSetting();
    },

    initSetting: function () {
        this._btn_confirm.setVisible(false);
        this._text_count_down.setVisible(false);
        this.btn_option = [];

        this.initBtn(this.option.enter);
        this.initBtn(this.option.cancel);
        this.registerMouseEvent(this.btn_option[this.option.enter].btn, this.mouseDown.bind(this), this.enterConfirm.bind(this), this.mouseEnter.bind(this), this.mouseOver.bind(this));
        this.registerMouseEvent(this.btn_option[this.option.cancel].btn, this.mouseDown.bind(this), this.cancelConfirm.bind(this), this.mouseEnter.bind(this), this.mouseOver.bind(this));
    },

    initBtn: function (option) {
        var btnInfo = {};
        btnInfo.btn = new ccui.Button();
        btnInfo.btn.setTouchEnabled(true);
        if (option == this.option.enter)
            btnInfo.btn.loadTextures(msg_res.red_mouse_up, msg_res.red_mouse_down);
        if (option == this.option.cancel)
            btnInfo.btn.loadTextures(msg_res.leave_mouse_up, msg_res.leave_mouse_down);
        btnInfo.btn.setAnchorPoint(cc.p(0.5, 0.5));
        btnInfo.btn.setPosition(-70 + 150 * option, -88);
        btnInfo.btn.setName(option.toString());
        btnInfo.txtOption = new cc.LabelTTF("", "Msjh", this._content_font_size, cc.TEXT_ALIGNMENT_CENTER, cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
        btnInfo.txtOption.setColor(new cc.Color(255, 255, 255));
        btnInfo.txtOption.setAnchorPoint(cc.p(0.5, 0.5));
        btnInfo.txtOption.setPosition(cc.p(-70 + 150 * option, -87));


        this.root_node.addChild(btnInfo.btn);
        this.root_node.addChild(btnInfo.txtOption);

        if (option == this.option.enter)
            btnInfo.txtOption.setString(String.format("{0}", language_manager.getInstance().getTextID(37)));
        if (option == this.option.cancel)
            btnInfo.txtOption.setString(String.format("{0}", language_manager.getInstance().getTextID(149)));
        this.btn_option.push(btnInfo);
    },

    setRoomInfo: function (room_id, room_msg) {
        this._room_id = room_id;
        this._room_msg = room_msg;
    },

    showEnterQuestion: function (title, text) {
        this.showTitleTextByID(title, text);
    },

    setBtnString: function (int_enter, int_cancel) {
        var txt_enter = language_manager.getInstance().getTextID(int_enter);
        var txt_cancel = language_manager.getInstance().getTextID(int_cancel);
        this.btn_option[this.option.enter].txtOption.setString(txt_enter);
        this.btn_option[this.option.cancel].txtOption.setString(txt_cancel);
    },

    mouseDown: function (sender) {
        if (sender.getChildByName(sender.getName() + "_over"))
            sender.getChildByName(sender.getName() + "_over").setVisible(false);
    },

    mouseEnter: function (sender) {
        switch (sender.getName()) {
            case this.option.enter.toString():
                this.onChangSprite(msg_res.red_mouse_over, sender);
                break;
            case this.option.cancel.toString():
                this.onChangSprite(msg_res.leave_mouse_over, sender);
                break;
        }
    },

    mouseOver: function (sender) {
        sender.removeAllChildren();
    },

    enterConfirm: function () {
        this.root_node.setVisible(false);
        this.setVisible(false);
        GameManager.getInstance().SignUpRoom.setMsgOpen(false);
        if (!GameManager.getInstance().checkEnterRoom)
            return;
        baccaratPeer.getInstance().sendMessage("EnterRoom", {RoomID: this._room_id});
        GameManager.getInstance().SignUpRoom.setRoomSelect(this._room_msg);
        CocosWidget.eventRegister.getInstance().removeTargetEvent(this, this.btn_option[this.option.enter].btn);
        CocosWidget.eventRegister.getInstance().removeTargetEvent(this, this.btn_option[this.option.cancel].btn);
    },

    cancelConfirm: function () {
        this.root_node.setVisible(false);
        this.setVisible(false);
        GameManager.getInstance().SignUpRoom.setMsgOpen(false);
        CocosWidget.eventRegister.getInstance().removeTargetEvent(this, this.btn_option[this.option.enter].btn);
        CocosWidget.eventRegister.getInstance().removeTargetEvent(this, this.btn_option[this.option.cancel].btn);
    }
});