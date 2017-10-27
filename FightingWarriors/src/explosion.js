Explosion = cc.Sprite.extend({    
    ctor:function () {
        cc.Sprite.prototype.ctor.call(this);
        
        var animation = new cc.Animation();
        animation.setDelayPerUnit(0.06);

        var x = 0;
        var y = 0;
        for (var i = 1; i <= 36; i++){
            animation.addSpriteFrame(cc.SpriteFrame.create("/res/assets/Explosion4.png", cc.rect(x, y, 170, 170)));
            x+=170;

            if(i%6==0){
                y+=170;
                x=0;
            }
        }
        
        this.runAction(cc.repeatForever(cc.animate(animation)));
        this.schedule(this.destroy, 1.3, 0);
    },   

    destroy:function(){
        this.getParent().removeChild(this);
    }
});
