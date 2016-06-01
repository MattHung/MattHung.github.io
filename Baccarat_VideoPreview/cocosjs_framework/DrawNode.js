/**
 * Created by matt1201 on 2016/3/25.
 */

/****************************************************************************
 Copyright (c) 2013-2014 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

(function(){
    CocosWidget.DrawNodeCanvas= function(){};

    CocosWidget.DrawNodeCanvas.CanvasRenderCmd = function(renderableObject){
        cc.Node.CanvasRenderCmd.call(this, renderableObject);
        this._needDraw = true;
        this._buffer = null;
        this._drawColor = null;
        this._blendFunc = null;
    };

    CocosWidget.DrawNodeCanvas.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    CocosWidget.DrawNodeCanvas.CanvasRenderCmd.prototype.constructor = CocosWidget.DrawNodeCanvas.CanvasRenderCmd;
    cc.extend( CocosWidget.DrawNodeCanvas.CanvasRenderCmd.prototype, {
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

            

            //ctx.drawImage(element.canvas, sourcePoint.x, -(sourcePoint.y + element.lineHeight), dWidth, dHeight);
            // ctx.drawImage(element.canvas, sourcePoint.x, -(sourcePoint.y + dHeight), dWidth, dHeight);

            
            var sWidth = element.canvas.width;
            var sHeight = element.canvas.height;
            
            var dWidth = element.lineWidth * scaleX;
            var dHeight = element.lineHeight * scaleY;

            if(element.sWidth != undefined)
                sWidth = element.sWidth;
            if(element.sHeight != undefined)
                sHeight = element.sHeight;
            if(element.dWidth != undefined)
                dWidth = element.dWidth * scaleX;
            if(element.dHeight != undefined)
                dHeight = element.dHeight * scaleY;

            var sx = 0;
            var sy= 0;
            var dx = sourcePoint.x;
            var dy = -(sourcePoint.y + dHeight);

            if(element.sx != undefined)
                sx = element.sx;
            if(element.sy != undefined)
                sy = element.sy;

            ctx.drawImage(element.canvas, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        }
    });
})();

CocosWidget.DrawNode = cc.DrawNode.extend({
    ctor:function(){
        this._super();
    },

    updateCanvasSource:function(sourceCanvas, sWidth, sHeight, dWidth, dHeight, sx, sy){
        var element = (this._buffer.length<=0)? new cc._DrawNodeElement(CocosWidget.DrawNode.TYPE_CANVAS) : this._buffer[0];

        element.canvas= sourceCanvas;
        element.lineWidth = sourceCanvas.width;
        element.lineHeight = sourceCanvas.height;

        element.sWidth = sWidth;
        element.sHeight = sHeight;

        element.dWidth = dWidth;
        element.dHeight = dHeight;

        element.sx = sx;
        element.sy = sy;

        if(this._buffer.length<=0)
            this._buffer.push(element);
    },

    _createRenderCmd: function(){
        return new CocosWidget.DrawNodeCanvas.CanvasRenderCmd(this);
    }
});

CocosWidget.DrawNode.TYPE_CANVAS=200;
