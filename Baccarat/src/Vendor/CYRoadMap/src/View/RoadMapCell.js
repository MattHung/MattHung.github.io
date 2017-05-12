/**
 * Created by chungyogroup on 2016/1/25.
 */
var NewRoadMapCell = cc.Sprite.extend({
    ctor: function (_imgName, _items) {
        var sp = cc.spriteFrameCache.getSpriteFrame(_imgName);
        this._super(sp);
        this.itemModel = _items;
        this.spriteImageName = _imgName;

    },
    flicker: function (_repeat) {
        this.runAction(cc.repeatForever(cc.sequence(cc.fadeIn(0.5), cc.fadeOut(0.5))));
    },
    stopFlicker: function () {
        if (this.getParent() == null) return;
        this.setOpacity(0);
        this.stopAllActions();
    }

});