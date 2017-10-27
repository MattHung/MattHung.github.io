var BULLETTYPE = {
    SHIP:{value: 1, x:0, y:0, w:15, h:12, scaleX:2.5, scaleY:2.5, speed:26}, 
    ENEMY:{value: 2, x:15, y:0, w:20, h:12, scaleX:1.1, scaleY:1.1, speed:-3}, 
};

Bullet = cc.Sprite.extend({
    _width:0,
    _height:0,
    _type:0,

    ctor:function (type) {
        cc.Sprite.prototype.ctor.call(this);

        this._type = type;
        this._width = this._type.w;
        this._height = this._type.h;
        this.initWithFile("/res/assets/RetroBullet.png", cc.rect(this._type.x, this._type.y, this._width, this._height));

        this.setAnchorPoint(cc.p(0.5, 0.5));
        this.setScale(this._type.scaleX, this._type.scaleY);
    },

    getType:function(){
        return this._type;
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

    destroy:function () {
        this.getParent().removeChild(this);
        BulletPool.getInstance().push(this);
    }
});

bulletPool=cc.Class.extend({
    _pool_ship:null,
    _pool_enemy:null,

    _running_ship:null,
    _running_enemy:null,

    ctor:function(){      
        this._pool_ship=[];
        this._pool_enemy=[];

        this._running_ship={};
        this._running_enemy={};

        cc.director.getScheduler().scheduleUpdate(this);
    },

    getBullets:function(type){
        switch(type.value){
            case BULLETTYPE.SHIP.value:                
                return this._running_ship;
                break;
            case BULLETTYPE.ENEMY.value:
                return this._running_enemy;
                break;
        }
    },

    pop:function(type){
        var result = null;
        switch(type.value){
            case BULLETTYPE.SHIP.value:
                result = this._pool_ship.shift();
                if(!result)
                    result = new Bullet(type);
                this._running_ship[result.__instanceId] = result;
                break;
            case BULLETTYPE.ENEMY.value:
                result = this._pool_enemy.shift();
                if(!result)
                    result = new Bullet(type);
                this._running_enemy[result.__instanceId] = result;                
                break;
        }

        return result;
    },

    push:function(bullet){
        bullet.setPosition(9999, 9999);
        switch(bullet.getType().value){
            case BULLETTYPE.SHIP.value:
                delete this._running_ship[bullet.__instanceId];                
                this._pool_ship.push(bullet);                 
                break;
            case BULLETTYPE.ENEMY.value:
                delete this._running_enemy[bullet.__instanceId];
                this._pool_enemy.push(bullet);
                break;
        }
    },

    update:function(){
        var ready_recycle = [];
        for(bullet in this._running_ship){
            bullet = this._running_ship[bullet];
            var p = bullet.getPosition();
            p.y +=bullet.getType().speed;
            bullet.setPosition(p);

            if(bullet.getPosition().y > cc.winSize.height + 50)
                ready_recycle.push(bullet);                
        };

        for(bullet in this._running_enemy){
            bullet = this._running_enemy[bullet];
            var p = bullet.getPosition();
            p.y +=bullet.getType().speed;
            bullet.setPosition(p);

            if(bullet.getPosition().y <= -50)
                ready_recycle.push(bullet);                
        };

        for(bullet in ready_recycle){
            bullet = ready_recycle[bullet];
            bullet.destroy();
        }
    }
});

BulletPool = function(){};
BulletPool.getInstance=function(){
    if(!BulletPool._instance)
        BulletPool._instance = new bulletPool();
    return BulletPool._instance;
};

