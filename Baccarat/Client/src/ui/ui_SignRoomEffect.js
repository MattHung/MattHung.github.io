/**
 * Created by helen_pai on 2017/2/7.
 */


var ui_SignRoomEffect = gameLayer.extend({
    signRoom: null,
    btn_element: null,

    ctor: function (mainNode, sign_room) {
        this._super(mainNode);
        this.signRoom = sign_room;
        this.initBtn();
        this.getNode("Setting_Node/Screen_Node").setVisible(false);
    },


    initBtn: function () {
        this.btn_element = {};
        this.btn_element.btn_music = this.getNode("Setting_Node/Sound_Node/Btn_Music");
        this.btn_element.btn_screen = this.getNode("Setting_Node/Screen_Node/Btn_Screen");
        this.btn_element.btn_helper = this.getNode("OtherObject_Node/RoomInfoOtherObject/Gog_Live_Node/Btn_Comp");
        this.btn_element.pic_over = this.getNode("SettingBtn_Node/pic_over");
        this.btn_element.pic_down = this.getNode("SettingBtn_Node/pic_over");
        this.btn_element.pic_music_on = this.getNode("Setting_Node/Sound_Node/pic_music");
        this.btn_element.pic_music_off = this.getNode("Setting_Node/Sound_Node/pic_music_off");
        this.btn_element.pic_helper = this.getNode("OtherObject_Node/RoomInfoOtherObject/Gog_Live_Node/Btn_Comp/Btn_Comp_over");
        this.btn_element.txt_helper = this.getNode("OtherObject_Node/RoomInfoOtherObject/Gog_Live_Node/txt_Comp");
        this.registerMouseEvent(this.btn_element.btn_music, this.mouseDownSound.bind(this), this.mouseUpSound.bind(this), this.enterBtn.bind(this), this.overBtn.bind(this));
        this.registerMouseEvent(this.btn_element.btn_screen, this.mouseDownSound.bind(this), this.screenUp.bind(this), this.enterBtn.bind(this), this.overBtn.bind(this));
        this.registerMouseEvent(this.btn_element.btn_helper, this.picHelperVisible.bind(this,false), this.upHelper.bind(this), this.picHelperVisible.bind(this,true), this.picHelperVisible.bind(this,false));

        this.btn_element.btn_music._isClick = ui_Effect.getInstance().isMute();
        this.btn_element.btn_screen._isClick = ui_Effect.getInstance().isFullScreen();

        this.btn_element.pic_music_off.setPosition(this.btn_element.pic_music_on.getPosition());
        this.btn_element.pic_music_off.setVisible(this.btn_element.btn_music._isClick);
        this.btn_element.pic_music_on.setVisible(!this.btn_element.btn_music._isClick);
        this.btn_element.pic_helper.setVisible(false);

        this.btn_element.txt_helper.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);

        if (ui_Effect.getInstance().isMute())
            setRoomBackgroundMusic(false);
    },

    picHelperVisible:function (val) {
        this.btn_element.pic_helper.setVisible(val);
    },

    upHelper: function () {
        var lan = "en";
        switch (language_manager.getInstance().getLanguage()) {
            case language_manager.getInstance().Choose_Language.lan_English:
                lan = "en";
                break;
            case language_manager.getInstance().Choose_Language.lan_simCh:
                lan = "cn";
                break;
            case language_manager.getInstance().Choose_Language.lan_tradCh:
                lan = "tw";
                break;
        }
        var helperUrl = String.format("http://www.vir999.com/ipl/portal.php/game/rule?GameType=3001&Lang={0}&Version=1&HallID=6", lan);
        window.open(helperUrl);
    },

    screenUp: function (sender) {
        ui_Effect.getInstance().changeScreen();
        if (ui_Effect.getInstance().isFullScreen()) {
            var e = document.getElementById("gameCanvas");
            launchIntoFullscreen(e);
            return;
        }

        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }

    },

    mouseUpSound: function (sender) {
        ui_Effect.getInstance().changeMute();
        this.btn_element.pic_music_off.setVisible(!sender._isClick);
        this.btn_element.pic_music_on.setVisible(sender._isClick);
        setRoomBackgroundMusic(!ui_Effect.getInstance().isMute());
    },

    mouseDownSound: function (sender) {
        if (sender._isClick)
            return;
        var hoverSprite = sender.getChildByName(sender.getName() + "_over");
        if (hoverSprite)
            hoverSprite.setVisible(false);
    },

    enterBtn: function (sender) {
        this.signRoom.uiTip.setTipText(sender);
        if (sender._isClick)
            return;
        this.onChangSprite(this.btn_element.pic_over.getTexture().url, sender);
    },

    overBtn: function (sender) {
        this.signRoom.uiTip.hideTip();
        if (sender._isClick)
            return;
        var hoverSprite = sender.getChildByName(sender.getName() + "_over");
        sender.removeChild(hoverSprite);
    },

    onChangSprite: function (sprite_path, parent_node, z_order) {
        var hoverSprite = cc.Sprite.create(sprite_path);
        parent_node.addChild(hoverSprite, z_order);
        hoverSprite.setPosition(cc.p(parent_node.width / 2 * parent_node.getScaleX(), parent_node.height / 2 * parent_node.getScaleY()));
        hoverSprite.setName(parent_node.getName() + "_" + sprite_path.split("_")[sprite_path.split("_").length - 1].split(".")[0]);
    },

    showBtnBack: function (btn_control, val) {
        if (btn_control) {
            var backSprite = btn_control.getChildByName(btn_control.getName() + "_down");
            btn_control._isClick = val;
            if (val) {
                if (backSprite)
                    return;
                this.onChangSprite(this.btn_element.pic_down.getTexture().url, btn_control);
                var downSprite = btn_control.getChildByName(btn_control.getName() + "_over");
                downSprite.setName(btn_control.getName() + "_down");
                return;
            }
            if (btn_control.getChildByName(btn_control.getName() + "_down"))
                btn_control.removeAllChildren();
        }
    },

    update: function (dt) {
        this.showBtnBack(this.btn_element.btn_screen, ui_Effect.getInstance().isFullScreen());
        this.showBtnBack(this.btn_element.btn_music, ui_Effect.getInstance().isMute());

        if (language_manager.getInstance().getTextID(173) != this.btn_element.txt_helper.getString())
            this.btn_element.txt_helper.setString(language_manager.getInstance().getTextID(173));
    },


});