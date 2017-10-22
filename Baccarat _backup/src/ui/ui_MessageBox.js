/**
 * Created by nora_wang on 2016/12/29.
 */

var ui_MessageBoxPanel = gameLayer.extend({
     _hold_secs:10,
    _title_font_size:25,
    _content_font_size:15,

    _confirm_secs: -1,
    _ui_bg: null,
    _mask_bg: null,
    _btn_confirm: null,

    _text_title: null,
    _text_count_down: null,
    _text_controls: null,
    ctor: function () {
        this._super(this);
        this.setLocalZOrder(20);
        this.setAnchorPoint(cc.p(0.5, 0.5));

        var winSize = cc.director.getWinSize();        
        this._ui_bg = new cc.Sprite(msg_res.bg);
        this._ui_bg.setPosition(0, 0);
        this.registerMouseEvent(this._ui_bg, function () {

        });

        this._mask_bg = new cc.Sprite(msg_res.mask_bg);
        this._mask_bg.setPosition(0, 0);
        this.registerMouseEvent(this._mask_bg, function () {

        });

        this._text_controls = [];
        this.setPosition(winSize.width / 2, winSize.height / 2);
        this.addChild(this._ui_bg, 0);
        this.addChild(this._mask_bg, -1);
        this.initialLableText();
        this.initialButton();        
    },

    update: function (dt) {
        var text = language_manager.getInstance().getTextID(90);

        if(this._confirm_secs > 0)
            text = text + "(" + this._confirm_secs .toString() + ")";
        this._text_count_down.setString(text);
    },

    checkAddToScene:function(scene){
        var current_scene = scene;

        var scene_children = current_scene.getChildren();
        for (var i = 0; i < scene_children.length; i++)
            if (scene_children[i] == this)
                return;

        this.removeFromParent();
        current_scene.addChild(this);
        this.setVisible(false);
    },

    initialButton:function(){
        this._btn_confirm = new ccui.Button();
        this._btn_confirm.setTouchEnabled(true);
        this._btn_confirm.loadTextures(msg_res.mouse_up, msg_res.mouse_down);

        this._btn_confirm.setAnchorPoint(cc.p(0.5, 0.5));
        this._btn_confirm.setPosition(0, -88);

        this.registerMouseEvent(this._btn_confirm,
            function (sender) {
                sender.getChildByName(sender.getName() + "_over").setVisible(false);
            }.bind(this),
            function (sender) {
                this.setVisible(false);
                if (this.confirm_callback)
                    this.confirm_callback.call(this);
            }.bind(this),
            function (sender) {
                this.onChangSprite(msg_res.red_mouse_over, sender);
            }.bind(this),
            function (sender) {
                sender.removeAllChildren();
            }.bind(this));

        this._text_count_down = new cc.LabelTTF("","Msjh", this._content_font_size, cc.TEXT_ALIGNMENT_CENTER, cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
        this._text_count_down.setColor(new cc.Color(255, 255, 255));
        this._text_count_down.setAnchorPoint(cc.p(0.5, 0.5));
        this._text_count_down.setPosition(cc.p(0, -87));

        this.addChild(this._btn_confirm, 1);
        this.addChild(this._text_count_down,1);
    },

    initialLableText:function(){
        this._text_title = new cc.LabelTTF("","Msjh", this._title_font_size, cc.TEXT_ALIGNMENT_CENTER, cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
        this._text_title.setColor(new cc.Color(241, 241, 195));
        this._text_title.setAnchorPoint(cc.p(0.5, 0.5));
        this._text_title.setPosition(cc.p(2, 87));

        this.addChild(this._text_title);
    },

    clear:function(){
        this.showContext("");
    },

    // this.showText("@#FF0000title", "已成功報名 @#FBBF00百家樂-100元場@#FFFFFF(比賽場號:@#FBBF007223@#FFFFFF) 因比賽未開始, 我們將在比賽前1分鐘再次提醒您.");
    showText:function(title, text, countDown){
        this.clear();

        this.showTitle(title);
        this.showContext(text);
        this.setVisible(true);

        if(!countDown)
            return;
        this._confirm_secs = this._hold_secs;
        this.unschedule(this.countDown);
        cc.director.getScheduler().schedule(this.countDown, this, 1, this._hold_secs +1, 0, false, 0);
    },

    showPureText:function(text){
        this.showText("", text);
    },

    showTitleTextByID:function(title_id, text_id){        
        var title = language_manager.getInstance().getTextID(title_id);
        var text = language_manager.getInstance().getTextID(text_id);
        this.showText(title, text);
    },    

    showTextByID:function(text_id){
        var text = language_manager.getInstance().getTextID(text_id);
        this.showText("", text);
    },    

    countDown:function(){
        this._confirm_secs--;

        if(this._confirm_secs < 0)
            this.setVisible(false);
    },

    showTitle:function(text){
        if(text.substring(0, 1) =="@")
            text = text.substring(1, text.length);

        var color_text = text;
        var str_text = "";

        if(color_text.substring(0, 1) !="#"){
            color_text = "#F1F1C3";
            str_text = text;
        }else{
            color_text = color_text.substring(0, 7);
            str_text = text.substring(7, text.length);
        }

        var r = color_text.substring(1, 3);
        var g = color_text.substring(3, 5);
        var b = color_text.substring(5, 7);

        r = parseInt(r, 16);
        g = parseInt(g, 16);
        b = parseInt(b, 16);

        this._text_title.setColor(new cc.Color(r, g, b));
        this._text_title.setString(str_text);
    },

    setVisible: function (value) {
        if (!value) {
            CocosWidget.eventRegister.getInstance().removeTargetEvent(this, this._ui_bg);
            CocosWidget.eventRegister.getInstance().removeTargetEvent(this, this._mask_bg);
            ui_MessageBox.getInstance().removePanel(this);
        }
    },

    showContext:function(text){
        for(var i=0; i<this._text_controls.length; i++)
            this._text_controls[i].removeFromParentAndCleanup(true);

        this._text_controls = [];

        if(text=="")
            return;

        var text_lines = text.split("\n");

        var line_height = 20;
        var lines_height = text_lines.length * line_height;

        var left = 0;
        var top = lines_height / 2;        
        top+=7;

        for(var i=0; i<text_lines.length; i++){
            var textField  = new CocosWidget.TextField();
            textField.setAnchorPoint(cc.p(0.5, 0.5));  
            textField.setFontSize(this._content_font_size);
            textField.setPosition(cc.p(left, top));            
            textField.setSize(360, line_height);
            textField._text_richText_context.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            textField.setString(text_lines[i]);
            this.addChild(textField);

            top -= line_height;
        }
    },   

    onChangSprite: function (sprite_path, parent_node, z_order) {
        var hoverSprite = cc.Sprite.create(sprite_path);
        parent_node.addChild(hoverSprite, z_order);
        hoverSprite.setPosition(cc.p(parent_node.width / 2 * parent_node.getScaleX(), parent_node.height / 2 * parent_node.getScaleY()));
        hoverSprite.setName(parent_node.getName() + "_" + sprite_path.split("_")[sprite_path.split("_").length - 1].split(".")[0]);
    },

    addConfirmCallback: function (callback_fun) {
        this.confirm_callback = callback_fun;
    }
});

var ui_MessageBox = gameLayer.extend({
    _panels: null,

    _disposed_panels:null,
   
    ctor:function(){        
        var root_node = new cc.Node();
        this._super(root_node);

        this.setAnchorPoint(cc.p(0.5, 0.5));

        this._panels = [];
        this._disposed_panels = [];
    },

    update: function (dt) {
        for(var i=0; i<this._panels.length; i++)
            this._panels[i].update(dt);

        for (var i = 0; i < this._disposed_panels.length; i++) {
            this._disposed_panels[i].removeFromParent();

            if(this._panels.indexOf(this._disposed_panels[i]) >= 0)
                this._panels.splice(this._panels.indexOf(this._disposed_panels[i]), 1);
        }

        this._disposed_panels = [];

        if(this._panels.length <= 0)
            this.setVisible(false);
        else
            this.setVisible(true);
    },

    checkAddToScene:function(scene){
        var current_scene = scene;

        var scene_children = current_scene.getChildren();
        for(var i=0; i<scene_children.length ; i++)
        if(scene_children[i] == this.root_node)
            return;

        this.root_node.removeFromParent();
        current_scene.addChild(this.root_node);
    },

    removePanel: function (panel) {

        this._disposed_panels.push(panel);
        var root_node = null;
        switch (CURRENT_SCENE) {
            case SceneEnum.Room:
                root_node = GameManager.getInstance().Node_SceneRoot;
                root_node.removeChild(panel);
                break;
            case SceneEnum.RoomList:
                root_node = GameManager.getInstance().Node_RoomSceneRoot;
                root_node.removeChild(panel);
                GameManager.getInstance().SignUpRoom.setMsgOpen(false);
                break;
        }
    },

    addPanel:function(){
        var panel = new ui_MessageBoxPanel();
        var root_node = null;
        switch (CURRENT_SCENE) {
            case SceneEnum.Room:
                root_node = GameManager.getInstance().Node_SceneRoot;
                break;
            case SceneEnum.RoomList:
                root_node = GameManager.getInstance().Node_RoomSceneRoot;
                GameManager.getInstance().SignUpRoom.setMsgOpen(true);
                break;
            default:
                root_node = this.root_node;
        }
        root_node.addChild(panel);
        this._panels.push(panel);
        return panel;
    },

    // this.showText("@#FF0000title", "已成功報名 @#FBBF00百家樂-100元場@#FFFFFF(比賽場號:@#FBBF007223@#FFFFFF) 因比賽未開始, 我們將在比賽前1分鐘再次提醒您.");
    showText:function(title, text, countDown){
        var panel = this.addPanel();
        panel.showText(title, text, countDown);
        return panel;
    },

    showPureText:function(text){
        var panel = this.addPanel();
        panel.showPureText(text);
        return panel;
    },

    showTitleTextByID:function(title_id, text_id){        
        var panel = this.addPanel();
        panel.showTitleTextByID(title_id, text_id);
        return panel;
    },    

    showTextByID:function(text_id){
        var panel = this.addPanel();
        panel.showTextByID(text_id);
        return panel;
    },      

    showTitle:function(text){
        var panel = this.addPanel();
        panel.showTitle(text);        
        return panel;
    },

    showContext:function(text){
        var panel = this.addPanel();
        panel.showContext(text);
        return panel;
    },   
});

ui_MessageBox._instance=null;

ui_MessageBox.getInstance = function(){

    if(ui_MessageBox._instance==null)
        ui_MessageBox._instance = new ui_MessageBox();

    return ui_MessageBox._instance;
};