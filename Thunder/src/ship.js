Ship = cc.Sprite.extend({
    _speed:420,
    _width:0,
    _height:0,

    _file_name:null,

    canBeAttack:false,

    ctor:function (ship_file_name) {
        cc.Sprite.prototype.ctor.call(this);

        this._file_name = ship_file_name;

        this._width = 60;
        this._height = 42;
        
        var animation = new cc.Animation();
        animation.setDelayPerUnit(0.06);

        var x = 0;
        var y = 0;
        for (var i = 1; i <= 2; i++){
            animation.addSpriteFrame(cc.SpriteFrame.create(this._file_name, cc.rect(x, y, this._width, this._height)));
            x+=this._width;
        }
        
        this.runAction(cc.repeatForever(cc.animate(animation)));
        this.resetShip();
        this.schedule(this.shoot, 1 / 10);
    },

    getSpeed:function(){
        return this._speed;
    },

    collideRect:function(){
        var contentSize = this.getContentSize();
        var p = this.getPosition();
        return cc.rect(p.x - contentSize.width / 2, p.y - contentSize.height / 2, contentSize.width, contentSize.height);
    },

    getContentSize:function(){
        return cc.size(this._width * this.getScaleX(), this._height * this.getScaleY());
    },

    getImageSize:function(){
        return cc.size(this._width, this._height);
    },

    resetShip:function(showExplosion){
        if(showExplosion){
            var explosion = new Explosion();
            explosion.setPosition(this.getPosition());
            this.getParent().addChild(explosion);
        }
        
        this.setPosition(cc.winSize.width / 2, 150);
        this.setAnchorPoint(cc.p(0.5, 0.5));
        this.setScale(2.7, 2.7);

        //revive effect
        this.canBeAttack = false;
        var ghostSprite = cc.Sprite.create(this._file_name, cc.rect(0, 45, 60, 38));
        ghostSprite.setAnchorPoint(cc.p(0.5, 0.5));
        ghostSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
        ghostSprite.setScale(108);
        ghostSprite.setPosition(this.getImageSize().width / 2,  this.getImageSize().height / 2);
        
        this.addChild(ghostSprite, 3000, 99999);
        
        var blinks = cc.Blink.create(2, 10);
        var makeBeAttack = new cc.CallFunc(function (t) {
            t.canBeAttack = true;
            t.removeChild(ghostSprite,true);
        });

        ghostSprite.runAction(cc.ScaleTo.create(1, 1));
        this.runAction(new cc.Sequence(cc.DelayTime.create(1), blinks, makeBeAttack));
    },
    
    shoot:function () {
        var p1 = this.getPosition();
        p1.x-=33;
        p1.y+=50;

        var p2 = this.getPosition();
        p2.x+=33;
        p2.y+=50;

        var b1 = BulletPool.getInstance().pop(BULLETTYPE.SHIP);
        b1.setPosition(p1);        
        this.getParent().addChild(b1);

        var b2 = BulletPool.getInstance().pop(BULLETTYPE.SHIP);
        b2.setPosition(p2);        
        this.getParent().addChild(b2);
    }
});
