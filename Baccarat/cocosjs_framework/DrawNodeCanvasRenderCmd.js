/**
 * Created by matt1201 on 2016/3/25.
 */
(function(){
    // CocosWidget.DrawNodeCanvas= function(){};

    CocosWidget.DrawNode.CanvasRenderCmd = function(renderableObject){
        cc.Node.CanvasRenderCmd.call(this, renderableObject);
        this._needDraw = true;
        this._buffer = null;
        this._drawColor = null;
        this._blendFunc = null;
    };

    CocosWidget.DrawNode.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    CocosWidget.DrawNode.CanvasRenderCmd.prototype.constructor = CocosWidget.DrawNode.CanvasRenderCmd;
    cc.extend( CocosWidget.DrawNode.CanvasRenderCmd.prototype, {
        rendering: function (ctx, scaleX, scaleY) {
            var wrapper = ctx || cc._renderContext, context = wrapper.getContext(), node = this._node;
            var alpha = node._displayedOpacity / 255;
            if (alpha === 0)
                return;

            wrapper.setTransform(this._worldTransform, scaleX, scaleY);

            //context.save();
            wrapper.setGlobalAlpha(alpha);
            if ((this._blendFunc && (this._blendFunc.src === cc.SRC_ALPHA) && (this._blendFunc.dst === cc.ONE)))
                wrapper.setCompositeOperation('lighter');               //todo: need refactor

            var locBuffer = this._buffer;
            for (var i = 0, len = locBuffer.length; i < len; i++) {
                var element = locBuffer[i];
                switch (element.type) {
                    case CocosWidget.DrawNode.TYPE_CANVAS:
                        this._drawImage(wrapper, element, scaleX, scaleY);
                        break;
                }
            }
        },

        _drawImage: function (wrapper, element, scaleX, scaleY) {
            var ctx = wrapper.getContext();

            sourcePoint = new cc.Point(0, 0);

            var dWidth = element.lineWidth * scaleX;
            var dHeight = element.lineHeight * scaleY;

            ctx.drawImage(element.canvas, sourcePoint.x, -(sourcePoint.y + dHeight), dWidth, dHeight);
        }
    });
})();
