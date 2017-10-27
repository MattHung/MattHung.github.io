/**
 * Created by matt1201 on 2016/3/23.
 */

eventRegister=cc.Class.extend({
    current_target:null,
    root_node:null,
    eventSender:null,

    ctor:function(){
        this.current_target =null;
        this.eventSender = [];
    },

    setRootNode:function(root){
        this.current_target =null;
        this.eventSender = [];

        this.root_node = root;

        this.registerEvent();
    },

    //node: mouse event registration of node
    //callback: callback(node, mouseHitPoint)
    registerMouseEvent:function(target, node, callback_mouseDown, callback_mouseUp, callback_mouseEnter, callback_mouseOver, callback_mouseMove){
        var sender = {};
        sender.target = target;
        sender.node = node;
        sender.callback_mouseDown = callback_mouseDown;
        sender.callback_mouseUp = callback_mouseUp;
        sender.callback_mouseEnter = callback_mouseEnter;
        sender.callback_mouseOver = callback_mouseOver;
        sender.callback_mouseMove = callback_mouseMove;
        this.eventSender.push(sender);

        this.setWidget(node);
        this.setTouchEvent(node);
    },

    setWidget:function(node){
        if(!(node instanceof ccui.Widget))
            return;

        node.setTouchEnabled(true);
    },

    setTouchEvent:function(node){
        if (!cc.sys.capabilities.hasOwnProperty('touches'))
            return;

        var touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,

            onTouchBegan: function (touch, event) {
                this.onMouseMove(touch.getLocation(), event._touches[0]);
                return this.onMouseDown(touch.getLocation());
            }.bind(this),
            onTouchMoved: function (touch, event) {
                return this.onMouseMove(touch.getLocation(), event._touches[0]);
            }.bind(this),
            onTouchEnded: function (touch, event) {
                return this.onMouseUp(touch.getLocation());
            }.bind(this)
        });

        cc.eventManager.addListener(touchListener, node==undefined?this.root_node:node);
    },

    setMouseEvent:function(){
        if (!cc.sys.capabilities.hasOwnProperty('mouse'))
            return;

        var mouseListener = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            swallowTouches: true,
            onMouseDown: function (event) {
                return this.onMouseDown(new cc.Point(event.getLocationX(), event.getLocationY()));
            }.bind(this),
            onMouseMove: function (event) {
                return this.onMouseMove(new cc.Point(event.getLocationX(), event.getLocationY()), event);
            }.bind(this),
            onMouseUp: function (event) {
                return this.onMouseUp(new cc.Point(event.getLocationX(), event.getLocationY()));
            }.bind(this),
            onMouseScroll: function (event) {
            }.bind(this)
        });

        cc.eventManager.addListener(mouseListener, this.root_node);
    },

    onMouseMove:function(point, event){
        for(var i=this.eventSender.length -1 ; i>=0; i--){
            var scrollView = null;

            var boundingBox = this.eventSender[i].node.getBoundingBox();

            var worldSpace = this.eventSender[i].node.convertToWorldSpace(new cc.Point(0, 0));
            boundingBox.x = worldSpace.x;
            boundingBox.y = worldSpace.y;

            if(cc.rectContainsPoint(boundingBox, point)) {                
                if(isSpriteTransparentInPoint(point))
                    continue;

                if(this.eventSender[i].node.isVisible==undefined)
                    continue;

                if(this.eventSender[i].node.isVisible()==false)
                    continue;

                if(this.eventSender[i]!=this.current_target) {
                    point.pixel = GetPixel(point);
                    this.current_target = this.eventSender[i];

                    if(this.eventSender[i].callback_mouseEnter)
                        this.eventSender[i].callback_mouseEnter.call(this.current_target.target, this.eventSender[i].node, point, event);
                }

                if(this.eventSender[i].callback_mouseMove)
                    this.eventSender[i].callback_mouseMove.call(this.current_target.target, this.eventSender[i].node, point, event);                
                this.current_target = this.eventSender[i];
                return true;
            }
        }

        if(this.current_target)
            if(this.current_target.callback_mouseOver)
                this.current_target.callback_mouseOver.call(this.current_target.target, this.current_target.node, point, event);

        this.current_target =  null;
        return false;
    },

    onMouseDown:function(point){
        if(this.current_target) {
            if(this.current_target.node._onPressStateChangedToPressed)
                this.current_target.node._onPressStateChangedToPressed();

            point.pixel = GetPixel(point);
            if(this.current_target.callback_mouseDown) {
                this.current_target.callback_mouseDown.call(this.current_target.target, this.current_target.node, point);
                return true;
            }
        }

        return false;
    },
    onMouseUp:function(point){
        if(this.current_target) {
            if(this.current_target.node._onPressStateChangedToNormal)
                this.current_target.node._onPressStateChangedToNormal();

            point.pixel = GetPixel(point);
            if(this.current_target.callback_mouseUp) {
                this.current_target.callback_mouseUp.call(this.current_target.target, this.current_target.node, point);
                return true;
            }
        }

        return false;
    },

    registerEvent:function(){
        this.setTouchEvent();
        this.setMouseEvent();
    }
});

CocosWidget.eventRegister= function(){};
CocosWidget.eventRegister._instance = null;
CocosWidget.eventRegister.getInstance=function(){

    if(!CocosWidget.eventRegister._instance)
        CocosWidget.eventRegister._instance = new eventRegister();

    return CocosWidget.eventRegister._instance;
};
