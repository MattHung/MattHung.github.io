MenuLayer=gameLayer.extend({
    ctor: function () {
        this._super(res.MainScene_json);

        CocosWidget.eventRegister.getInstance().setRootNode(this.getNode("Scene"));

        //new game button
        var file_name = "res/assets/menu.png";
        var spriteFrame = cc.SpriteFrame.create(file_name, cc.rect(0, 0, 126, 33));        

        // this.btn_new = new ccui.Button();
        // this.btn_new.setPosition(cc.winSize.width / 2, cc.winSize.height / 2 );
        // this.btn_new.loadTextures("res/assets/menu/new_normal.png", "res/assets/menu/new_pressed.png", "res/assets/menu/new_disabled.png");
        // this.btn_new.setScale(3, 3);
        // this.addChild(this.btn_new);
        // this.registerMouseEvent(this.btn_new, function(node, mouseHitPoint){
        //     // console.log("hit!");            
        //     flareEffect(this, this, this.onNewGame);
        // }.bind(this));

        // var blinks = cc.Blink.create(2, 10);
        var fadeIn = new cc.FadeIn(1);
        var fadeOut = new cc.FadeOut(1);
        
        this.getNode("Text_1").runAction(cc.repeatForever(new cc.Sequence(fadeOut, fadeIn)));

        
        //flight animation        
        for(var index=0; index<3; index++){
            var icon = new cc.Sprite();
            icon.setScale(3.5, 3.5);
            icon.setAnchorPoint(cc.p(0.5, 0.5));
            icon.setPosition(index * 200 + 170, cc.winSize.height / 2-400);
            var animation = new cc.Animation();
            animation.setDelayPerUnit(0.06);

            var x = 0;
            var y = 0;
            for (var i = 1; i <= 2; i++){
                animation.addSpriteFrame(cc.SpriteFrame.create(String.format("/res/assets/ship0{0}.png", index+1), cc.rect(x, y, 60, 42)));
                x+=60;
            }
            
            icon.runAction(cc.repeatForever(cc.animate(animation)));
            this.addChild(icon);
            icon.FighterType = index+1;

            this.registerMouseEvent(icon, function(node, mouseHitPoint){
                action = cc.moveTo(0.4, cc.p(cc.winSize.width / 2, cc.winSize.height / 2-150));                
                node.runAction(action);

                action = cc.ScaleTo.create(0.4, 5, 5);
                node.runAction(action);

                switch(AccountManager.getInstance().getLoginType()){
                    case LoginType.Online:
                        //waitting for server response
                        var msg = new MemoryStream();
                        ProtocolBuilder.Encode_FromByte(msg, node.FighterType);
                        NetworkPeer.getInstance().sendMessage(1, msg);
                        break;
                    case LoginType.SinglePlay:
                        AccountManager.getInstance().getSave().FighterType = node.FighterType;
                        GameManager.getInstance().onNewGame(node.FighterType);
                        break;
                }
            }.bind(this));
        }
    }
});

var MenuScene = cc.Scene.extend({
    onEnter:function(){
        this._super();
        this.addChild(new MenuLayer());        
    }
});

var LoginScene = cc.Scene.extend({    
    onEnter:function(){
        this._super();

        var storage = new CocosWidget.Storage();

        var loginLayer = r=gameLayer.extend({
            messageLayer:null,

            ctor: function () {
                this._super(res.Login_json);

                this.messageLayer = new MessageLayer();

                var previous_account = storage.load("account");
                if(previous_account)
                    this.getNode("account_node/text").setString(previous_account);

                AccountManager.reset();

                CocosWidget.eventRegister.getInstance().setRootNode(this.getNode("Scene"));

                this.registerMouseEvent(this.getNode("node_login/bg"), 
                    function(node, mouseHitPoint){
                        AccountManager.getInstance().setLoginType(LoginType.Online);
                        this.getNode("node_login/text").setColor(cc.color(255, 0, 0));                    
                        this.onLoginServer();

                        //save account
                        storage.save("account", this.getNode("account_node/text").getString());
                    }.bind(this),
                    function(node, mouseHitPoint){
                        this.getNode("node_login/text").setColor(cc.color(255, 255, 255)); 
                    }.bind(this)
                );

                this.registerMouseEvent(this.getNode("node_single_player/bg"), 
                    function(node, mouseHitPoint){
                        AccountManager.getInstance().setLoginType(LoginType.SinglePlay);
                        this.getNode("node_single_player/text").setColor(cc.color(255, 0, 0));                    
                        cc.director.runScene(new cc.TransitionFade(1, new MenuScene()));
                    }.bind(this),
                    function(node, mouseHitPoint){
                        this.getNode("node_single_player/text").setColor(cc.color(255, 255, 255)); 
                    }.bind(this)
                );

                this.registerMouseEvent(this.getNode("node_single_player/text"), 
                    function(node, mouseHitPoint){
                        AccountManager.getInstance().setLoginType(LoginType.SinglePlay);
                        this.getNode("node_single_player/text").setColor(cc.color(255, 0, 0));                    
                        cc.director.runScene(new cc.TransitionFade(1, new MenuScene()));
                    }.bind(this),
                    function(node, mouseHitPoint){
                        this.getNode("node_single_player/text").setColor(cc.color(255, 255, 255)); 
                    }.bind(this)
                );
            },

            onLoginServer:function(){
                GameManager.getInstance().setCallback("OnResponseLogin", function(res, accountSave){

                    switch(res){
                        case 1:
                            AccountManager.getInstance().setSave(accountSave.UserID, accountSave);
                            break;
                        case 2:
                            GameManager.getInstance().showMessage("Login Failed! Please try again");
                            break;
                    }
                });

                GameManager.getInstance().setCallback("OnResponseEnterGame", function(res, accountSave){
                    if(res==2) {
                        GameManager.getInstance().showMessage("Login Failed! Please try again");
                        return;
                    }

                    var nextScene = new MenuScene();                                                    
                    if(AccountManager.getInstance().getFighterType()!=0)
                        nextScene = new SceneLevel1();
                    
                    cc.director.runScene(new cc.TransitionFade(GameManager.getInstance().FADEIN_SECS, nextScene));
                }.bind(this));

                cc.log("ws connecting!");
                GameManager.getInstance().connect("ws:/220.134.243.106:61231",
                    function() {
                        cc.log("ws connected!");
                        //gameID, sessionID, platForm, subsidiaryID, subsidiaryAccount, subsidiaryUserID, browser, osType)
                        var account = this.getNode("account_node/text").getString();
                        NetworkPeer.getInstance().requestLogin("2", "robot", 4, 0, account, 0, "", "");
                        cc.log("ws requestLogin!");
                    }.bind(this),

                    function() {
                        GameManager.getInstance().showMessage("disconnect !!");
                        var nextScene = new LoginScene();
                        cc.director.runScene(new cc.TransitionFade(GameManager.getInstance().FADEIN_SECS, nextScene));
                    }.bind(this)
                )
            }
        });

        this.addChild(new loginLayer());        
    }
});

