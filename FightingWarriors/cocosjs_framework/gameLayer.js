/**
 * Created by matt1201 on 2016/3/21.
 */

function GetPixel(point){
    if(cc.sys.os == cc.sys.OS_IOS)
        return null;

    var scale_x = gameCanvas.width / DesignedWidth;
    var scale_y = gameCanvas.height / DesignedHeight;
    var left = point.x * scale_x;
    var top = (DesignedHeight - point.y) * scale_y;
    var imgData = gameCanvasCtx.getImageData(left, top, 1 , 1);

    // r, g, b, a
    return imgData.data.slice(0, 4);
}

function isSpriteTransparentInPoint(point) {
    var pixel = GetPixel(point);

    if(pixel==null)
        return false;

    if(pixel[3]==0)
        return true;

    return false;
}

var gameLayer = cc.Layer.extend({
    layer_res:null,
    root_node:null,

    ctor:function(resName_or_rootNode){
        this._super();

        if(typeof(resName_or_rootNode)=="string") {
            scenes.push(this);
            this.layer_res = ccs.load(resName_or_rootNode);
            this.root_node = this.layer_res.node;
            this.addChild(this.root_node);
        }

        if(resName_or_rootNode instanceof cc.Node) {
            this.root_node=resName_or_rootNode;
        }
    },

    //callback: callback(node, mouseHitPoint)
    registerMouseEvent:function(node, callback_mouseDown, callback_mouseUp, callback_mouseEnter, callback_mouseOver, callback_mouseMove, target){
        if(target==undefined)
            target = this;

        CocosWidget.eventRegister.getInstance().registerMouseEvent(target, node, callback_mouseDown, callback_mouseUp, callback_mouseEnter, callback_mouseOver, callback_mouseMove);
    },

    // parent/second_layer/child_node
    getNode:function(path){
        return CocosWidget.getNode(this.root_node, path);
    },
    //connect children of node to object
    connectNode:function(node, object){
        return CocosWidget.connectNode(node, object);
    },
    setVisible: function (visible) {
        this.root_node.setVisible(visible);
    }
});
