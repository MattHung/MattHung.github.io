/**
 * Created by Matt Hung on 2016/12/6.
 */

VideoController = cc.Class.extend({
    _gameID:null,
    _view:null,
    _initialed:false,
    _enabled:false,
    _connecting:false,

    video_source: null,
    videoImageDraw: null,

    InitRushVideo: function (view) {
        if(!this._initialed){
            this._initialed = true;

            this.video_source = new RushMedia("video_canvas");

            this.videoImageDraw = new CocosWidget.DrawNode();

            var onRecvMessage = function (message) {

            };

            var renderingVideo = function (sourceCanvas, width, height, canvasBuffe, frameData) {
                if(this.video_source.paused())
                    return;
                if(!this._enabled)
                    return;
                this.videoImageDraw.updateCanvasSource(sourceCanvas, frameData, width, height);
            }.bind(this);

            var onSwitchChannel = function (w, h, b, f) {
                this.videoImageDraw.setScale(DesignedWidth / w, DesignedHeight / h);
                var streamingInfo = this.video_source.getStreamingInfo();

            }.bind(this);;

            setInterval(function () {
                var ccuInfo = this.video_source.getCCUInfo();

            }.bind(this), 1000);            

            this.video_source.showStreamingInfo(true);
            this.video_source.setCallback(renderingVideo, onSwitchChannel, onRecvMessage);
            this.video_source.setNetworkEvent(
                function (open) {
                    this._connecting = false;
                    console.log("open");
                    this.video_source.switchChanel(10001, 1136, 640, 600, 10);
                    // this.video_source.switchChanel(10001, 1136, 640, 800, 15);
                    // this.video_source.switchChanel(10001, 1920, 1080, 800, 15);
                    // this.video_source.switchChanel(10001, 640, 480, 600, 15);
                    // this.video_source.switchChanel(10001, 320, 240, 500, 15);
                }.bind(this),
                function (error) {
                    this._connecting = false;
                    console.log("error");
                }.bind(this),
                function (close) {
                    this.videoImageDraw.clear();
                    this._connecting = false;
                    console.log("close"); 
                }.bind(this)
            );

            cc.director.getScheduler().schedule(this._connectVideo, this, 3);
        }

        if(this._view == view)
            return;

        this._view = view;
        view.addChild(this.videoImageDraw, -1);
        this._connectVideo();
    },

    _connectVideo : function(){
        if(!this._enabled)
            this.videoImageDraw.clear();

        if(!this._enabled)
            return;

        if(!this.video_source)
            return;
        if(this.video_source.connected())
            return;

        if(this._connecting)
            return;

        this._connecting =true;        

        this.video_source.loadVideo(VIDEO_SOURCE_URL);
    },

    OpenVideo:function(){
        this._enabled = true;
        this._connectVideo();
    },

    PauseRushVideo:function(){
        if(!this.video_source)
            return;

        this.video_source.pauseVideo();
        this.videoImageDraw.clear();
    },

    ResumeRushVideo:function(){
        if(!this.video_source)
            return;

        this.video_source.resumeVideo();
    },

    CloseRushVideo: function(){
        if(!this.video_source)
            return;

        this._connecting = false;
        this.video_source.closeVideo();
        this.videoImageDraw.clear();
        this._enabled = false;
    },
});


VideoController._instance=null;

VideoController.getInstance = function(){

    if(VideoController._instance==null)
        VideoController._instance = new VideoController();

    return VideoController._instance;
};
