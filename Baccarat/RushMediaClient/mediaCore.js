const THREAD_COUNT = 1;

var desigenedWidth =960;
var desigenedHeight =540;

// var ThreadPool=new ThreadPool(THREAD_COUNT, 'RushMediaClient/dummyCallback.js');
// ThreadPool.init();
WSAvcPlayer = function(canvas_name){
  this.decoder = new Decoder(false);
  this.lastSendPingTick=0;
  this.Latency=0;
  this.ccu = 0;

  this.frames=[];

  this.timeCalibrator = new TimeCalibrator();
  this.decoder.enableColorParam = (typeof colorParam_R!="undefined");

  setInterval(function(wsavcPlayer)
  {
      wsavcPlayer.sendPing(wsavcPlayer);
      wsavcPlayer.getConcurrentUser();
  }, 3000, this);

  setInterval(function(){    
    this.record_fps=this.fps;
    this.fps=0;
  }.bind(this), 1000);

  this.getWebGLAvailable = function(){
    return this.webgl_ctx;
  },

  this.sendPing=function(wsavcPlayer){
    if(!wsavcPlayer.ws)
        return
    if(wsavcPlayer.ws.readyState != wsavcPlayer.ws.OPEN)
          return;

      wsavcPlayer.ws.send(JSON.stringify({action:"ping"}));
      wsavcPlayer.lastSendPingTick = new Date().getTime();
      wsavcPlayer.ws.send(JSON.stringify({action:"calibrate_tick"}));
  };

  this.getConcurrentUser=function()
  {
    if(!this.ws)
      return;

    if(this.ws.readyState != this.ws.OPEN)
      return;

    var json_str = JSON.stringify({action: "get_concurent_user"});

    this.ws.send(json_str);

  }.bind(this);
  
  this.decoder.onPictureDecoded = function(buffer, width, height, infos){
    var lumaSize = width * height;
    var chromaSize = lumaSize >> 2;

    var ybuf = buffer.subarray(0, lumaSize);
    var ubuf = buffer.subarray(lumaSize, lumaSize + chromaSize);
    var vbuf = buffer.subarray(lumaSize + chromaSize, lumaSize + 2 * chromaSize);

    var frameData = {uData:ubuf, yData:ybuf, vData:vbuf};

    if(this.RenderingCallback){
        this.RenderingCallback(this.canvas, width, height, this.canvasBuffer, frameData);
        return;
    }
  }.bind(this);

  // function(width, height, canvasBuffer)
  this.setRenderCallback = function(callback_fun){
    this.RenderingCallback=callback_fun;
  }.bind(this);

  // function(w, h, b, f)
  this.setSwitchChannelCallback = function(callback_fun){
    this.SwitchChannelCallback=callback_fun;
  }.bind(this);

  this.getTimeStamp = function(data){
    var value =0;
    data = new Uint8Array(data);
    for ( var i = 7; i >= 0; i--)
      value = (value * 256) + data[i];
    return value;
  };

  this.pause = function(){
    this.paused = true;
  }.bind(this);

  this.resume = function(){
    this.paused = false;    
  }.bind(this);

  this.disconnect = function(){
    if(!this.ws)
      return;
    this.ws.close()
  }.bind(this);

  this.peerConnect = function(url){
    this.ws = new WebSocket(url);
    this.ws.binaryType = "arraybuffer";
    this.ws.onopen = function() {
      console.log("WSAvcPlayer: Connected to " + url);
      this.sendPing();
    }.bind(this);
    this.ws.onopen = function(open){this.onwsopen(open)}.bind(this);
    this.ws.onerror = function(error){
      this.onwserror(error)
    }.bind(this);
    this.ws.onclose = function(close){
      this.onwsclose(close)
    }.bind(this);
    this.ws.onmessage = function(evt) {

      if(typeof evt.data == "string") {
          var json_obj = JSON.parse(evt.data);

          switch(json_obj.action){
              case "init":
                  this.Bitrate=json_obj.bitrate;
                  this.Framerate=json_obj.framerate;
                
                  if(this.SwitchChannelCallback)
                    this.SwitchChannelCallback(json_obj.width, json_obj.height, this.Bitrate, this.Framerate);

                  return;
              case "pong":
                  this.Latency = (new Date().getTime()) - this.lastSendPingTick;
                  break;

              case "calibrate_tick":
                  this.timeCalibrator.synchronize(json_obj.value)
                  break;
              case "concurent_user":
                  this.ccu = json_obj.value;
                  break;
              default:
                  this.onwsmessage(json_obj);
                  break;
          }

          return;
      }

      var timeStamp = this.getTimeStamp(evt.data);
      var frame = evt.data.slice(8, evt.data.byteLength);

      // if(!this.timeCalibrator.checkTimeStamp(timeStamp))
      //     return;

      if(this.paused)
        return;

      this.frames.push({"timeStamp":timeStamp, "frame":new Uint8Array(frame)});
      ThreadPool.addTask(new Task(this.processFrame, this, 0, this));
      this.fps++;
    }.bind(this);
  }.bind(this);

  this.connect = function(url){
    ThreadPool.addTask(new Task(this.peerConnect, url, 0, this));  
  }.bind(this);

  this.processFrame = function(wsavcPlayer){
      if(wsavcPlayer.frames.length <= 0)
        return;

      var packet = wsavcPlayer.frames[0];

      if(wsavcPlayer.timeCalibrator.getRemoteTick() >=packet.timeStamp) {          
        ThreadPool.addTask(new Task(wsavcPlayer.decoder.decode, packet.frame, 0, wsavcPlayer.decoder));
        wsavcPlayer.frames.shift();
      }
  }.bind(this),

  this.send= function(msg){
    this.ws.send(msg);
  }.bind(this);;
};

