var MainLayer = gameLayer.extend({
    sprite: null,
    table:null,
    video_source:null,
    videoImageDraw:null,

    ctor: function () {
        this._super(res.MainScene_json);

        CocosWidget.eventRegister.getInstance().setRootNode(this.getNode("Scene"));

        this.table = new VideoTableBase();
        this.table.loadAllCards(this.getNode("/cards"));

        this.table.setPanel_BtnControl(this.getNode("/btn"));
        this.table.setPanel_Chips(this.getNode("/chip"));
        this.table.setPanel_Peek(this.getNode("/peek"));
        this.table.setPanel_BetArea(this.getNode("/bet_area"));
        this.table.setPanel_Counter(this.getNode("/counter"));
        this.table.setPanel_Messages(this.getNode("/message"));
        this.table.setPanel_Info(this.getNode("/sn"));

        this.initMediaData();
        this.scheduleUpdate();

        //callback: callback(node, mouseHitPoint)
        //registerMouseEvent:function(node, callback_mouseDown, callback_mouseUp, callback_mouseEnter, callback_mouseOver){
        this.registerMouseEvent(this.getNode("/btn_fullScreen"),
            function(node, mouseHitPoint){
                cc.screen.requestFullScreen(gameCanvas);
            }
        );

        ///btn/btn_confirm

        this.video_source = new RushMedia();
        this.video_source.loadVideo();
        this.video_source.setVisible(false);
        this.video_source.setCallback(this.renderingVideo, this.onSwitchChannel);

        this.videoImageDraw = new CocosWidget.DrawNode();
        this.videoImageDraw.updateCanvasSource(this.video_source.getCanvas());

        this.addChild(this.videoImageDraw, -1);
        return true;
    },

    renderingVideo:function(sourceCanvas, width, height, canvasBuffer){
        var layer = SceneManger.getInstance().findSpecifyScene(MainScene).main_layer;
        layer.videoImageDraw.updateCanvasSource(sourceCanvas);
    },

    onSwitchChannel:function(w, h, b, f){
        var layer = SceneManger.getInstance().findSpecifyScene(MainScene).main_layer;
        layer.videoImageDraw.updateCanvasSource(layer.video_source.getCanvas(), w, h);
        layer.videoImageDraw.setScale(DesignedWidth / w, DesignedHeight / h);
    },

    initMediaData: function () {
        var sessionID = getURLParameterByName("session_id");

        MediaData.getInstance().Connect("ws://43.251.76.60/websocket/BacMiPlayer/m38",
            {
                sid: sessionID,
                lang: "us",
                lineType: "1",
                limitID: "2",
                mode: "upSeat",
                gameCode: "38",
                gameType: "3001"
            }
        );
    },

    update:function(dt){
        this.table.update(dt);
    }
});

var MainScene = gameScene.extend({
    main_layer:null,
    onEnter:function(){
        this._super();
        this.main_layer = new MainLayer();
        this.addChild(this.main_layer);
    }
});



