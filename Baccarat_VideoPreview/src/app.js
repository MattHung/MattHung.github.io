
var HelloWorldLayer = cc.Layer.extend({
    sprite:null,
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask the window size
        var size = cc.winSize;

        var mainscene = ccs.load(res.MainScene_json);
        this.addChild(mainscene.node);

        /* you can create scene with following comment code instead of using csb file.
        /////////////////////////////
        // 3. add your codes below...
        // add a label shows "Hello World"
        // create and initialize a label
        var helloLabel = new cc.LabelTTF("Hello World", "Arial", 38);
        // position the label on the center of the screen
        helloLabel.x = size.width / 2;
        helloLabel.y = size.height / 2 + 200;
        // add the label as a child to this layer
        this.addChild(helloLabel, 5);

        // add "HelloWorld" splash screen"
        this.sprite = new cc.Sprite(res.HelloWorld_png);
        this.sprite.attr({
            x: size.width / 2,
            y: size.height / 2
        });
        this.addChild(this.sprite, 0);
        */

        this.onInitRushVideo(this);

        return true;
    },
    init_video_0 : function(view){
        var video_source_0 = new RushMedia("video_0");
        var videoImageDraw = new CocosWidget.DrawNode();
        var closeImageDraw = new CocosWidget.DrawNode();
        
        video_source_0.loadVideo("ws://111.235.135.80:50480");
        video_source_0.setVisible(false);
        video_source_0.showStreamingInfo(false);
        video_source_0.setCallback(
                function(sourceCanvas, width, height, canvasBuffer){                    
                    // videoImageDraw.updateCanvasSource(sourceCanvas, 1280, 720, 580, 360);
                    // closeImageDraw.updateCanvasSource(sourceCanvas, 600, 200, 640, 360, 400, 150);
                    videoImageDraw.updateCanvasSource(sourceCanvas, 580, 360, 580, 360);                    
                    closeImageDraw.updateCanvasSource(sourceCanvas, 350, 100, 640, 360, 175, 200);
                }, 
                function(w, h, b, f){        
                
                },
                function(message){
            
                }
            );

        video_source_0.setNetworkEvent(
            function(open){
                console.log("open");
                video_source_0.switchChanel(10006, 640, 360, 450, 15);
                // video_source_0.switchChanel(10006, 1280, 720, 700, 15);
            }.bind(this),
            function(error){
                console.log("error");
            }.bind(this),
            function(close){
                console.log("close");
            }.bind(this)
        );
        
        videoImageDraw.updateCanvasSource(video_source_0.getCanvas());
        videoImageDraw.setPosition(cc.p(635, 710));
        view.addChild(videoImageDraw, -1); 

        closeImageDraw.updateCanvasSource(video_source_0.getCanvas());
        closeImageDraw.setPosition(cc.p(1230, 710));
        view.addChild(closeImageDraw, -1); 
    },
    // init_video_1 : function(view){
    //     var video_source_1 = new RushMedia("video_1");
    //     var closeImageDraw = new CocosWidget.DrawNode();
        
    //     video_source_1.loadVideo("ws://111.235.135.80:50480");
    //     video_source_1.setVisible(false);
    //     video_source_1.showStreamingInfo(true);
    //     video_source_1.setCallback(
    //             function(sourceCanvas, width, height, canvasBuffer){                    
    //                 // closeImageDraw.updateCanvasSource(sourceCanvas, 300, 100, 580, 360, 175, 150);
    //                 closeImageDraw.updateCanvasSource(sourceCanvas, 300, 100, 640, 360, 175, 100);
    //             }, 
    //             function(w, h, b, f){        
                
    //             },
    //             function(message){
            
    //             }
    //         );

    //     video_source_1.setNetworkEvent(
    //         function(open){
    //             console.log("open");
    //             video_source_1.switchChanel(10006, 482, 272, 350, 15);
    //         }.bind(this),
    //         function(error){
    //             console.log("error");
    //         }.bind(this),
    //         function(close){
    //             console.log("close");
    //         }.bind(this)
    //     );
        
    //     closeImageDraw.updateCanvasSource(video_source_1.getCanvas());
    //     closeImageDraw.setPosition(cc.p(1230, 710));
    //     view.addChild(closeImageDraw, -1); 
    // },

    onInitRushVideo: function(view)
    {
        this.init_video_0(view);
        // this.init_video_1(view);
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
    }
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});

