/**
 * Created by chungyogroup on 2016/1/29.
 */

var AskRoadMapView = ccui.Layout.extend({
    ctor: function () {
        this._super();
    },

    setContentSize: function (_size) {
        this._super(_size);
        this._itemImgViewSize = _size;

        this.bigEyesSprite = new cc.Sprite();
        this.bigEyesSprite.setAnchorPoint(cc.p(0.5, 0.5));
        this.addChild(this.bigEyesSprite);

        this.smallSprite = new cc.Sprite();
        this.smallSprite.setAnchorPoint(cc.p(0.5, 0.5));
        this.addChild(this.smallSprite);

        this.gySprite = new cc.Sprite();
        this.gySprite.setAnchorPoint(cc.p(0.5, 0.5));
        this.addChild(this.gySprite);

        var _width = _size.width / 3;
        var _height = _size.height / 2;
        //this._itemImgViewSize ＝ cc.size(_width, _size.height);

        this.bigEyesSprite.setPosition(cc.p(_width / 2, _height));
        this.smallSprite.setPosition(cc.p(_size.width / 2, _height));
        this.gySprite.setPosition(cc.p(_size.width - _width / 2, _height));

    },
    setImgPath: function (_node, _path) {
        if (!cc.sys.isNative) return;
        _node.setOpacity(255);
        _node.setSpriteFrame(_path);
        _node.cySetSize(cc.size(this._itemImgViewSize.height / 2, this._itemImgViewSize.height / 2));
        _node.cyRunAction(cc.fadeIn(0.3));
        //_node.setScale(0.8);
    },
    resetImgPath: function () {
        this.bigEyesSprite.setOpacity(0);
        this.smallSprite.setOpacity(0);
        this.gySprite.setOpacity(0);
    },

});