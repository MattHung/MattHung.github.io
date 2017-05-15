/**
 * Created by matt1201 on 2016/3/23.
 */

eventRegister=cc.Class.extend({
    current_target:null,
    root_node:null,
    _game_layers:null,

    ctor:function(){
        this.current_target =null;
        this._game_layers = [];
    },

    setRootNode:function(root){
        this.current_target =null;
        this.eventSender = [];

        this.root_node = root;
        this.registerEvent();
    },

    compareRenderOrder:function(node_a, node_b){
        if(node_a.getLocalZOrder() > node_b.getLocalZOrder())
            return -1;
        if(node_a.getLocalZOrder() < node_b.getLocalZOrder())
            return 1;

        if(node_a.__instanceId > node_b.__instanceId)
            return -1;

        if(node_a.__instanceId < node_b.__instanceId)
            return 1;

        return 0;
    },

    getLayerIndex:function(gameLayer){
        for(var i = 0; i < this._game_layers.length; i++)
        if(this._game_layers[i] == gameLayer)
            return i;

        return -1;
    },

    //node: mouse event registration of node
    //callback: callback(node, mouseHitPoint)
    registerMouseEvent:function(gameLayer, node, callback_mouseDown, callback_mouseUp, callback_mouseEnter, callback_mouseOver){
        var sender = {};
        sender.target = gameLayer;
        sender.node = node;
        sender.callback_mouseDown = callback_mouseDown;
        sender.callback_mouseUp = callback_mouseUp;
        sender.callback_mouseEnter = callback_mouseEnter;
        sender.callback_mouseOver = callback_mouseOver;        
        sender.node.sender = sender;

        this.setWidget(node);
        this.setTouchEvent(node);

        var event_layer_index = this.getLayerIndex(gameLayer);
        if(event_layer_index < 0){
            this._game_layers.push(gameLayer);
            event_layer_index = this.getLayerIndex(gameLayer);
        }

        this._game_layers[event_layer_index].addSender(sender);
        this._game_layers.sort(this.compareRenderOrder);
    },

    removeTargetEvent(gameLayer, node){
        var event_layer_index = this.getLayerIndex(gameLayer);

        if (event_layer_index == -1)
            return;

        this._game_layers[event_layer_index].resetSender(node);
        for (var i = 0; i < this._game_layers.length; i++) {
            if (this._game_layers[i] == gameLayer)
                this._game_layers.splice(i , 1);
        }
    },

    setWidget: function (node) {
        if (!(node instanceof ccui.Widget))
            return;
        node.setTouchEnabled(false);
    },

    clear:function(){
        this._game_layers = [];
    },

    setTouchEvent:function(node){
        if (!cc.sys.capabilities.hasOwnProperty('touches'))
            return;

        var touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,

            onTouchBegan: function (touch, event) {
                this.onMouseMove(touch.getLocation());
                return this.onMouseDown(touch.getLocation(), event._currentTarget);
            }.bind(this),
            onTouchMoved: function (touch, event) {
                return this.onMouseMove(touch.getLocation(), event._currentTarget);
            }.bind(this),
            onTouchEnded: function (touch, event) {
                return this.onMouseUp(touch.getLocation(), event._currentTarget);
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
                return this.onMouseMove(new cc.Point(event.getLocationX(), event.getLocationY()));
            }.bind(this),
            onMouseUp: function (event) {
                return this.onMouseUp(new cc.Point(event.getLocationX(), event.getLocationY()));
            }.bind(this),
            onMouseScroll: function (event) {
            }.bind(this)
        });

        cc.eventManager.addListener(mouseListener, this.root_node);
    },

    castNode: function (point, castMove) {
        for (var i = 0; i < this._game_layers.length; i++) {
            var hit_test_fp = null;
            if(castMove)
                hit_test_fp = this._game_layers[i].hit_test_move.bind(this._game_layers[i]);
            else
                hit_test_fp = this._game_layers[i].hit_test.bind(this._game_layers[i]);

            var hit_node = hit_test_fp(point);
            if(hit_node)
                return hit_node;
        }

        return null;
    },

    onMouseMove:function(point){
        var changed = false;
        var hit_target = this.castNode(point, true);

        if(hit_target){
            if(hit_target!=this.current_target){
                if(this.current_target)
                if(this.current_target.callback_mouseOver)
                   this.current_target.callback_mouseOver.call(this.current_target.target, this.current_target.node, point);

                if (hit_target.callback_mouseEnter)
                    hit_target.callback_mouseEnter.call(hit_target.target, hit_target.node, point);
                this.current_target = hit_target;
            }

            return true;
        }

        if(this.current_target)
        if(this.current_target.callback_mouseOver)
           this.current_target.callback_mouseOver.call(this.current_target.target, this.current_target.node, point);

        this.current_target =  null;
        return false;
    },

    onMouseDown:function(point, node){
        var hit_node = this.castNode(point);        

        if(!hit_node)
            return false;

        if (hit_node.node._onPressStateChangedToDisabled)
            if (!hit_node.node.isBright())
                return false;

        if (hit_node.node._onPressStateChangedToPressed)
            hit_node.node._onPressStateChangedToPressed();
        
        if(hit_node.callback_mouseDown) {
            hit_node.callback_mouseDown.call(hit_node.target, hit_node.node, point);
            return true;
        }

        return false;
    },

    onMouseUp:function(point){
        var hit_node = this.castNode(point);

        if(!hit_node)
            return false;

        if (hit_node.node._onPressStateChangedToDisabled)
            if (!hit_node.node.isBright())
                return false;


        if (hit_node.node._onPressStateChangedToNormal)
            hit_node.node._onPressStateChangedToNormal();
        
        if(hit_node.callback_mouseUp) {
            hit_node.callback_mouseUp.call(hit_node.target, hit_node.node, point);
            return true;
        }

        return false;
    },

    registerEvent:function(){
        this.setTouchEvent();
        this.setMouseEvent();
    }
});

CocosWidget.eventRegister = function () {
};
CocosWidget.eventRegister._instance = null;
CocosWidget.eventRegister.getInstance=function(){

    if(!CocosWidget.eventRegister._instance)
        CocosWidget.eventRegister._instance = new eventRegister();

    return CocosWidget.eventRegister._instance;
};
