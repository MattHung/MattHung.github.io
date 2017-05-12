/**
 * Created by matt1201 on 2016/3/25.
 */
(function(){
    // CocosWidget.DrawNodeCanvas= function(){};

    CocosWidget.DrawNode.WebGLRenderCmd = function(renderableObject){
        cc.Node.WebGLRenderCmd.call(this, renderableObject);

        var mat4 = new cc.math.Matrix4(), mat = mat4.mat;
        mat[2] = mat[3] = mat[6] = mat[7] = mat[8] = mat[9] = mat[11] = mat[14] = 0.0;
        mat[10] = mat[15] = 1.0;
        this._transform4x4 = mat4;
        this._stackMatrix = new cc.math.Matrix4();
        this._shaderProgram = null;

        this._camera = null;
    };

    CocosWidget.DrawNode.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    CocosWidget.DrawNode.WebGLRenderCmd.prototype.constructor = CocosWidget.DrawNode.WebGLRenderCmd;
    cc.extend( CocosWidget.DrawNode.WebGLRenderCmd.prototype, {
        needDraw: function () {
            return this._needDraw = true;
        },

        rendering: function (ctx) {
            this._node._gl_render(ctx);
        }
    });
})();
