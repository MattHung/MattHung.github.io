/**
 * Created by helen_pai on 2016/12/16.
 */

var EffectClassify = {
    Voice: 0,
    Effect: 1,
    BGMusic: 2
};

var SoundState = {
    Mute: 0,
    MuteToPlay: 1,
    Play: 2,
    PlayToMute: 3
};

var LayerZOrder = {
    Background: -1,
    BetChip: 2,
    ChooseChip: 3,
    SoundTable: 4
};

var ui_EffectController = gameLayer.extend({
    PERCENT_CONSTANCE: 100,
    MUSIC_COUNT: 5,
    SLIDER_VELOCITY: 5,
    SPLIT_MUSIC_NAME: 1,
    btnController: [],
    WebInfo: {},
    SoundTable: {},
    effectArray: [],
    outScenePos: cc.p(),
    soundState: SoundState.Play,
    _room: null,
    _mainNode: null,
    _isMute: false,
    _leaveMsgOpen: false,

    ctor: function (main_node, room) {
        this._super(main_node);
        this._mainNode = main_node;
        this._room = room;
        this.setLocalZOrder(LayerZOrder.SoundTable);
        this.initVariable();
        this.initMusicList();
        this.initSet();
        this.initSoundTable();
        this.eventBuild();
    },

    initVariable: function () {
        this.btnController = [];
        this.WebInfo = {};
        this.SoundTable = {};
        this.effectArray = [];
        this.outScenePos = cc.p();
        this._leaveMsgOpen = false;
    },

    initSet: function () {
        this.WebInfo._classification = "Web_Node";
        this.btnController.push(this.WebInfo);
        // this.btnController.push(this.MobileInfo);
        this.soundState = SoundState.Play;
        for (var i = 0; i < this.btnController.length; i++) {
            this.btnController[i].btnMusic = this.getNode("Chip_Node/" + this.btnController[i]._classification + "/other_set_Node/Btn_music");
            this.btnController[i].btnVolumeOn = this.getNode("Chip_Node/" + this.btnController[i]._classification + "/other_set_Node/Btn_vol");
            this.btnController[i].btnVolumeOff = this.getNode("Chip_Node/" + this.btnController[i]._classification + "/other_set_Node/Btn_vol_off");
            this.btnController[i].btnVolCtrl = this.getNode("Chip_Node/" + this.btnController[i]._classification + "/other_set_Node/Btn_vol_Control");
            this.btnController[i].btnFullScreen = this.getNode("Chip_Node/" + this.btnController[i]._classification + "/other_set_Node/Btn_fullScreen");
            this.btnController[i].btnExit = this.getNode("Chip_Node/" + this.btnController[i]._classification + "/other_set_Node/Btn_exit");
            this.btnController[i].btnVideo = this.getNode("Chip_Node/" + this.btnController[i]._classification + "/other_set_Node/Btn_Video");
            this.btnController[i].btnHistory = this.getNode("Chip_Node/" + this.btnController[i]._classification + "/other_set_Node/Btn_BetHistory");

            this.btnController[i].btnVolumeOff.setVisible(false);

            this.btnController[i].btnMusic._isClicked = false;
            this.btnController[i].btnVolCtrl._isClicked = false;
            this.btnController[i].btnVolCtrl._isClicked = !ui_Effect.getInstance().isMute();
            this.btnController[i].btnFullScreen._isClicked = !ui_Effect.getInstance().isFullScreen();
            this.btnController[i].btnExit._isClicked = false;
            this.btnController[i].btnVideo._isClicked = false;
            this.btnController[i].btnHistory._isClicked = false;
            this.screenControl(this.btnController[i].btnFullScreen);
        }
        this.getNode("MusicControl_Node").setVisible(false);
        this._isMute = !ui_Effect.getInstance().isMute();
        this.mouseUpTableIcon();

    },

    initSoundTable: function () {
        this.outScenePos = this.getNode("Other_Node/Setting_over").getPosition();
        for (var effect in EffectClassify) {
            var effectInfo = {};
            effectInfo._classification = effect;
            effectInfo._innerPos = this.getNode("MusicControl_Node/MainControl/" + effect.toString() + "_Node/Btn_Pos").getPosition();
            effectInfo._btnOn = this.getNode("MusicControl_Node/MainControl/" + effect.toString() + "_Node/Btn_ON");
            effectInfo._btnOff = this.getNode("MusicControl_Node/MainControl/" + effect.toString() + "_Node/Btn_OFF");
            effectInfo._isPlay = sound_manager.getInstance().getInitEffect(EffectClassify[effect]);
            effectInfo._slider = this.getNode("MusicControl_Node/MainControl/" + effect.toString() + "_Node/SliderArea_Node/Slider_On/Music_Slider");
            effectInfo._sliderOff = this.getNode("MusicControl_Node/MainControl/" + effect.toString() + "_Node/SliderArea_Node/Slider_Off");
            effectInfo._sliderOnPanel = this.getNode("MusicControl_Node/MainControl/" + effect.toString() + "_Node/SliderArea_Node/Slider_On/Music_Slider/Panel");
            effectInfo._sliderOffPanel = this.getNode("MusicControl_Node/MainControl/" + effect.toString() + "_Node/SliderArea_Node/Slider_Off/Music_Slider/Panel");
            effectInfo._sliderInnerPos = effectInfo._slider.parent.getPosition();
            effectInfo._curtPercent = 100;
            effectInfo._originPercent = 100;
            effectInfo._finPercent = 100;
            effectInfo._isSlider = false;
            this.effectArray.push(effectInfo);
        }
        this.SoundTable.btnIconOn = this.getNode("MusicControl_Node/TittleArea/Btn_Mute_on");
        this.SoundTable.btnIconOff = this.getNode("MusicControl_Node/TittleArea/Btn_Mute_off");
        this.SoundTable.iconPos = this.getNode("MusicControl_Node/TittleArea/Btn_Mute_on").getPosition();
    },

    initMusicList: function () {

        this.SoundTable.tableNode = this.getNode("MusicControl_Node");
        this.SoundTable.txtTableArray = this.getNode("MusicControl_Node/Language_Node").children;
        this.SoundTable.btnList = this.getNode("MusicControl_Node/Btn_List_Node/Btn_MusicSelect");
        this.SoundTable.btnFileName = this.getNode("MusicControl_Node/Btn_List_Node/txt_SelectFileName");
        this.SoundTable.btnListOpen = this.getNode("MusicControl_Node/Btn_List_Node/pic_music_open");
        this.SoundTable.btnListClose = this.getNode("MusicControl_Node/Btn_List_Node/pic_music_close");
        this.SoundTable.btnInnerPos = this.SoundTable.btnListOpen.getPosition();
        this.SoundTable.musicList = this.getNode("MusicControl_Node/List");
        this.SoundTable.isListOpen = false;
        this.SoundTable.musicListModel = this.getNode("MusicControl_Node/SelectMusic_Node");

        this.SoundTable.musicList.setScrollBarEnabled(false);

        this.SoundTable.img = {};
        this.SoundTable.img["ListHover"] = this.getNode("MusicControl_Node/SelectMusic_Node/SelcetMusic_over");
        this.SoundTable.img["MuteOnHover"] = this.getNode("MusicControl_Node/TittleArea/Mute_on_over");
        this.SoundTable.img["MuteOffHover"] = this.getNode("MusicControl_Node/TittleArea/Mute_off_over");
        this.SoundTable.img["CtrlHover"] = this.getNode("Other_Node/Set_Btn/setting_over");
        this.SoundTable.img["CtrlDown"] = this.getNode("Other_Node/Set_Btn/setting_down");
        this.SoundTable.img["TableBg"] = this.getNode("MusicControl_Node/pic_music_bg");
        this.SoundTable.img["ListOpenOff"] = this.getNode("MusicControl_Node/Btn_List_Node/pic_music_open_no");

        this.SoundTable.btnFileName.setString(sound_manager.getInstance().getInitMusicName());
        var bgModel = this.getNode("MusicControl_Node/SelectMusic_Node/SelcetMusic_Bg");

        for (var i = 0; i < this.MUSIC_COUNT; i++) {
            var cloneList = this.SoundTable.musicListModel.clone();
            cloneList.children[0].setString("live 0" + (i + 1).toString());
            var bgSprite = new cc.Sprite.create(bgModel.getTexture().url);
            bgSprite.setPosition(cc.p(bgModel.getPositionX(), bgModel.getPositionY()));
            bgSprite.setName(bgModel.getName());
            cloneList.addChild(bgSprite, LayerZOrder.Background);
            cloneList.setName("Panel_" + (i + 1).toString());
            this.SoundTable.musicList.insertCustomItem(cloneList, i);
            this.SoundTable.musicList.forceDoLayout();
            this.registerMouseEvent(cloneList, null, this.mouseUpList.bind(this), this.mouseEnterList.bind(this), this.mouseOverList.bind(this));
        }
        this.SoundTable.musicList.setVisible(false);
    },

    mouseUpList: function (node) {
        node.removeChild(node.getChildByName(node.getName() + "_over"));
        this.SoundTable.btnFileName.setString(node.getChildByName("FileName").getString());
        this.SoundTable.isListOpen = false;
        sound_manager.getInstance().setBGMusic("live" + node.getName().split("_")[1], 1);
    },

    mouseEnterList: function (node, mouse_point) {
        this.onChangSprite(this.SoundTable.img["ListHover"].getTexture().url, node, LayerZOrder.Background);
    },

    mouseOverList: function (node) {
        var overChild = node.getChildByName(node.getName() + "_over");
        node.removeChild(overChild);
    },

    mouseUpBtnList: function (sender) {
        if (this._isMute)
            return;
        this.SoundTable.isListOpen = !this.SoundTable.isListOpen;
    },

    mouseUpOffSlider: function (node, mouseHitPoint) {
        var index = -1;
        index = this.checkIndex(node.parent.parent.parent.parent);
        if (index >= 0) {
            var currentSlider = this.effectArray[index]._slider;
            this.effectArray[index]._originPercent = this.effectArray[index]._slider.getPercent();
            this.effectArray[index]._curtPercent = this.effectArray[index]._originPercent;
            this.effectArray[index]._finPercent = (  mouseHitPoint.x - node.convertToWorldSpace(new cc.Point(0, 0)).x) / node.width * 100;
            currentSlider.parent.setPosition(this.effectArray[index]._sliderInnerPos);
            this.effectArray[index]._sliderOff.setPosition(this.outScenePos);
            this.soundState = SoundState.MuteToPlay;
            this.effectArray[index]._isPlay = true;
            if (ui_Effect.getInstance().isMute())
                ui_Effect.getInstance().changeMute();
        }
    },

    mouseSlide: function (node) {
        var index = -1;
        index = this.checkIndex(node.parent.parent.parent);
        if (index >= 0) {
            this.effectArray[index]._isSlider = false;
        }
    },

    mouseUpSlider: function (node, mouseHitPoint) {
        var index = -1;
        index = this.checkIndex(node.parent.parent.parent);
        if (index >= 0) {
            this.effectArray[index]._originPercent = this.effectArray[index]._slider.getPercent();
            this.effectArray[index]._curtPercent = this.effectArray[index]._originPercent;
            this.effectArray[index]._finPercent = (  mouseHitPoint.x - node.convertToWorldSpace(new cc.Point(0, 0)).x) / node.width * 100;
            this.effectArray[index]._isSlider = true;
        }
    },

    mouseUpTableIcon: function (sender) {
        this._isMute = !this._isMute;
        if (ui_Effect.getInstance().isMute() != this._isMute)
            ui_Effect.getInstance().changeMute();
        if (this._isMute)
            this.soundState = SoundState.PlayToMute;
        if (!this._isMute) {
            this.soundState = SoundState.MuteToPlay;
            for (var i = 0; i < this.effectArray.length; i++)
                this.effectArray[i]._isPlay = true;
        }

        for (var i = 0; i < this.btnController.length; i++)
            this.btnController[i].btnVolCtrl._isClicked = true;
    },

    enterTableIcon: function (sender) {
        if (sender == this.SoundTable.btnIconOn) {
            this.onChangSprite(this.SoundTable.img["MuteOnHover"].getTexture().url, sender);
            return;
        }
        this.onChangSprite(this.SoundTable.img["MuteOffHover"].getTexture().url, sender);
    },

    overTableIcon: function (sender) {
        sender.removeChild(sender.getChildByName(sender.getName() + "_over"));
    },

    changeTableBtn: function (sender) {
        this._isMute = false;
        this.soundState = SoundState.MuteToPlay;
        if (ui_Effect.getInstance().isMute())
            ui_Effect.getInstance().changeMute();

        var index = -1;
        index = this.checkIndex(sender.parent);

        this.effectArray[index]._isPlay = !this.effectArray[index]._isPlay;

        for (var i = 0; i < this.btnController.length; i++)
            this.btnController[i].btnVolCtrl._isClicked = true;
    },

    enterBtn: function (sender) {
        if (this._room.uiChooseChip._isShow)
            return;
        this._room.uiTip.setTipText(sender);

        if (sender._isClicked)
            return;
        this.onChangSprite(this.SoundTable.img["CtrlHover"].getTexture().url, sender, LayerZOrder.Background);
    },

    overBtn: function (sender) {
        this._room.uiTip.hideTip();
        sender.removeChild(sender.getChildByName(sender.getName() + "_over"));
        if (!sender._isClicked)
            sender.removeChild(sender.getChildByName(sender.getName() + "_down"));
    },

    mouseDownBtn: function (sender) {
        if (this._room.uiChooseChip._isShow)
            return;
        this._room.uiTableArea.hideQuickBet();
        if (sender._isClicked)
            return;
        this.SoundTable.img["TableBg"].setLocalZOrder(LayerZOrder.Background);
        this.onChangSprite(this.SoundTable.img["CtrlDown"].getTexture().url, sender, LayerZOrder.Background);
    },

    onChangSprite: function (sprite_path, parent_node, z_order) {
        var hoverSprite = cc.Sprite.create(sprite_path);
        parent_node.addChild(hoverSprite, z_order);
        hoverSprite.setPosition(cc.p(parent_node.width / 2 * parent_node.getScaleX(), parent_node.height / 2 * parent_node.getScaleY()));
        hoverSprite.setName(parent_node.getName() + "_" + sprite_path.split("_")[sprite_path.split("_").length - 1].split(".")[0]);
    },

    checkIndex: function (parent) {
        var index = -1;
        for (var classify in EffectClassify) {
            if (classify.toString() + "_Node" != parent.getName())
                continue;
            index = EffectClassify[classify];
        }
        return index;
    },

    mouseDownHistory: function (sender) {
        if (this._room.uiChooseChip._isShow)
            return;
        this._room.uiTableArea.hideQuickBet();
        this.SoundTable.img["TableBg"].setLocalZOrder(LayerZOrder.Background);
        this.onChangSprite(this.SoundTable.img["CtrlDown"].getTexture().url, sender, LayerZOrder.Background);
    },

    mouseUpHistory: function (sender) {
        if (this._room.uiChooseChip._isShow)
            return;
        if (sender.getChildByName(sender.getName() + "_down"))
            sender.removeChild(sender.getChildByName(sender.getName() + "_down"));
        var url = null;
        url = this.getBetHistoryLink();
        if (url)
            window.open(url);
    },

    getBetHistoryLink: function () {
        // http://www.vir999.com/ipl/portal.php/game/betrecord_search/kind35?GameKind=35&GameType=35101&lang=tw&sid=f83f0e759f3f44c8aa98a5e904877d292d306ed4
        // »y¨t=tw,cn,us

        var lan = language_manager.getInstance().getBetHistoryLang();
        var sid = AccountCenter.getInstance().getSessionID();

        if (!sid)
            return null;
        if (sid == "")
            return null;

        //web vsersion
        if (!cc.sys.isNative) {
            return window.location.protocol + "//" + window.location.hostname +
                "/ipl/portal.php/game/betrecord_search/kind35?GameKind=35&GameType=35101&lang=" + lan + "&sid=" + sid;
        }
    },

    eventBuild: function () {
        this.registerMouseEvent(this.SoundTable.img["TableBg"], null, null, function () {
        });
        this.SoundTable.img["TableBg"].setLocalZOrder(0);

        for (var i = 0; i < this.btnController.length; i++) {
            this.registerMouseEvent(this.btnController[i].btnMusic, this.mouseDownBtn.bind(this), this.musicControl.bind(this), this.enterBtn.bind(this), this.overBtn.bind(this));
            this.registerMouseEvent(this.btnController[i].btnFullScreen, this.mouseDownBtn.bind(this), this.screenControl.bind(this), this.enterBtn.bind(this), this.overBtn.bind(this));
            this.registerMouseEvent(this.btnController[i].btnExit, null, this.onLeave.bind(this), this.enterBtn.bind(this), this.overBtn.bind(this));
            this.registerMouseEvent(this.btnController[i].btnVolCtrl, this.mouseDownBtn.bind(this), this.soundControl.bind(this), this.enterSound.bind(this), this.overSound.bind(this));
            this.registerMouseEvent(this.btnController[i].btnVideo, this.mouseDownBtn.bind(this), this.videoCtrl.bind(this), this.enterBtn.bind(this), this.overBtn.bind(this));
            this.registerMouseEvent(this.btnController[i].btnHistory, this.mouseDownHistory.bind(this), this.mouseUpHistory.bind(this), this.enterBtn.bind(this), this.overBtn.bind(this));
        }

        for (var i = 0; i < this.effectArray.length; i++) {
            this.registerMouseEvent(this.effectArray[i]._btnOn, this.changeTableBtn.bind(this));
            this.registerMouseEvent(this.effectArray[i]._btnOff, this.changeTableBtn.bind(this));
            this.registerMouseEvent(this.effectArray[i]._sliderOffPanel, null, this.mouseUpOffSlider.bind(this));
            this.registerMouseEvent(this.effectArray[i]._slider, null, this.mouseUpSlider.bind(this));
            this.effectArray[i]._slider.addEventListener(this.mouseSlide.bind(this));
        }
        this.registerMouseEvent(this.SoundTable.btnIconOn, null, this.mouseUpTableIcon.bind(this), this.enterTableIcon.bind(this), this.overTableIcon.bind(this));
        this.registerMouseEvent(this.SoundTable.btnIconOff, null, this.mouseUpTableIcon.bind(this), this.enterTableIcon.bind(this), this.overTableIcon.bind(this));
        this.registerMouseEvent(this.SoundTable.btnList, null, this.mouseUpBtnList.bind(this), null, null);
    },

    musicControl: function (sender) {
        if (this._room.uiChooseChip._isShow)
            return;
        sender._isClicked = !sender._isClicked;
        if (sender._isClicked) {
            this.SoundTable.tableNode.setVisible(true);
            this.onChangSprite(this.SoundTable.img["CtrlDown"].getTexture().url, sender, LayerZOrder.Background);
            return;
        }

        if (!sender._isClicked) {
            this.SoundTable.tableNode.setVisible(false);
            sender.removeAllChildren();
            this.onChangSprite(this.SoundTable.img["CtrlHover"].getTexture().url, sender, LayerZOrder.Background);
        }

    },

    enterSound: function (sender) {
        if (this._room.uiChooseChip._isShow)
            return;
        this._room.uiTip.setTipText(sender);
        if (sender._isClicked)
            return;
        sender.parent.getChildByName("Btn_vol").removeAllChildren();
        sender.parent.getChildByName("Btn_vol").setVisible(false);
        sender.parent.getChildByName("Btn_vol_off").setVisible(true);
        this.enterBtn(sender.parent.getChildByName("Btn_vol_off"));
    },

    overSound: function (sender) {
        this._room.uiTip.hideTip();
        // if (sender.parent.getChildByName("Btn_vol")._isClicked)
        if (sender._isClicked)
            return;

        this.overBtn(sender.parent.getChildByName("Btn_vol_off"));
        sender.parent.getChildByName("Btn_vol_off").setVisible(false);
        sender.parent.getChildByName("Btn_vol").setVisible(true);
    },

    soundControl: function (sender) {
        if (this._room.uiChooseChip._isShow)
            return;
        sender._isClicked = !sender._isClicked;
        this._isMute = !this._isMute;
        sound_manager.getInstance().setSoundEffect(!this._isMute);
        sound_manager.getInstance().setSoundVoice(!this._isMute);
        if (ui_Effect.getInstance().isMute() != sender._isClicked) {
            ui_Effect.getInstance().changeMute();
        }
        if (this._isMute)
            this.soundState = SoundState.PlayToMute;
        if (!this._isMute) {
            for (var i = 0; i < this.effectArray.length; i++)
                this.effectArray[i]._isPlay = true;
            this.soundState = SoundState.MuteToPlay;
        }

        if (this._isMute) {
            sender.parent.getChildByName("Btn_vol").setVisible(false);
            sender.parent.getChildByName("Btn_vol_off").setVisible(true);
            this.onChangSprite(this.SoundTable.img["CtrlDown"].getTexture().url, sender.parent.getChildByName("Btn_vol_off"), LayerZOrder.Background)
        }
    },

    videoCtrl: function (sender) {
        if (this._room.uiChooseChip._isShow)
            return;
        sender._isClicked = !sender._isClicked;
        if (sender._isClicked) {
            VideoController.getInstance().CloseRushVideo();
            this.onChangSprite(this.SoundTable.img["CtrlDown"].getTexture().url, sender, LayerZOrder.Background);
        }

        if (!sender._isClicked) {
            VideoController.getInstance().OpenVideo();
            sender.removeAllChildren();
        }
    },

    toOriginScreen: function (sender) {
        sender.removeAllChildren();
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

    screenControl: function (sender) {
        if (this._room.uiChooseChip._isShow)
            return;
        sender._isClicked = !sender._isClicked;
        if (sender._isClicked != ui_Effect.getInstance().isFullScreen())
            ui_Effect.getInstance().changeScreen();
        if (sender._isClicked) {
            this.onChangSprite(this.SoundTable.img["CtrlDown"].getTexture().url, sender, LayerZOrder.Background);
            var e = document.getElementById("gameCanvas");
            launchIntoFullscreen(e);
            return;
        }

        this.toOriginScreen(sender);
    },

    onLeave: function (sender) {
        if (this._room.uiChooseChip._isShow)
            return;
        this._room.uiTableArea.hideQuickBet();
        if (!this._room.uiBetChip._isTakeSeat) {
            baccaratPeer.getInstance().sendMessage("LeaveRoom", {RoomID: GameManager.getInstance().Room.getRoomID()});
            return;
        }

        var txtTitle = String.format("{0}", language_manager.getInstance().getTextID(145));
        var txtContent = String.format("{0}", language_manager.getInstance().getTextID(146));
        if (!this._leaveMsgOpen) {
            this.showLeaveOption(txtTitle, txtContent);
            this._leaveMsgOpen = true;
        }
    },

    showLeaveOption: function (title, text) {
        var panel = new ui_MessageLeave();
        this.root_node.addChild(panel.root_node);
        panel.root_node.setName("msgLeave");
        panel.showLeaveQuestion(title, text);
    },

    setLeaveOpen: function (val) {
        this._leaveMsgOpen = val;
    },

    muteToPlay: function () {
        this._isMute = false;

        this.SoundTable.btnIconOn.removeAllChildren();
        this.SoundTable.btnIconOn.setPosition(this.SoundTable.iconPos);
        this.SoundTable.btnIconOff.setPosition(this.outScenePos);

        for (var i = 0; i < this.btnController.length; i++) {
            this.btnController[i].btnVolCtrl._isClicked = false;
            this.btnController[i].btnVolumeOff.removeAllChildren();
            this.btnController[i].btnVolumeOff.setVisible(false);
            this.btnController[i].btnVolumeOn.setVisible(true);
        }
    },

    playToMute: function () {
        sound_manager.getInstance().setEffectMute();

        this.SoundTable.btnIconOff.removeAllChildren();
        this.SoundTable.btnIconOff.setPosition(this.SoundTable.iconPos);
        this.SoundTable.btnIconOn.setPosition(this.outScenePos);

        for (var i = 0; i < this.btnController.length; i++) {
            this.btnController[i].btnVolCtrl._isClicked = true;
            this.btnController[i].btnVolumeOn.removeAllChildren();
            this.btnController[i].btnVolumeOn.setVisible(false);
            this.btnController[i].btnVolumeOff.setVisible(true);
            this.onChangSprite(this.SoundTable.img["CtrlDown"].getTexture().url, this.btnController[i].btnVolumeOff, LayerZOrder.Background)
        }


        for (var i = 0; i < this.effectArray.length; i++)
            this.effectArray[i]._isPlay = false;

        for (var i = 0; i < this.effectArray.length; i++) {
            // this.effectArray[i]._sliderOff.setLocalZOrder(0);
            this.effectArray[i]._sliderOff.setPosition(this.effectArray[i]._sliderInnerPos);
            this.effectArray[i]._slider.parent.setPosition(this.outScenePos);
        }
    },

    updateOnOff: function () {
        for (var i = 0; i < this.effectArray.length; i++) {
            if (this.effectArray[i]._isPlay) {
                this.effectArray[i]._btnOn.setPosition(this.effectArray[i]._innerPos);
                this.effectArray[i]._btnOff.setPosition(this.outScenePos);
                this.effectArray[i]._slider.getParent().setPosition(this.effectArray[i]._sliderInnerPos);
                this.effectArray[i]._sliderOff.setPosition(this.outScenePos);
                continue;
            }
            this.effectArray[i]._btnOn.setPosition(this.outScenePos);
            this.effectArray[i]._btnOff.setPosition(this.effectArray[i]._innerPos);
            this.effectArray[i]._slider.parent.setPosition(this.outScenePos);
            this.effectArray[i]._sliderOff.setPosition(this.effectArray[i]._sliderInnerPos);
        }
    },

    updateMusicList: function () {
        this.SoundTable.musicList.setVisible(this.SoundTable.isListOpen);

        if (this._isMute) {
            this.SoundTable.btnListClose.setPosition(this.outScenePos);
            this.SoundTable.btnListOpen.setPosition(this.outScenePos);
            this.SoundTable.img["ListOpenOff"].setPosition(this.SoundTable.btnInnerPos);
            this.SoundTable.isListOpen = false;
            return;
        }
        this.SoundTable.img["ListOpenOff"].setPosition(this.outScenePos);

        if (this.SoundTable.isListOpen) {
            this.SoundTable.btnListClose.setPosition(this.SoundTable.btnInnerPos);
            this.SoundTable.btnListOpen.setPosition(this.outScenePos);
        }
        if (!this.SoundTable.isListOpen) {
            this.SoundTable.btnListClose.setPosition(this.outScenePos);
            this.SoundTable.btnListOpen.setPosition(this.SoundTable.btnInnerPos);
        }
    },

    updateSliderBall: function (dt) {
        for (var i = 0; i < this.effectArray.length; i++) {
            if (!this.effectArray[i]._isSlider)
                continue;
            if (this.effectArray[i]._curtPercent == this.effectArray[i]._finPercent) {
                this.effectArray[i]._isSlider = false;
                continue;
            }
            this.effectArray[i]._slider.setPercent(this.effectArray[i]._curtPercent);
            this.effectArray[i]._curtPercent -= (this.effectArray[i]._curtPercent - this.effectArray[i]._finPercent) * dt * this.SLIDER_VELOCITY;

        }

    },

    updateSound: function () {
        for (var i = 0; i < this.effectArray.length; i++) {
            if (sound_manager.getInstance().getSoundMap()[i] == null)
                continue;
            switch (i) {
                case EffectClassify.BGMusic:
                    sound_manager.getInstance().setSoundBGM(this.effectArray[i]._isPlay);
                    if (this.effectArray[i]._isPlay) {
                        if (!cc.audioEngine.isMusicPlaying())
                            cc.audioEngine.resumeMusic();
                        sound_manager.getInstance().setMusicVol(this.effectArray[i]._slider.getPercent() / this.PERCENT_CONSTANCE);
                        break;
                    }
                    if (cc.audioEngine.isMusicPlaying())
                        cc.audioEngine.pauseMusic();
                    break;

                case EffectClassify.Effect:
                    sound_manager.getInstance().setSoundEffect(this.effectArray[i]._isPlay);
                    if (this.effectArray[i]._isPlay) {
                        sound_manager.getInstance().setEffectVol(this.effectArray[i]._slider.getPercent() / this.PERCENT_CONSTANCE);
                        break;
                    }
                    sound_manager.getInstance().setEffectVol(0);
                    break;

                case EffectClassify.Voice:
                    sound_manager.getInstance().setSoundVoice(this.effectArray[i]._isPlay);
                    if (this.effectArray[i]._isPlay) {
                        sound_manager.getInstance().setVoiceVol(this.effectArray[i]._slider.getPercent() / this.PERCENT_CONSTANCE);
                        break;
                    }
                    sound_manager.getInstance().setVoiceVol(0);
                    break;
            }
        }
    },

    updateTableLanguage: function () {
        for (var i = 0; i < this.SoundTable.txtTableArray.length; i++) {
            var langIndex = 109 + i;
            this.SoundTable.txtTableArray[i].setString(language_manager.getInstance().getTextID(langIndex));
            this.SoundTable.txtTableArray[i].setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        }
    },

    update: function (dt) {
        this.updateOnOff();
        this.updateMusicList();
        this.updateTableLanguage();
        this.updateSliderBall(dt);
        this.updateSound();
        for (var i = 0; i < this.effectArray.length; i++) {
            this.effectArray[i]._sliderOffPanel.parent.setPercent(this.effectArray[i]._slider.getPercent());
        }

        switch (this.soundState) {
            case SoundState.Mute:
                break;

            case SoundState.MuteToPlay:
                this.muteToPlay();
                this.soundState = SoundState.Play;
                break;

            case SoundState.Play:
                break;

            case SoundState.PlayToMute:
                this.playToMute();
                this.soundState = SoundState.Mute;
                break;

        }

    }

});