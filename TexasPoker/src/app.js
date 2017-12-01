MessageLayer = gameLayer.extend({
    messageBox:null,

    ctor: function () {
        this.setName("messageLayer");
        this._super(res.MessageScene_json);

        this.messageBox = this.getNode("message_box");
        this.connectNode(this.messageBox, this.messageBox);
        this.messageBox.Text.setContentSize(cc.winSize.width / 2, this.messageBox.Text.getContentSize().height);
    },

    showMessage:function(text){
        this.messageBox.Text.setString(text);
        this.messageBox.setVisible(true);

        //hide after 3 secs
        cc.director.getScheduler().schedule(
            function(){
                this.setVisible(false);
                cc.director.getScheduler().unscheduleAllForTarget(this);
            },
            this.messageBox, 0, 0, 3, false
        )
    }
});

LoginLayer=gameLayer.extend({
    ctor: function () {
        this._super(res.LoginScene_json);
        
        PokerManager.getInstance().currentTable = null;

        CocosWidget.eventRegister.getInstance().setRootNode(this.getNode("Scene"));

        PokerManager.getInstance().setCallback("OnResponseLogin", function(res, accountSave){

            if(res==2)
                PokerManager.getInstance().showMessage("Login Failed! Please try again");
        });

        PokerManager.getInstance().setCallback("OnResponseEnterGame", function(res, accountSave){
            if(res==2) {
                PokerManager.getInstance().showMessage("Login Failed! Please try again");
                return;
            }

            var nextScene = new LobbyScene();
            cc.director.runScene(new cc.TransitionFade(PokerManager.getInstance().FADEIN_SECS, nextScene));
        });

        this.registerMouseEvent(this.getNode("Guest"),
            function(node, mouseHitPoint){
                PokerManager.getInstance().connect("ws:/220.134.243.106:61230",
                    function() {
                        //gameID, sessionID, platForm, subsidiaryID, subsidiaryAccount, subsidiaryUserID, browser, osType)
                        pokerPeer.getInstance().requestLogin("2", "robot", 4, 0, "play02", 148499947, "", "");
                    },

                    function() {
                        PokerManager.getInstance().showMessage("disconnect !!");
                        var nextScene = new LoginScene();
                        cc.director.runScene(new cc.TransitionFade(PokerManager.getInstance().FADEIN_SECS, nextScene));
                    }
                )
            }
        );
    }
});

LobbyLayer=gameLayer.extend({
    _scrollView:null,
    _sampleElement:null,

    ctor: function () {
        this._super(res.TableListScene_json);

        CocosWidget.eventRegister.getInstance().setRootNode(this.getNode("Scene"));

        this._sampleElement = this.getNode("ScrollView/table_element");
        this._sampleElement.getParent().removeChild(this._sampleElement);

        cc.director.getScheduler().scheduleUpdate(this);
        PokerManager.getInstance().setCallback("OnResponseTableList", function(tableInfo){

            if(PokerManager.getInstance().currentTable)
                return;

            var i = 0;

            var elements = this._scrollView.getChildren();

            for(i=0; i<elements.length; i++)
                elements[i].setVisible(false);

            for(i=0; i<tableInfo.length; i++){
                if(elements.length<=i)  {
                    var newElement = CocosWidget.cloneNode(this._sampleElement);
                    newElement.setPosition(newElement.getPosition().x, newElement.getPosition().y-(i * 70));
                    this._scrollView.addChild(newElement);

                    this.registerMouseEvent(newElement.getChildByName("bg"), function(node, mouseHitPoint){
                        var tableID = parseInt(node.getParent().getChildByName("Text_TableNo").getString());

                        //1:要求入桌 : 桌次種類(1) + 桌次編號(4)
                        var Message = new MemoryStream();
                        ProtocolBuilder.Encode_FromByte(Message, PokerManager.getInstance().currentTableType);
                        ProtocolBuilder.Encode_FromInt(Message, tableID);
                        pokerPeer.getInstance().sendMessage(1, Message);
                    });

                }

                var small_blind = PokerManager.getInstance().getTableSetting(tableInfo[i].tableID).small_blind;
                var big_blind = PokerManager.getInstance().getTableSetting(tableInfo[i].tableID).big_blind;

                var min_buyIn = PokerManager.getInstance().getTableSetting(tableInfo[i].tableID).min_buyin;
                var max_buyIn = PokerManager.getInstance().getTableSetting(tableInfo[i].tableID).max_buyin;

                elements[i].getChildByName("Text_TableNo").setString(tableInfo[i].tableID.toString());
                elements[i].getChildByName("Text_Blind").setString(String.format("{0}/{1}", small_blind, big_blind));
                elements[i].getChildByName("Text_BuyIn").setString(String.format("{0}/{1}", min_buyIn, max_buyIn));
                elements[i].getChildByName("Text_Player").setString(String.format("{0}/{1}", tableInfo[i].playerCount.toString(), 9));
                elements[i].setVisible(true);
            }

        }.bind(this), PokerManager.getInstance());

        this._scrollView=this.getNode("ScrollView");

        this._scrollView.addEventListener(function(sender, type){
            switch (type) {
                case ccui.ScrollView.EVENT_SCROLL_TO_BOTTOM:
                    console.log(sender.getCurSelectedIndex());
                    break;
            }

        },this._scrollView);

        PokerManager.getInstance().callback_onCreateTable = function(){
            var nextScene = new TableScene();
            cc.director.runScene(new cc.TransitionFade(PokerManager.getInstance().FADEIN_SECS, nextScene));
        }.bind(this);
    },

    update:function(dt){
        PokerManager.getInstance().requestTableList();
    }
});

var MainLayer = cc.Layer.extend({
    sprite:null,
    _pokerManager:null,
    ctor:function () {
        // 1. super init first
        this._super();

        var cardsLayer = PokerCards.getInstance();
        this.addChild(PokerManager.getInstance().currentTable);
        return true;
    }
});

var LoginScene = cc.Scene.extend({
    onEnter:function(){
        this._super();
        this.addChild(new LoginLayer());
        PokerManager.getInstance();

        CocosWidget.Orientation.setRotateCallback(function(orientation){
            console.log(orientation);
        });


        CocosWidget.Screen.registerFullScreenCallback(function(isFullScreen){
            if(!isFullScreen)
                return;
            var lockFunction =  window.screen.orientation.lock;
            if (lockFunction.call(window.screen.orientation, 'landscape')) {
                console.log('Orientation locked')
            } else {
                console.error('There was a problem in locking the orientation')
            }
        });
    }
});

var LobbyScene = cc.Scene.extend({
    onEnter:function(){
        this._super();
        this.addChild(new LobbyLayer());
    }
});

var TableScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new MainLayer();
        this.addChild(layer);
    }
});


