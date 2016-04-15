const THREAD_COUNT = 3;

var desigenedWidth =960;
var desigenedHeight =540;

var canvas = document.createElement('canvas');
var ctx = canvas.getContext("2d");

var renderCanvas = document.createElement('canvas');
var renderCtx = renderCanvas.getContext("2d");
renderCanvas.id = "b";
renderCanvas.width=desigenedWidth;
renderCanvas.height=desigenedHeight;

document.body.appendChild(renderCanvas);

WSAvcPlayer = function(){  
  this.decoder = new Decoder(false);
  this.lastSendPingTick=0;
  this.Latency=0;
  this.ccu = 0;

  this.frames=[];

  this.timeCalibrator = new TimeCalibrator();
  this.decoder.enableColorParam = (typeof colorParam_R!="undefined");

  this.ThreadPool=new ThreadPool(3, 'dummyCallback.js');
  this.ThreadPool.init();

  setInterval(function(wsavcPlayer)
  {
      wsavcPlayer.sendPing(wsavcPlayer);
  }, 3000, this);

  setInterval(function(){    
    this.record_fps=this.fps;
    this.fps=0;    

    console.log(this.record_fps);
  }.bind(this), 1000);

  this.sendPing=function(wsavcPlayer){
    if(!wsavcPlayer.ws)
        return
      if(wsavcPlayer.ws.readyState != 1)
          return;

      wsavcPlayer.ws.send(JSON.stringify({action:"ping"}));
      wsavcPlayer.lastSendPingTick = new Date().getTime();

      wsavcPlayer.ws.send(JSON.stringify({action:"calibrate_tick"}));
  };

  this.decoder.drawfps=function()
  {      
      ctx.font = "30px Arial";
      ctx.fillText("FPS: " + String(this.record_fps),10, 50);
      ctx.fillText("Latency: " + String(this.Latency),10, 100);
      ctx.fillText("Bitrate: " + String(this.Bitrate),10, 150);
  }.bind(this);

  this.decoder.onPictureDecoded = function(buffer, width, height, infos){
    var lumaSize = width * height;
    var chromaSize = lumaSize >> 2;

    var ybuf = buffer.subarray(0, lumaSize);
    var ubuf = buffer.subarray(lumaSize, lumaSize + chromaSize);
    var vbuf = buffer.subarray(lumaSize + chromaSize, lumaSize + 2 * chromaSize);

    this.canvasBuffer = ctx.createImageData(width , height);
    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        var yIndex = x + y * width;
        var uIndex = ~~(y / 2) * ~~(width / 2) + ~~(x / 2);
        var vIndex = ~~(y / 2) * ~~(width / 2) + ~~(x / 2);
        var R = 1.164 * (ybuf[yIndex] - 16) + 1.596 * (vbuf[vIndex] - 128);
        var G = 1.164 * (ybuf[yIndex] - 16) - 0.813 * (vbuf[vIndex] - 128) - 0.391 * (ubuf[uIndex] - 128);
        var B = 1.164 * (ybuf[yIndex] - 16) + 2.018 * (ubuf[uIndex] - 128);

        var rgbIndex = yIndex * 4;

        this.canvasBuffer.data[rgbIndex+0] = R + -1;
        this.canvasBuffer.data[rgbIndex+1] = G + 3;
        this.canvasBuffer.data[rgbIndex+2] = B + 1;
        this.canvasBuffer.data[rgbIndex+3] = 0xff;

        if(this.enableColorParam){
          this.canvasBuffer.data[rgbIndex+0] += colorParam_R;
          this.canvasBuffer.data[rgbIndex+1] += colorParam_G;
          this.canvasBuffer.data[rgbIndex+2] += colorParam_B;
          this.canvasBuffer.data[rgbIndex+3] += colorParam_A;
        }
      }
    }

    ctx.putImageData(this.canvasBuffer, 0, 0);

    this.drawfps();

    renderCtx.drawImage(canvas, 0, 0, width, height, 0, 0, desigenedWidth, desigenedHeight);
  };

  this.getTimeStamp = function(data){
    var value =0;
    data = new Uint8Array(data);
    for ( var i = 7; i >= 0; i--)
      value = (value * 256) + data[i];
    return value;
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

                  canvas.width  = json_obj.width;
                  canvas.height = json_obj.height;

                  // canvas.style.width = "80%";
                  // canvas.style.height = "80%";

                  return;
                  // return this.cmd(json_obj);
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
          wsavcPlayer.decoder.decode(packet.frame);
          wsavcPlayer.frames.shift();
        }

        index++;

        if(index>=wsavcPlayer.frames.length)
          return;
      }
 
  }, 1, this);

  this.send= function(msg){
    this.ws.send(msg);
  }.bind(this);;
};

var wsavc = new WSAvcPlayer();

