const THREAD_COUNT = 1;

var desigenedWidth =960;
var desigenedHeight =540;

var ThreadPool=new ThreadPool(THREAD_COUNT, 'dummyCallback.js');
ThreadPool.init();

WSAvcPlayer = function(){
  this.container =  document.createElement('div');
  this.container.style.position = "relative";

  this.canvas_text = document.createElement('canvas');
  this.canvas_text.id = "TextCanvas";
  this.canvas_text.style.zIndex = "10";
  this.canvas_text.style.position = "absolute";
  this.canvas_text.style.top = "0px";
  this.canvas_text.style.left = "0px";

  this.canvas = document.createElement('canvas');  
  this.canvas.id = "ScreenCanvas";  
  this.ctx = this.canvas_text.getContext("2d");

  this.container.appendChild(this.canvas);
  this.container.appendChild(this.canvas_text);

  document.body.appendChild(this.container);

  this.webgl_ctx = this.canvas.getContext("webgl");
  if(!this.webgl_ctx){
    console.log("not support webgl");
    return false;
  }

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
  this.drawfps=function()
  {      
      this.ctx.font = "30px Arial";
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

      this.ctx.fillText("FPS: " + String(this.record_fps),10, 50);
      this.ctx.fillText("Latency: " + String(this.Latency),10, 100);
      this.ctx.fillText("Bitrate: " + String(this.Bitrate),10, 150);
      this.ctx.fillText("Resolution: " + String(this.canvas.width) + " x " + String(this.canvas.height),10, 200);
  }.bind(this);
  

  this.decoder.onPictureDecoded = function(buffer, width, height, infos){
    var lumaSize = width * height;
    var chromaSize = lumaSize >> 2;

    var ybuf = buffer.subarray(0, lumaSize);
    var ubuf = buffer.subarray(lumaSize, lumaSize + chromaSize);
    var vbuf = buffer.subarray(lumaSize + chromaSize, lumaSize + 2 * chromaSize);

    if(!this.Renderer){
      this.Renderer = new YUVCanvas({
        canvas: this.canvas,
        contextOptions: null,
        width: width,
        height: height
      });  
    }

    this.Renderer.setSize(width, height);
    this.Renderer.drawNextOuptutPictureGL({uData:ubuf, yData:ybuf, vData:vbuf}, null, null, null);
 
    this.drawfps();

    if(this.RenderingCallback){
        this.RenderingCallback(this.canvas, width, height, this.canvasBuffer);
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

  this.disconnect = function(){
    if(!this.ws)
      return;
    this.ws.close()
  };

  this.connect = function(url){
    this.ws = new WebSocket(url);
    this.ws.binaryType = "arraybuffer";
    this.ws.onopen = function() {
      console.log("WSAvcPlayer: Connected to " + url);
      this.sendPing();
    }.bind(this);
    this.ws.onopen = function(open){wsavc.onwsopen(open)};
    this.ws.onerror = function(error){wsavc.onwserror(error)};
    this.ws.onclose = function(close){wsavc.onwsclose(close)};
    this.ws.onmessage = function(evt) {

      if(typeof evt.data == "string") {
          var json_obj = JSON.parse(evt.data);

          switch(json_obj.action){
              case "init":
                  this.Bitrate=json_obj.bitrate;
                  this.Framerate=json_obj.framerate;

                  this.canvas.width  = json_obj.width;
                  this.canvas.height = json_obj.height;
                
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

      this.frames.push({"timeStamp":timeStamp, "frame":new Uint8Array(frame)});

      this.fps++;
    }.bind(this);
  }.bind(this);

  setInterval(function(wsavcPlayer)
  {
      var index=0;
      while(wsavcPlayer.frames.length>0){
        var packet = wsavcPlayer.frames[0];

        if(wsavcPlayer.timeCalibrator.getRemoteTick() >=packet.timeStamp) {
          // wsavcPlayer.decoder.decode(packet.frame);
          ThreadPool.addTask(new Task(wsavcPlayer.decoder.decode, packet.frame, 0, wsavcPlayer.decoder));
          wsavcPlayer.frames.shift();
        }

        index++;

        if(index>=wsavcPlayer.frames.length)
          return;
      }
 
  }, 10, this);

  this.send= function(msg){
    this.ws.send(msg);
  }.bind(this);;
};

var wsavc = null;

