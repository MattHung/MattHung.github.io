/**
 * Created by helen_pai on 2017/3/10.
 */

var ui_tip = gameLayer.extend({
    _room: null,
    tip: {},

    ctor: function (main_scene, room) {
        this._super(main_scene);
        this._room = room;
        this.tip.tip_node = this.getNode("Tip_Node");
        this.tip.txt_content = this.getNode("Tip_Node/Tip");
        this.tip.pic_bg = this.getNode("Tip_Node/Bg");
        this.tip.txt_content.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
        this.tipMove();
    },

    tipMove: function () {
        this.tip.tip_node.setVisible(false);
        var moveEvent = cc.EventListener.create({
            event: cc.EventListener.MOUSE,

            onMouseDown: function (event) {
            }.bind(this),

            onMouseMove: function (event) {
                var pos = event.getLocation();

                if (this.tip.tip_node.isVisible()) {
                    var tip_position = cc.p(pos.x - this.tip.pic_bg.width * this.tip.pic_bg.scaleX / 2, pos.y + 10);
                    if (tip_position.y + this.tip.pic_bg.height * this.tip.pic_bg.scaleY > 700)
                        tip_position.y = 700 - this.tip.pic_bg.height * this.tip.pic_bg.scaleY;
                    if (tip_position.x + this.tip.pic_bg.width * this.tip.pic_bg.scaleX > 1000)
                        tip_position.x = 1000 - this.tip.pic_bg.width * this.tip.pic_bg.scaleX;
                    this.tip.tip_node.setPosition(tip_position);
                }

                return false;
            }.bind(this),

            onMouseUp: function (event) {

            }.bind(this),
        });

        cc.eventManager.addListener(moveEvent, this.tip.tip_node);
    },

    setTipText: function (sender) {
        var context = sender.getName();
        switch (context) {
            case "Btn_BetHistory":
                context = language_manager.getInstance().getTextID(168);
                break;
            case "Btn_Video":
                context = language_manager.getInstance().getTextID(169);
                break;
            case "Btn_music":
                context = language_manager.getInstance().getTextID(170);
                break;
            case "Btn_vol_Control":
                context = language_manager.getInstance().getTextID(171);
                break;
            case "Btn_vol_off":
                context = language_manager.getInstance().getTextID(171);
                break;
            case "Btn_exit":
                context = language_manager.getInstance().getTextID(172);
                break;
            case "Btn_Music":
                context = language_manager.getInstance().getTextID(171);
                break;
        }

        this.tip.txt_content.setString(context);
        var txtLength = this.tip.txt_content.getAutoRenderSize().width;
        var picWidth = txtLength * 1.1 / this.tip.pic_bg.width; //1.1字體間距倍率
        this.tip.pic_bg.setScale(picWidth, 0.45);
        this.tip.pic_bg.setPosition(cc.p(-2, this.tip.txt_content.getPositionY() - this.tip.txt_content.getAutoRenderSize().height / 2));
        this.tip.tip_node.setVisible(true);
        this.tip.tip_node.setOpacity(0);
        var node_action = cc.fadeIn(0.5);
        this.tip.tip_node.runAction(node_action);
    },

    hideTip: function () {
        this.tip.tip_node.setVisible(false);
    }
});