var camera_id =10002;

RushMedia=function(){
    logger.disableLogger();

    var Options={};

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    function switchResolution(camera_id, w, h, b, f){
        var json_str = JSON.stringify({
            action: "switch_chanel",     
            camera_id:camera_id,       
            width: w,
            height: h,
            bitrate: b,
            framerate: f
        });
        wsavc.send(json_str);
    }

    function onopen(open){
        if(isIE)
        {
            switchResolution(camera_id, 640, 360, 500, 10);
            return;
        }

        var ua = navigator.userAgent;

        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(ua))
            switchResolution(camera_id, 482, 272, 350, 15);
        else if (/Chrome/i.test(ua))
            switchResolution(camera_id, 1136, 640, 600, 15);
        else
            switchResolution(camera_id, 1136, 640, 600, 15);
    }

    function onwsmessage(json_obj){

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
                        element.name = "button_" + (json_obj.source.length - 1).toString();  // And the name too?

                        element.value = option[i].width.toString() +
                        "x" + option[i].height.toString() +
                        "   b:" + option[i].bitrate + " fr:" + option[i].framerate;

                        element.setAttribute("width", option[i].width);
                        element.setAttribute("height", option[i].height);
                        element.setAttribute("bitrate", option[i].bitrate);
                        element.setAttribute("framerate", option[i].framerate);

                        element.onclick = function () { // Note this is a function
                            switchResolution(this.getAttribute("width"), this.getAttribute("height"), this.getAttribute("bitrate"), this.getAttribute("framerate"));
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
    }

    function onclose(close){
        logger.logger("close");
    }

    function loadVideo()
    {
        wsavc.connect("ws://111.235.135.80:50480");

        wsavc.onwsopen = onopen;
        wsavc.onwsmessage = onwsmessage;
        wsavc.onwserror = onerror;
        wsavc.onwsclose = onclose;
        wsavc.canvas.style.visibility="visible";
    }

    //renderingCallback: function(width, height, canvasBuffer)
    //switchChannelCallback: function(w, h, b, f)
    function setCallback(renderingCallback, switchChannelCallback)
    {
        wsavc.setRenderCallback(renderingCallback);
        wsavc.setSwitchChannelCallback(switchChannelCallback);
    }

    function setVisible(value)
    {
        if(value){
            wsavc.canvas.style.visibility="visible";
            return;
        }

        wsavc.canvas.style.visibility="hidden";
    }

    function getCanvas(){
        return wsavc.canvas;
    }

    document.getElementById("ScreenCanvas").style.position = "absolute";
    document.getElementById("ScreenCanvas").style.left = "0%";
    document.getElementById("ScreenCanvas").style.top = "0%";
    document.getElementById("ScreenCanvas").style.zIndex = -1;

    return{
        loadVideo:loadVideo,
        setCallback:setCallback,
        setVisible:setVisible,
        getCanvas: getCanvas
    }
};
