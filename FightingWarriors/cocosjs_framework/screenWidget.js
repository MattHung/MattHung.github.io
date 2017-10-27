/**
 * Created by matt1201 on 2016/3/18.
 */

var gameCanvas = document.getElementById("gameCanvas");
var gameCanvasCtx = gameCanvas.getContext('2d');

// define the design resolution
const DesignedWidth = 750;
const DesignedHeight = 1334;

var screenWidget = (function(){
    var _instance;

    function createInstance(){
        var _current_mouse_event;
        function init(){
            cc.eventManager.addListener({
                event: cc.EventListener.MOUSE,
                onMouseMove: function(event){
                    _current_mouse_event = event;
                }
            },this);
        }

        function adjustResolution(){
            var designWidth = DesignedWidth;
            var designHeight = DesignedHeight;

            // retrieve device resolution
            var deviceWidth = cc.visibleRect.width;
            var deviceHeight = cc.visibleRect.height;

            var k = 1, x = 0, y = 0;

            k = deviceWidth / designWidth;
            var scaledHeight = designHeight * k;
            if (scaledHeight <= deviceHeight) {
                y = (deviceHeight - scaledHeight);
            } else {
                k = deviceHeight / designHeight;
                var scaledWidth = designWidth * k;
                if (scaledWidth <= deviceWidth) {
                    x = (deviceWidth - scaledWidth);
                } else {
                    throw new Error("can't fit the screen!");
                }
            }

            // print out parameters
            cc.log("device width:" + deviceWidth);
            cc.log("device height:" + deviceHeight);
            cc.log("k:" + k + " x:" + x + " y:" + y);

            // resize the design resolution
            cc.view.setDesignResolutionSize( designWidth + x / k, designHeight + y / k, cc.ResolutionPolicy.SHOW_ALL);
        }

        function CheckMouseHitArea(rect)
        {
            var target = _current_mouse_event.getCurrentTarget();
            var locationInNode = target.convertToNodeSpace(_current_mouse_event.getLocation());

            var s = target.getContentSize();

            //Check the click area
            if (cc.rectContainsPoint(rect, locationInNode)) {
                return true;
            } else {
                return false;
            }
        }

        function GetPixel(point){
            var context = gameCanvas.getContext("2d");
            //context.fill();
            //data = context.getImageData(point.x, point.y, 1, 1).data;
            data = context.getImageData(0, 0, 1, 1).data;
            color = new cc.Color([data[0], data[1], data[2]]);
            logger.log(data);
        }

        return {
            adjustResolution:adjustResolution,
            CheckMouseHitArea:CheckMouseHitArea,
            GetPixel:GetPixel
        };
    }

    return {
        getInstance:function(){
            if(!_instance)
                _instance = createInstance();

            return _instance;
        }
    };
})();