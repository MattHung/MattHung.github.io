/**
 * Created by helen_pai on 2017/3/3.
 */

ui_Effect = cc.Class.extend({
    _isFullScreen: null,
    _isMute: null,

    isFullScreen: function () {
        return this._isFullScreen;
    },

    isMute: function () {
        return this._isMute;
    },

    ctor: function () {
        if (this._isFullScreen == null)
            this._isFullScreen = false;
        if (this._isMute == null)
            this._isMute = false;
    },

    changeScreen: function () {
        this._isFullScreen = !this._isFullScreen;
    },

    changeMute: function () {
        this._isMute = !this._isMute;
    },


});

ui_Effect._instance = null;
ui_Effect.getInstance = function () {
    if (ui_Effect._instance == null)
        ui_Effect._instance = new ui_Effect();
    return ui_Effect._instance;
};

