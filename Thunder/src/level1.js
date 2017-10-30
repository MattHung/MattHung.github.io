LayerLevel1=gameLayer.extend({
    _ship:null,
    _isTouch:false,
    _ui_score:null,
    _ui_billboard:null,

    ctor: function () {
        this._super(res.Level1_json);
        CocosWidget.eventRegister.getInstance().setRootNode(this.getNode("Scene"));

        this.initBackground();
        this.initShip();
        this.initEnemy();
        this.initUI();

        this.schedule(this.update);
        this.schedule(this.createEnemy, 0.3);
        this.schedule(this.moveEnemy, 1.1);
    },

    initUI:function(){         
        this._ui_score = this.getNode("txt_score");
        this._ui_billboard = new UIBillboard(this.getNode("billboard"));
        this.getNode("btn_back").setLocalZOrder(10);
        this.getNode("txt_score").setLocalZOrder(10); 

        this.registerMouseEvent(this.getNode("btn_back"), 
            function(node, mouseHitPoint){
                NetworkPeer.getInstance().close();
                cc.director.runScene(new cc.TransitionFade(1.2, new LoginScene()));
            }.bind(this)
        );

        this.addChild(this._ui_billboard);

        cc.audioEngine.playMusic("res/assets/audio/bgMusic_Scene_Play.mp3", false);
    },

    initShip:function(){
        this.KEYS =[];
        this._isTouch=false,

        this._ship = new Ship(String.format("/res/assets/ship0{0}.png", AccountManager.getInstance().getFighterType()));        
        this.addChild(this._ship);

        this.addKeyBoardEvent();
        this.addMouseEvent();
    },

    createEnemy:function(){        
        var num = CCRandom.getRandomInt(1, 6);        

        for(id in ENEMYTYPE){
            enemyType = ENEMYTYPE[id];

            if(enemyType.value==num){
                var enemy = new Enemy(enemyType);                
                this.root_node.addChild(enemy);
                break;
            }
        }
    },

    moveEnemy:function(){
        var enemies = EnemyPool.getInstance().getAll();        

        for(enemy in enemies){
            enemy = enemies[enemy];

            var action = null;

            switch(CCRandom.getRandomInt(0, 1)){
                case 0:
                    action = cc.moveTo(0.4, cc.p(enemy.getPosition().x, enemy.getPosition().y + CCRandom.getRandomInt(-300, 50)));
                    break;
                case 1:
                    action = cc.moveTo(0.4, cc.p(enemy.getPosition().x + CCRandom.getRandomInt(-100, 100), enemy.getPosition().y));
                    break;
            }

            if(CCRandom.getRandomInt(0, 100) < 10)
                enemy.shoot();
            
            enemy.runAction(action);
        }
    },

    initEnemy:function(){
        // var p = 0;
        // this.e1 = new enemy(ENEMYTYPE.TYPE1);
        // this.e1.setPosition(p+this.e1.getContentSize().width / 2, 600);
        // this.addChild(this.e1);

        // p+=this.e1.getContentSize().width;
        // this.e1 = new enemy(ENEMYTYPE.TYPE2);
        // this.e1.setPosition(p+this.e1.getContentSize().width / 2, 600);
        // this.addChild(this.e1);

        // p+=this.e1.getContentSize().width;
        // this.e1 = new enemy(ENEMYTYPE.TYPE3);
        // this.e1.setPosition(p+this.e1.getContentSize().width / 2, 600);
        // this.addChild(this.e1);

        // p+=this.e1.getContentSize().width;
        // this.e1 = new enemy(ENEMYTYPE.TYPE4);
        // this.e1.setPosition(p+this.e1.getContentSize().width / 2, 600);
        // this.addChild(this.e1);

        // p+=this.e1.getContentSize().width;
        // this.e1 = new enemy(ENEMYTYPE.TYPE5);
        // this.e1.setPosition(p+this.e1.getContentSize().width / 2, 600);
        // this.addChild(this.e1);

        // p+=this.e1.getContentSize().width;
        // this.e1 = new enemy(ENEMYTYPE.TYPE6);
        // this.e1.setPosition(p+this.e1.getContentSize().width / 2, 600);
        // this.addChild(this.e1);
    },

    addKeyBoardEvent:function(){
        if (!cc.sys.capabilities.hasOwnProperty('keyboard'))
            return;

        var KeyBoardEvent = cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed:  function(keyCode, event){
                this.KEYS[keyCode] = true;
                
            }.bind(this),
            onKeyReleased: function(keyCode, event){
                this.KEYS[keyCode] = false;
            }.bind(this)
        }, this.root_node);  
    },

    addMouseEvent:function(){
        this.registerMouseEvent(this.root_node, 
            function(node, mouseHitPoint){
                this._isTouch = true;
            }.bind(this),
             function(node, mouseHitPoint){
                this._isTouch = false;
            }.bind(this), 
            null, null,
            function(node, mouseHitPoint, event){
                this.processEvent(event);
            }.bind(this)
        );
    },

    processEvent:function( event ) {      
        if(!this._isTouch)
            return;
        var delta = event.getDelta();

        var curPos = this._ship.getPosition();
        curPos= cc.pAdd( curPos, delta );
        curPos = cc.pClamp(curPos, cc.p(0, 0), cc.p(cc.winSize.width, cc.winSize.height) );
        this._ship.setPosition( curPos );
    },

    checkCollide:function (a, b) {
        var aRect = a.collideRect();
        var bRect = b.collideRect();
        if (cc.rectIntersectsRect(aRect, bRect)) 
            return true;

        return false;
    },

    checkShipDamage:function(){
        var bullets_enemy = BulletPool.getInstance().getBullets(BULLETTYPE.ENEMY);
        var enemies = EnemyPool.getInstance().getAll();

        if(this._ship.canBeAttack){
            for(bullet in bullets_enemy){
                bullet = bullets_enemy[bullet];

                if(this.checkCollide(bullet, this._ship)){
                    this._ship.resetShip(true);
                    bullet.destroy();
                    return;
                }
            }

            for(enemy in enemies){
                enemy = enemies[enemy];

                if(this.checkCollide(enemy, this._ship)){
                    this._ship.resetShip(true);
                    return;
                }
            }
        }
    },

    updateCollide:function(){
        var bullets_ship = BulletPool.getInstance().getBullets(BULLETTYPE.SHIP);
        var enemies = EnemyPool.getInstance().getAll();

        for(bullet in bullets_ship){
            bullet = bullets_ship[bullet];

            for(enemy in enemies){
                enemy = enemies[enemy];

                if(this.checkCollide(bullet, enemy)){                    
                    switch(AccountManager.getInstance().getLoginType()){
                        case LoginType.Online:
                            var msg = new MemoryStream();
                            ProtocolBuilder.Encode_FromInt(msg, enemy.getScore());
                            NetworkPeer.getInstance().sendMessage(2, msg);
                            break;
                        case LoginType.SinglePlay:
                            AccountManager.getInstance().addScore(enemy.getScore());
                            break;

                    }
                    
                    enemy.destroy();
                    bullet.destroy();
                    break;
                }
            }
        }

        this.checkShipDamage();
    },

    updateKeyBoard:function(dt){
        if (cc.sys.capabilities.hasOwnProperty('keyboard')){
            var contentSize = this._ship.getContentSize();
            var pos = this._ship.getPosition();
            if ((this.KEYS[cc.KEY.w] || this.KEYS[cc.KEY.up]) && pos.y + contentSize.height / 2 <= cc.winSize.height) 
                pos.y += dt * this._ship.getSpeed();
            else if ((this.KEYS[cc.KEY.s] || this.KEYS[cc.KEY.down]) && pos.y - contentSize.height / 2 >= 0) 
                pos.y -= dt * this._ship.getSpeed();
            else if ((this.KEYS[cc.KEY.a] || this.KEYS[cc.KEY.left]) && pos.x - contentSize.width / 2 >= 0) 
                pos.x -= dt * this._ship.getSpeed();
            else if ((this.KEYS[cc.KEY.d] || this.KEYS[cc.KEY.right]) && pos.x  + contentSize.width / 2<= cc.winSize.width) 
                pos.x += dt * this._ship.getSpeed();
            else
                return;

            this._ship.setPosition( pos );
        }
    },

    updateScore:function(){
        this._ui_score.setString(String.format("Score:{0}", AccountManager.getInstance().getScore()));
    },

    update:function(dt){
        this.updateKeyBoard(dt);
        this.updateCollide();
        this.updateScore();
    },

    getCurrentBGTop:function(){
        return this.currentBG.getPosition().y  + this.currentBG.children[0].getTexture().height * this.currentBG.children[0].getScaleY();
    },

    initBackground:function () {
        this.bgImagesQueue = [];

        this.bgImagesQueue.push(this.getNode("bg_0"));
        this.bgImagesQueue.push(this.getNode("bg_1"));
        
        this.BGMoveStep = -800;
        this.BGMoveInterval = 3;
        this.currentBG = this.getNode("bg");
        this.currentBGTop = this.getCurrentBGTop();
        
        // callback, interval, repeat, delay, key
        this.movingBackground();
        this.schedule(this.checkRearrangeBackground, 0.3, cc.REPEAT_FOREVER, 0);
        this.schedule(this.movingBackground, this.BGMoveInterval, cc.REPEAT_FOREVER, 0);
    },

    moveAllBG:function(){        
        for(bg in this.bgImagesQueue)
            this.bgImagesQueue[bg].runAction(cc.MoveBy.create(this.BGMoveInterval, cc.p(0, this.BGMoveStep)));

        this.currentBG.runAction(cc.MoveBy.create(this.BGMoveInterval, cc.p(0, this.BGMoveStep)));
    },

    movingBackground:function () {
        this.moveAllBG();        
    },

    checkRearrangeBackground:function(){
        this.currentBGTop  = this.getCurrentBGTop();

        if (this.currentBGTop <= cc.winSize.height + cc.winSize.height / 2) {
            this.bgImagesQueue.push(this.currentBG);
            this.currentBG = this.bgImagesQueue.shift();
            this.currentBG.setPosition(cc.p(0, this.currentBGTop));
            this.currentBGTop = this.currentBGTop + this.currentBG.children[0].getTexture().height * this.currentBG.children[0].getScaleY();
        }        
    }
});

var SceneLevel1 = cc.Scene.extend({
    onEnter:function(){
        this._super();
        this.addChild(new LayerLevel1());        
    }
});