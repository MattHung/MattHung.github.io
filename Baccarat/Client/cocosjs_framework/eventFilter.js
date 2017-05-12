/**
 * Created by matt1201 on 2016/3/23.
 */

 eventFilter=cc.Class.extend({ 	
    eventSender:null,
    eventMoveSender:null,


    ctor:function(){        
        this.eventSender = [];
        this.eventMoveSender = [];
    },

    compareRenderOrder:function(sender_a, sender_b){
    	var node_a = sender_a.node;
    	var node_b = sender_b.node;

    	return CocosWidget.eventRegister.getInstance().compareRenderOrder(node_a, node_b);
    },

    checkDuplicate:function(sender){
    	for(var i =0; i < this.eventSender.length; i++)
		if(this.eventSender[i].node == sender.node)
			return true;

		return false;
    },
    
    addSender:function(sender){
    	if(this.checkDuplicate(sender))
    		return;

        this.eventSender.push(sender);
        this.eventSender.sort(this.compareRenderOrder);

        if(!sender.callback_mouseOver)
    	if(!sender.callback_mouseEnter)
    		return;

    	this.eventMoveSender.push(sender);
    	this.eventMoveSender.sort(this.compareRenderOrder);
    },

    removeSender: function (sender) {
        var obj = null;

        for (var i = 0; i < this.eventSender.length; i++) {
            obj = this.eventSender[i];
            if (obj.node == sender) {
                this.eventSender.splice(i, 1);
            }
        }

        for (var i = 0; i < this.eventMoveSender.length; i++) {
            obj = this.eventMoveSender[i];
            if (obj.node == sender) {
                this.eventMoveSender.splice(i, 1);
            }
        }
    },

    castNodeInternal: function (eventSenders, point) {
        var changed = false;
        var hit_target = null;
        try {
            for (var i = 0; i < eventSenders.length; i++) {
                var boundingBox = eventSenders[i].node.getBoundingBox();
                var worldSpace = eventSenders[i].node.convertToWorldSpace(new cc.Point(0, 0));
                boundingBox.x = worldSpace.x;
                boundingBox.y = worldSpace.y;

                if (cc.rectContainsPoint(boundingBox, point)) {
                    // if (isSpriteTransparentInPoint(point))
                    //     continue;

                    if (eventSenders[i].node.isVisible == undefined)
                        continue;

                    if (this.checkVisible(eventSenders[i].node) == false)
                        continue;

                    if (eventSenders[i].node.isVisible() == false)
                        continue;

                    if (this.checkClipping(eventSenders[i].node, point) == false)
                        continue;

                    return eventSenders[i];
                }
            }
        }finally {
            
        }

        return null;
    },

    castNode:function(point){        
        return this.castNodeInternal(this.eventSender, point);      
    },

    castMoveNode:function(point){        
        return this.castNodeInternal(this.eventMoveSender, point);      
    },

    checkVisible:function(node){
        var current = node;

        while(current = current.parent) {
            if (current)
                if (!current.isVisible())
                    return false;
        }

        return true;
    },

    checkClipping: function (node, pt) {
        var current = node;
        while (current = current.parent) {
            if (current._clippingEnabled) {
                if (!node.isClippingParentContainsPoint(pt))
                    return false;
                return true;
            }
        }
        return true;
    }
 });