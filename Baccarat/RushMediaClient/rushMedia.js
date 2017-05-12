var RushMedia = function(canvas_name){    
    logger.disableLogger();

    this.Options={};
    this.canvas_name = canvas_name;
    this.wsavc = new WSAvcPlayer();
 
    RushMedia.prototype.switchChanel = function(camera_id, w, h, b, f){
        var json_str = JSON.stringify({
            action: "switch_chanel",     
            camera_id:camera_id,       
            width: w,
            height: h,
            bitrate: b,
            framerate: f
        });
        this.wsavc.send(json_str);        
    }

    RushMedia.prototype.paused = function(){
        return this.wsavc.paused;
    }

    RushMedia.prototype.connected = function(){
        if(!this.wsavc)
            return false;
        if(!this.wsavc.ws)
            return false;

        return this.wsavc.ws.readyState != this.wsavc.ws.CLOSED;
    }

    RushMedia.prototype.onopen = function(open){
        var camera_id =10002;
        if(isIE)
        {
            switchChanel(camera_id, 640, 360, 500, 10);
            return;
        }

        var ua = navigator.userAgent;

        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(ua))
            switchChanel(camera_id, 482, 272, 350, 15);
        else if (/Chrome/i.test(ua))
            switchChanel(camera_id, 1136, 640, 600, 15);
        else
            switchChanel(camera_id, 1136, 640, 600, 15);

        if(this.onopen)
            this.onopen(open);
    }

    RushMedia.prototype.onwsmessage = function(json_obj){
        if(this.onrecvmessageCallback)
            this.onrecvmessageCallback(json_obj);

        switch(json_obj.action){
            case "source_list":
                for(var i=0; i<json_obj.source.length; i++) {
                    var resolution=json_obj.source[i].width.toString() + "x" + json_obj.source[i].height.toString();
                    var option = this.Options[resolution];
                    if(option==undefined) {
                        this.Options[resolution] = [];
                        option = this.Options[resolution];
                    }

                    this.Options[resolution].push(json_obj.source[i]);
                }

                for(var option in this.Options) {
                    option = this.Options[option];
                    for (var i = 0; i < option.length; i++) {
                        var element = document.createElement("input");
                        //Assign different attributes to the element.
                        element.type = "button";
                        element.name = "button_" + (json_obj.source.length - 1).toString();  

                        element.value = option[i].camera_id.toString()
                        "@"  +option[i].width.toString() +
                        "x" + option[i].height.toString() +
                        "   b:" + option[i].bitrate + " fr:" + option[i].framerate;

                        element.setAttribute("camera_id", option[i].camera_id);
                        element.setAttribute("width", option[i].width);
                        element.setAttribute("height", option[i].height);
                        element.setAttribute("bitrate", option[i].bitrate);
                        element.setAttribute("framerate", option[i].framerate);

                        element.onclick = function () { // Note this is a function
                            switchResolution(this.getAttribute("camera_id"), this.getAttribute("width"), this.getAttribute("height"), this.getAttribute("bitrate"), this.getAttribute("framerate"));
                        };
                    }
                }
                break;
        }
    }.bind(this);

    RushMedia.prototype.onerror = function(error){
        logger.logger(error);

        if(this.onerror)
            this.onerror(error);
    }

    RushMedia.prototype.onclose = function(close){
        logger.log("close");

        if(this.onclose)
            this.onclose(close);
    }

    RushMedia.prototype.loadVideo = function(ws_url)
    {
        this.ws_url = ws_url;
        this.wsavc.connect(ws_url);

        this.wsavc.onwsopen = function(open){this.onopen.call(this, open);}.bind(this);
        this.wsavc.onwsmessage = function(json_obj){this.onwsmessage.call(this, json_obj);}.bind(this);
        this.wsavc.onwserror = function(error){this.onerror.call(this, error);}.bind(this);
        this.wsavc.onwsclose = function(close){this.onclose.call(this, close);}.bind(this);
    }

    RushMedia.prototype.closeVideo = function(){
        this.wsavc.disconnect();
    }

    RushMedia.prototype.pauseVideo = function(){
        this.wsavc.pause();
    }

    RushMedia.prototype.resumeVideo = function(){
        this.wsavc.resume();
    }

    RushMedia.prototype.callbackInternal_switchChannel = function(w, h, b, f)
    {
        this.streamingInfo ={"width":w, "height":h, "bitrate":b, "fps":f};
        this.onSwitchChannelCallback(w, h, b, f);
    }.bind(this)

    //renderingCallback: function(width, height, canvasBuffer)
    //switchChannelCallback: function(w, h, b, f)
    RushMedia.prototype.setCallback = function(renderingCallback, switchChannelCallback, onrecvmessageCallback)
    {
        this.wsavc.setRenderCallback(renderingCallback);        
        this.wsavc.setSwitchChannelCallback(this.callbackInternal_switchChannel);

        this.onSwitchChannelCallback = switchChannelCallback;
        this.onrecvmessageCallback = onrecvmessageCallback;
    }

    RushMedia.prototype.setNetworkEvent = function(onopen, onerror, onclose) {
        this.onopen = onopen;
        this.onerror = onerror;
        this.onclose = onclose;
    }

    RushMedia.prototype.getCanvas = function(){
        return this.wsavc.canvas;
    }

    RushMedia.prototype.showStreamingInfo = function(value)
    {
        this.wsavc.showInfo = value;
    }

    RushMedia.prototype.getStreamingInfo = function()
    {
        return this.streamingInfo;
    }

    RushMedia.prototype.getCCUInfo = function()
    {
        return this.wsavc.ccu;
    }
};
