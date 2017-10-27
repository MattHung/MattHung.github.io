var ENEMYTYPE = {
    TYPE1:{value: 1, x:0, y:0, w:83, h:47, scaleX:2.5, scaleY:2.5, speed:30, rotation:0, score:5}, 
    TYPE2:{value: 2, x:83, y:0, w:42, h:58, scaleX:2.5, scaleY:2.5, speed:30, rotation:-90, score:8}, 
    TYPE3:{value: 3, x:0, y:46, w:62, h:41, scaleX:2.5, scaleY:2.5, speed:30, rotation:0, score:6}, 
    TYPE4:{value: 4, x:63, y:58, w:47, h:28, scaleX:2.5, scaleY:2.5, speed:30, rotation:0, score:15}, 
    TYPE5:{value: 5, x:0, y:87, w:67, h:29, scaleX:2.5, scaleY:2.5, speed:30, rotation:0, score:3}, 
    TYPE6:{value: 6, x:68, y:85, w:57, h:33, scaleX:2.5, scaleY:2.5, speed:30, rotation:0, score:13}, 
};

Enemy = cc.Sprite.extend({
    _width:0,
    _height:0,

    canBeAttack:false,

    ctor:function (type) {
        cc.Sprite.prototype.ctor.call(this);
        
        this._type = type;
        this._width = this._type.w;
        this._height = this._type.h;
        
        this._width = this._type.w;
        this._height = this._type.h;
        this.rotation = this._type.rotation;
        this.initWithFile("/res/assets/Enemy.png", cc.rect(this._type.x, this._type.y, this._width, this._height));

        this.setAnchorPoint(cc.p(0.5, 0.5));
        this.setScale(this._type.scaleX, this._type.scaleY);

        this.setPosition(CCRandom.getRandomInt(0, cc.winSize.width), cc.winSize.height + this.getContentSize().height)

        EnemyPool.getInstance().notifyCreate(this);
    },

    getScore:function(){
        return this._type.score;
    },

    getSpeed:function(){
        return this._type.speed;
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

    destroy:function(){
        var explosion = new Explosion();
        explosion.setPosition(this.getPosition());
        this.getParent().addChild(explosion);

        this.getParent().removeChild(this);
        EnemyPool.getInstance().notifyDestroy(this);
    },

    shoot:function () {
        var p = this.getPosition();
        p.y-=40;
        var bullet = BulletPool.getInstance().pop(BULLETTYPE.ENEMY);
        bullet.setPosition(p);        
        this.getParent().addChild(bullet);
    }
});

enemyPool=cc.Class.extend({    
    _running_enemy:null,

    ctor:function(){         
        this._running_enemy={};

        cc.director.getScheduler().scheduleUpdate(this);
    },

    getAll:function(){
        return this._running_enemy;
    },

    notifyCreate:function(enemy){
        this._running_enemy[enemy.__instanceId] = enemy;
    },

    notifyDestroy:function(enemy){
        delete this._running_enemy[enemy.__instanceId];        
    },

    update:function(){
        var tolerantValue = 100;
        var ready_destroy = [];
        for(enemy in this._running_enemy){
            enemy = this._running_enemy[enemy];

            var contentSize = enemy.getContentSize();

            if(enemy.getPosition().y - contentSize.height / 2 > cc.winSize.height + tolerantValue){
                ready_destroy.push(enemy);
                continue;
            }

            if(enemy.getPosition().y + contentSize.height / 2 < -1*tolerantValue){
                ready_destroy.push(enemy);
                continue;
            }

            if(enemy.getPosition().x + contentSize.width / 2 < -1*tolerantValue){
                ready_destroy.push(enemy);
                continue;
            }

            if(enemy.getPosition().x - contentSize.width / 2 > cc.winSize.width +tolerantValue){
                ready_destroy.push(enemy);
                continue;
            }
        }

        for(enemy in ready_destroy){
            enemy = ready_destroy[enemy];
            enemy.destroy();
        }
    }
});

EnemyPool = function(){};
EnemyPool.getInstance=function(){
    if(!EnemyPool._instance)
        EnemyPool._instance = new enemyPool();
    return EnemyPool._instance;
};
