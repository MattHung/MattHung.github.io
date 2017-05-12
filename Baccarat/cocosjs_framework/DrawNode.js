/**
 * Created by matt1201 on 2016/3/25.
 */

CocosWidget.DrawNode = cc.DrawNode.extend({
    ctor:function(){
        this._super();
    },

    updateCanvasSource:function(sourceCanvas, frameData,  width, height){
        var element = {};

        if(cc._renderType === cc.game.RENDER_TYPE_CANVAS)
            element.type =  CocosWidget.DrawNode.TYPE_CANVAS;

        element.lineWidth = width;
        element.lineHeight = height;

        if(cc._renderType === cc.game.RENDER_TYPE_CANVAS){
            element.canvas= sourceCanvas;
            
            if(this._buffer.length<=0)
                this._buffer.push(element);
            else
                this._buffer[0]=element;
        }else{
            if(!frameData)
                return;

            this.frame = frameData;
            this._buffer = element;

            if(!this.Renderer){
              this.Renderer = new YUVCanvas({
                canvas: cc._renderContext.canvas,
                contextOptions: null,        
                width: width,
                height: height
              });  

              this.Renderer.initial();
            }
        }
    },

    _createRenderCmd: function(){
        if(cc._renderType === cc.game.RENDER_TYPE_CANVAS)
            return new CocosWidget.DrawNode.CanvasRenderCmd(this);
        else
            return new CocosWidget.DrawNode.WebGLRenderCmd(this);
    },

    _gl_render:function(ctx){
        if(!this.frame)       
            return;

        ctx.bindBuffer(gl.ARRAY_BUFFER, null);

        this.Renderer.initial();
        this.Renderer.setSize(this._buffer.lineWidth, this._buffer.lineHeight);
        this.Renderer.drawNextOuptutPictureGL(this.frame);        
        gl.useProgram(cc._currentShaderProgram);
    },

    clear:function(){
        this.frame =null;
    }
});

CocosWidget.DrawNode.TYPE_CANVAS=200;
