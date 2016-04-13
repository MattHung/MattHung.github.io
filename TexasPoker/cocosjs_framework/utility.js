/**
 * Created by matt1201 on 2016/3/24.
 */

CocosWidget.Animation = ccui.Class.extend({
    frames:[],
    targetSprite:null,

    //targetSprite: target sprite for bind animation
    //res_path like "res/plist/counter/count_plist.plist", must declare in resource.js
    //res_name_prefix: like num_counter_{0}
    //fileExt: like "png"
    ctor:function(targetSprite, res_path, res_name_prefix, fileExt, frame_count){
        this.targetSprite = targetSprite;
        cc.spriteFrameCache.addSpriteFrames(res_path);

        var frames =[];

        if(!frame_count)
            frame_count=100;

        for(var i=0; i<=frame_count; i++)
        {
            //var frame_name = String.format("counter/num_counter_{0}.png",i);
            var frame_name = String.format("{0}{1}.{2}", res_name_prefix,i, fileExt);
            var sprite = cc.spriteFrameCache.getSpriteFrame(frame_name);

            if(sprite)
                this.frames.push(sprite);
        }

        var anim= new cc.Animation(frames, 0.5);
    },

    //targetSprite : target sprite node for play animation
    //delay : like "0.5"  seconds
    runForever : function(delay){
        var animation= new cc.Animation(this.frames, delay);
        this.targetSprite.runAction(cc.repeatForever(cc.animate(animation)));
    },

    //targetSprite : target sprite node for play animation
    //delay : like "0.5"  seconds
    runOnce : function(delay){
        var animation= new cc.Animation(this.frames, delay);
        this.targetSprite.runAction(cc.animate(animation));
    },

    stop : function(){
        this.targetSprite.stopAllActions();
    }
});
