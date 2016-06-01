RushMedia=function(canvas_name){
    logger.disableLogger();

    var Options={};

    var _this = this;    
    _this.canvas_name = canvas_name;
    _this.wsavc = new WSAvcPlayer(_this.canvas_name);

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    function switchChanel(camera_id, w, h, b, f){
        var json_str = JSON.stringify({
            action: "switch_chanel",     
            camera_id:camera_id,       
            width: w,
            height: h,
            bitrate: b,
            framerate: f
        });
        _this.wsavc.send(json_str);        
    }

    function onopen(open){
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

        if(_this.onopen)
            _this.onopen(open);
    }

    function onwsmessage(json_obj){
        if(_this.onrecvmessageCallback)
            _this.onrecvmessageCallback(json_obj);

        switch(json_obj.action){
            case "source_list":
                for(var i=0; i<json_obj.source.length; i++) {
                    var resolution=json_obj.source[i].width.toString() + "x" + json_obj.source[i].height.toString();
                    var option = Options[resolution];
                    if(option==undefined) {
                        Options[resolution] = [];
                        option = Options[resolution];
                    }

                    Options[resolution].push(json_obj.source[i]);
                }

                for(var option in Options) {
                    option = Options[option];
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

                        // document.getElementById("Settings").appendChild(element);
                    }

                    // document.getElementById("Settings").appendChild(document.createElement("br"));
                }
                break;
        }
    }

    function onerror(error){
        logger.logger(error);

        if(_this.onerror)
            _this.onerror(error);
    }

    function onclose(close){
        logger.logger("close");

        if(_this.onclose)
            _this.onclose(close);
    }

    function loadVideo(ws_url)
    {
        _this.wsavc.connect(ws_url);

        _this.wsavc.onwsopen = onopen;
        _this.wsavc.onwsmessage = onwsmessage;
        _this.wsavc.onwserror = onerror;
        _this.wsavc.onwsclose = onclose;
        _this.wsavc.canvas.style.visibility="visible";
    }

    function callbackInternal_switchChannel(w, h, b, f)
    {
        _this.streamingInfo ={"width":w, "height":h, "bitrate":b, "fps":f};
        _this.onSwitchChannelCallback(w, h, b, f);
    }

    //renderingCallback: function(width, height, canvasBuffer)
    //switchChannelCallback: function(w, h, b, f)
    function setCallback(renderingCallback, switchChannelCallback, onrecvmessageCallback)
    {
        _this.wsavc.setRenderCallback(renderingCallback);        
        _this.wsavc.setSwitchChannelCallback(this.callbackInternal_switchChannel);

        _this.onSwitchChannelCallback = switchChannelCallback;
        _this.onrecvmessageCallback = onrecvmessageCallback;
    }

    function setNetworkEvent(onopen, onerror, onclose) {
        _this.onopen = onopen;
        _this.onerror = onerror;
        _this.onclose = onclose;
    }

    function setVisible(value)
    {
        if(value){
            _this.wsavc.canvas.style.visibility="visible";
            return;
        }

        _this.wsavc.canvas.style.visibility="hidden";
    }

    function getCanvas(){
        return _this.wsavc.canvas;
    }

    function showStreamingInfo(value)
    {
        _this.wsavc.showInfo = value;
    }

    function getStreamingInfo()
    {
        return _this.streamingInfo;
    }

    function getCCUInfo()
    {
        return _this.wsavc.ccu;
    }

    document.getElementById(_this.canvas_name).style.position = "absolute";
    document.getElementById(_this.canvas_name).style.left = "0%";
    document.getElementById(_this.canvas_name).style.top = "0%";
    document.getElementById(_this.canvas_name).style.zIndex = -1;

    return{
        callbackInternal_switchChannel:callbackInternal_switchChannel,

        loadVideo:loadVideo,
        setCallback:setCallback,
        setNetworkEvent:setNetworkEvent,
        setVisible:setVisible,
        getCanvas: getCanvas, 
        switchChanel:switchChanel,
        showStreamingInfo:showStreamingInfo,
        getStreamingInfo:getStreamingInfo,
        getCCUInfo:getCCUInfo
    }
};