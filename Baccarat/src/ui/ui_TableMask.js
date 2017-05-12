/**
 * Created by helen_pai on 2016/12/1.
 */

var ui_TableMask = gameLayer.extend({
    EXIST_MAX_TIME: 25,
    REMOVE_MAX_TIME: 25,
    AREA_NAME: 4,
    AREA_NUMBER: 3,
    _mainNodes: null,
    _target: null,
    _existTime: 0,
    _removeTime: 0,
    _isAdd: false,
    _clippingNode: null,
    _white: null,
    _sprite: null,

    ctor: function (main_node, widget_path) {
        this._super(main_node);
        this._mainNodes = main_node;
        this._target = CocosWidget.getNode(this._mainNodes, widget_path); //"Table_Node/Btn_Player"
        var imgNumber = this._target._normalFileName.split("/")[this.AREA_NAME].split("_")[this.AREA_NUMBER];
        this._sprite = new cc.Sprite.create(this.getNode("Table_Hover_Node/bet_area_bet_"+imgNumber).getTexture().url);
        this._clippingNode = new cc.ClippingNode(new cc.Sprite.create(this._target._normalFileName));
        this._clippingNode.setAlphaThreshold(0.8);
        this._clippingNode.setPosition(this._target.width / 2, this._target.height / 2);
        this._clippingNode.addChild(this._sprite);

        this._target.addChild(this._clippingNode);
    },

    clearMask: function () {
        this._target.removeChild(this._clippingNode);
        this._sprite = null;
        this._mainNodes = null;
        this._target = null;
        this._existTime = 0;
        this._removeTime = 0;
        this._isAdd = false;
    },

    updateMask: function () {
        if (this._target == null)return;
        this._existTime++;
        if (!this._isAdd) {
            this._clippingNode.setVisible(true);
            this._isAdd = true;
        }
        if (this._existTime > this.EXIST_MAX_TIME) {
            if (this._removeTime > this.REMOVE_MAX_TIME) {
                this._removeTime = 0;
                this._existTime = 0;
                this._isAdd = false;
                return;
            }
            this._clippingNode.setVisible(false);
            this._removeTime++;
        }
    },

    update: function (dt) {
        this.updateMask();
    }
});