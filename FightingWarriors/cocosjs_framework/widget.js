/**
 * Created by matt1201 on 2016/3/21.
 */

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

//InvokeFunction("Namespace.functionName", arguments);
//InvokeFunction("Namespace.functionName", object, arguments);
function InvokeFunction(functionName, context /*, args */) {
    var args = [].slice.call(arguments).splice(2);
    var namespaces = functionName.split(".");
    var func = namespaces.pop();
    for(var i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]];
    }

    if(!context[func])
        return;
    return context[func].apply(context, args);
};

function getURLParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

//var link = String.format('<a href="{0}/{1}/{2}" title="{3}">{3}</a>',url, year, titleEncoded, title);
String.format = function() {
    // The string containing the format items (e.g. "{0}")
    // will and always has to be the first argument.
    var theString = arguments[0];

    // start with the second argument (i = 1)
    for (var i = 1; i < arguments.length; i++) {
        // "gm" = RegEx options for Global search (more than one instance)
        // and for Multiline search
        var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
        theString = theString.replace(regEx, arguments[i]);
    }

    return theString;
};

CCRandom = function(){};
CCRandom.getRandomInt = function(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;    
};

// parent/second_layer/child_node
CocosWidget = function(){};
CocosWidget.getNode =function(parent_node, path){
    var path_names = path.split("/");
    var result_node=null;

    for(var i =0; i<path_names.length; i++)
    {
        if(path_names[i]=="")
            continue;
        var node = ccui.helper.seekWidgetByName(parent_node, path_names[i]);
        if(node) {
            parent_node = node;

            if(i==path_names.length-1)
                result_node = parent_node;
        }
    }

    return result_node;
};

//connect children of node to object
CocosWidget.connectNode =function(node, object){
    if(!object)
        throw new Error("object is null!");
    if(node.getChildren==undefined)
        throw new Error("node.getChildren undefined!");
    var children =node.getChildren();
    for(var i =0; i<children.length; i++)
    {
        var name =children[i].getName();
        object[name] = children[i];

        CocosWidget.connectNode(children[i], object[name]);
    }
};

CocosWidget.cloneNode =function(node) {
    var cloneNodeInternal = function(internalNode){
        var result =null;
        if(internalNode instanceof cc.Sprite){
            result = new cc.Sprite();
            result.setTexture(internalNode.getTexture());
            result.setSpriteFrame(internalNode.getSpriteFrame());
        }

        if(internalNode instanceof ccui.Text){
            result = new ccui.Text();
            result.setString(internalNode.getString());
            result.setFontSize(internalNode.getFontSize());
            result.setFontName(internalNode.getFontName());
        }

        if(internalNode instanceof ccui.Button){
            result = new ccui.Button(internalNode._normalFileName, internalNode._clickedFileName, internalNode._disabledFileName);
            result.setTitleFontSize(internalNode.getTitleFontSize());
            result.setScale9Enabled(internalNode.isScale9Enabled());
            result.setTitleColor(internalNode.getTitleColor());
            result.setTitleText(internalNode.getTitleText());
            result.setContentSize(internalNode.getContentSize());
            result.setTouchEnabled(internalNode.touchEnabled);
        }

        if(!result)
            result = new cc.Node();
        return result;
    };

    var cloneProperties = function(source, destination){
        destination.setName(source.getName());
        destination.setVisible(source.visible);
        destination.setRotation(source.getRotation());
        destination.setScaleX(source.getScaleX());
        destination.setScaleY(source.getScaleY());
        destination.setPosition(source.getPosition());
        destination.setAnchorPoint(source.getAnchorPoint());
        destination.setLocalZOrder(source.getLocalZOrder());
    };

    var result = cloneNodeInternal(node);
    cloneProperties(node, result);

    var children = node.getChildren();

    for(var i=0; i <children.length; i++){
        var subNode=cloneNodeInternal(children[i]);
        cloneProperties(children[i], subNode);
        result.addChild(subNode);
        CocosWidget.cloneNode(subNode);
    }

    return result;
};

CocosWidget.getElapseTick = function(nowTick){
    return new Date().getTime() - nowTick;
};

CocosWidget.removeRedundantSuffix = function(node, suffix){
    var sourceName = node.getName();
    var lastDashIndex = sourceName.lastIndexOf(suffix);
    node.setName(sourceName.substring(0, lastDashIndex));
};

CocosWidget.Orientation = function(){};
CocosWidget.Orientation.setRotateCallback = function(callback){
    CocosWidget.Orientation._rotateEvent = callback;

    var supportsOrientationChange = "onorientationchange" in window,
        orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

    window.addEventListener(orientationEvent,
        function() {
            this._rotateEvent(this.getScreenOrientation());
        }.bind(CocosWidget.Orientation),
    false);
};

CocosWidget.Orientation.getScreenOrientation = function(){

    switch (window.orientation){
        case 90:
        case -90:
            return "Landscape";

        case 0:
        case 360:
            return "Portrait";
        default :
            return undefined;
    }
};

CocosWidget.Screen=function(){};
CocosWidget.Screen.registerFullScreenCallback= function(callback){
    CocosWidget.Screen._fullScreenCallback = callback;

    if (document.addEventListener)
    {
        var fullScreenHandler =function()
        {
            var isFullScreen = false;
            if (document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement !== null) {
                isFullScreen = (document.webkitIsFullScreen!=null)?document.webkitIsFullScreen:isFullScreen;
                isFullScreen = (document.mozFullScreen!=null)?document.mozFullScreen:isFullScreen;
                isFullScreen = (document.msFullscreenElement!=null)?document.msFullscreenElement:isFullScreen;
                CocosWidget.Screen._fullScreenCallback(isFullScreen);
            }
        };

        document.addEventListener('webkitfullscreenchange', fullScreenHandler, false);
        document.addEventListener('mozfullscreenchange', fullScreenHandler, false);
        document.addEventListener('fullscreenchange', fullScreenHandler, false);
        document.addEventListener('MSFullscreenChange', fullScreenHandler, false);
    }
};

CocosWidget.Storage  = cc.Class.extend({
    load: function(key) { 
        var jsonStr = cc.sys.localStorage[key];       

        if(jsonStr)
            return JSON.parse(jsonStr);

        return "";
    },

    save: function(key, data){        
        cc.sys.localStorage.removeItem(key);
        cc.sys.localStorage.setItem(key, JSON.stringify(data));
    }
});
