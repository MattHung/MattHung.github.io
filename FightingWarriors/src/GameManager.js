/**
 * Created LE  Matt Hung on 2017/10/25.
 */

 var MessageLayer = gameLayer.extend({
    messageBox:null,

    ctor: function () {
        this.setName("messageLayer");
        this._super(res.Message_json);

        this.messageBox = this.getNode("message_box");
        this.setScale(1.15, 1.15);
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

GameManager = function(){
    this.FADEIN_SECS = 3;
    this.callback_onCreateTable =null;
    this.currentTableType = 1; // normal table
    this.currentTable = null;
    this._equestTableListTick=new Date().getTime();

    this.OnLogin = null;
    this.OnEnterGame = null;
    this.OnSystemMessage = null;
    this.OnResponseTableList = null;

    // this._messageLayer = new MessageLayer();
    this._tableSettings=[];    

    cc.director.getScheduler().scheduleUpdate(this);

    this.connect = function(ws_url, onOpen, onClose){
        NetworkPeer.getInstance().connect(ws_url);

        NetworkPeer.getInstance().setCallback_onOpen(onOpen);
        NetworkPeer.getInstance().setCallback_onClose(onClose);
    }.bind(this);

    this.showMessage = function(text) {
        var layer = cc.director.getRunningScene().getChildByName("messageLayer");
        if (!layer) {
            layer = new MessageLayer();
            cc.director.getRunningScene().addChild(layer);
        }

        layer.showMessage(text);

    }.bind(this);

    this.setCallback = function(fun_name, callback, instance){
        if(instance==null)
            instance =NetworkPeer.getInstance();

        instance[fun_name] = callback;

    }.bind(this);

    this.onNewGame =function (fighterType) {
        var changeScene =function(){
            flareEffect(cc.director.getRunningScene(), function(){
                cc.director.runScene(new cc.TransitionFade(1, new SceneLevel1()));
            });             
        };        

        changeScene();
    },

    this.update = function(dt){

    }.bind(this);
};

GameManager.getInstance =function(){
    if(!GameManager._instance) {
        GameManager._instance = new GameManager();
    }

    return GameManager._instance;
};
