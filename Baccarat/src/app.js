var FADEIN_SECS = 1;

var MainLayer = gameLayer.extend({
    sprite: null,
    message: null,

    Msg: null,

    ctor: function () {

        this._super(scene_json.GamblerScene_json);

        this.onInitRushVideo(this);
        this.tmpVisibleSet();

        this.initEventSet();
        GameManager.getInstance().initialMainSceneUI(this.root_node);
        return true;
    },

    initEventSet: function () {
        CocosWidget.eventRegister.getInstance().setRootNode(this.root_node);
    },

    tmpVisibleSet: function () {
        this.getNode("Big_Show_Poker_Node").setVisible(false);
        this.getNode("GameResult_Node").setVisible(false);
    },

    onInitRushVideo: function (view) {
        VideoController.getInstance().OpenVideo();
        VideoController.getInstance().InitRushVideo(view); 
    }
});

var MainScene = gameScene.extend({
    main_layer: null,

    onEnter: function () {
        this._super();
        this.main_layer = new MainLayer();        
        this.addChild(this.main_layer);
        
        GameManager.getInstance().onMainSceneLoadCompleted();
        GameManager.getInstance().onChangeSceneCompelted(SceneEnum.Room);        
        ui_MessageBox.getInstance().checkAddToScene(this);
        if(sound_manager.getInstance().getLobbyMusic()=="gog1")
            sound_manager.getInstance().setBGMusic("live1",1);
    }
});

var LoginScene = gameScene.extend({
    _login_layer: null,

    onEnter: function () {
        this._super();

        GameManager.getInstance();        
        screenWidget.getInstance().adjustResolution();
        this._login_layer = new ui_Login();
        this.addChild(this._login_layer);
        ui_MessageBox.getInstance().checkAddToScene(this);
    }
});

var RoomScene = gameScene.extend({
    room_layer: null,

    onEnter: function () {
        this._super();
        this.room_layer = new RoomLayer();
        this.addChild(this.room_layer);

        GameManager.getInstance().onChangeSceneCompelted(SceneEnum.RoomList);
        ui_MessageBox.getInstance().checkAddToScene(this);
        sound_manager.getInstance().stopBG();

        if(ui_Effect.getInstance().isMute()== false){
            sound_manager.getInstance().setBGMusic("gog1", 0);
        }
        else(sound_manager.getInstance().pauseRoomBG());

    }
});
