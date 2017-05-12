/**
 * Created by jeff_chien on 2017/2/15.
 */

var uiScrollBar = gameLayer.extend({
    PosY_Min: null,
    PosY_Max: null,
    barScaleY: null,
    isTouchScrollBar: false,
    innerScrollView: null,
    outerScrollView: null,
    barTexture: null,

    ctor: function (mainNode, scrollView_outer, scrollView_inner, barBG, barSlider) {
        this._super(mainNode);
        this.innerScrollView = scrollView_inner;
        this.outerScrollView = scrollView_outer;

        this.barTexture = {};
        this.barTexture.bg = barBG;
        this.barTexture.slider = barSlider;

        this.barTexture.slider.setPosition(this.barTexture.slider.getPositionX(), this.barTexture.bg.getPositionY() + this.barTexture.bg.height * this.barTexture.bg.getScaleY() / 2 - this.barTexture.slider.height * this.barScaleY / 2);

        this.settingEvent();
        this.updateSlider();
        this.update();
    },

    settingEvent: function () {
        this.registerMouseEvent(this.barTexture.slider,
            function (sender) {
                this.isTouchScrollBar = true;
            }.bind(this)
        );

        var moveEvent = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            posM: null,

            onMouseDown: function (event) {
                var pos = event.getLocation();
                var target = event.getCurrentTarget();
                this.posM = pos;

            }.bind(this),

            onMouseMove: function (event) {
                var pos = event.getLocation();
                if (this.isTouchScrollBar) {
                    var target = event.getCurrentTarget();
                    this.barTexture.slider.setPositionY(this.barTexture.slider.getPositionY() + pos.y - this.posM.y);
                    this.posM = pos;
                }
                return false;
            }.bind(this),

            onMouseUp: function (event) {
                var pos = event.getLocation();
                var target = event.getCurrentTarget();
                this.isTouchScrollBar = false;
            }.bind(this),
        });

        cc.eventManager.addListener(moveEvent, this.barTexture.slider);
    },

    update: function (dt) {
        this.setPosYLimit();
        // this.updateSlider();

        if (this.isTouchScrollBar) {
            if (this.PosY_Max - this.PosY_Min == 0)return;
            var posY = 0 - (this.innerScrollView.getInnerContainerSize().height - this.innerScrollView.height) * (this.barTexture.slider.getPositionY() - this.PosY_Min) / (this.PosY_Max - this.PosY_Min);
            this.innerScrollView.setInnerContainerPosition(new cc.Point(this.innerScrollView.getInnerContainerPosition().x, posY));
        } else {
            if (this.innerScrollView.getInnerContainerSize().height - this.innerScrollView.height == 0)return;
            var posY = this.PosY_Min + (this.PosY_Max - this.PosY_Min) * Math.abs(this.innerScrollView.getInnerContainerPosition().y) / (this.innerScrollView.getInnerContainerSize().height - this.innerScrollView.height);
            this.barTexture.slider.setPositionY(this.checkPosY(posY));
        }
    },

    updateSlider: function () {
        this.barScaleY = this.innerScrollView.height / this.innerScrollView.getInnerContainerSize().height * this.barTexture.bg.height * this.barTexture.bg.getScaleY() / this.barTexture.slider.height;
        this.barTexture.slider.setScaleY(this.barScaleY);
        if (this.barScaleY >= this.barTexture.bg.height * this.barTexture.bg.getScaleY() / this.barTexture.slider.height) {
            this.barTexture.bg.setVisible(false);
            this.barTexture.slider.setVisible(false);
        }else{
            this.barTexture.bg.setVisible(true);
            this.barTexture.slider.setVisible(true);
        }
    },

    setPosYLimit: function () {
        this.PosY_Max = this.barTexture.bg.getPositionY() + this.barTexture.bg.height * this.barTexture.bg.getScaleY() / 2 - this.barTexture.slider.height * this.barScaleY / 2;
        if (this.barTexture.slider.getPositionY() >= this.PosY_Max) {
            this.barTexture.slider.setPositionY(this.PosY_Max);
        }

        this.PosY_Min = this.barTexture.bg.getPositionY() - this.barTexture.bg.height * this.barTexture.bg.getScaleY() / 2 + this.barTexture.slider.height * this.barScaleY / 2;
        if (this.barTexture.slider.getPositionY() <= this.PosY_Min) {
            this.barTexture.slider.setPositionY(this.PosY_Min);
        }
    },

    checkPosY: function (y) {
        if (y > this.PosY_Max)return this.PosY_Max;
        if (y < this.PosY_Min)return this.PosY_Min;
        return y;
    }
});