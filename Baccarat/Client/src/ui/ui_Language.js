/**
 * Created by nora_wang on 2017/1/17.
 */
var ui_Language = gameLayer.extend({
    _logoPic: null,
    _btn_lang: null,
    _signUpRoom: null,

    ctor: function (RoomNode, signUpRoom) {
        this._super(RoomNode);
        this._signUpRoom = signUpRoom;
        this.initialNode();
        this.settingLogo();
    },

   
    initialNode: function () {
        this._logoPic = {};
        this._logoPic.en = this.getNode("tx_gog_live_title_us");
        this._logoPic.simCh = this.getNode("tx_gog_live_title_cn");
        this._logoPic.tradCh = this.getNode("tx_gog_live_title_tw");

        var node = this.getNode("language_Node");
        node.addChild(this);
        this._logoPic.tradCh.setVisible(false);
    },

    settingLogo: function () {
        var logo = cc.Sprite.create();
        logo.setPosition(this._logoPic.tradCh.getPositionX(), this._logoPic.tradCh.getPositionY());
        this.addChild(logo);

        switch (language_manager.getInstance().getLanguage()) {
            case language_manager.getInstance().Choose_Language.lan_English:
                logo.setTexture(this._logoPic.en.getTexture());
                break;
            case language_manager.getInstance().Choose_Language.lan_simCh:
                logo.setTexture(this._logoPic.simCh.getTexture());
                break;
            case language_manager.getInstance().Choose_Language.lan_tradCh:
                logo.setTexture(this._logoPic.tradCh.getTexture());
                break;
        }
    }
});