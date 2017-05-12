/**
 * Created by matt1201 on 2016/3/22.
 */

//x: position of x
//y: position of y
//mask_rect: (cc.Size) mask size
//size:(cc.Size) size of ListBox
CocosWidget.ListBox = ccui.ListView.extend({
    font_size:15,

    //size: (cc.Size)
    //mask_size: (cc.Size) content size
    ctor:function(x, y, size, mask_size){
        this._super();
        this.setDirection(ccui.ScrollView.DIR_VERTICAL);
        this.setTouchEnabled(true);
        this.setBounceEnabled(true);
        this.setClippingEnabled(true);

        this.setAnchorPoint(0, 1);
        this.setSize(new cc.Size(size.width, size.height));
        this.setContentSize(cc.size(mask_size.width, mask_size.height));
        this.x = x;
        this.y = y;

        this.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        this.setBackGroundColor(new cc.Color(154, 191, 223));
        this.setBackGroundColorOpacity(127);
        this.setGravity(ccui.ListView.GRAVITY_CENTER_VERTICAL);
        //this.setScrollBarAutoHideEnabled(false);
    },

    //size: integer
    setFontSize:function(size){
        this.font_size = size;
        var items = this.getItems();

        for(var i =0; i<items.length; i++){
            if(!(items[i] instanceof ccui.Text))
                continue;

            items[i].setFontSize(this.font_size);
        }
    },

    addTextItem:function(text){
        var uiText = new ccui.Text();
        uiText.setText(text);
        uiText.setAnchorPoint(new cc.Point(0, 0));
        uiText.setFontSize(this.font_size);
        this.pushBackCustomItem(uiText);
        this.refreshView();
    }
});

CocosWidget.TextField = ccui.Layout.extend({
    _text_richText_context : null,
    _content_font_size:15,

    ctor:function(){        
        ccui.Layout.prototype.ctor.call(this);

        this._text_richText_context = new ccui.RichText();  
        this._text_richText_context.setAnchorPoint(cc.p(0.5, 0.5));  
        this._text_richText_context.setPosition(cc.p(0, 0));
        this._text_richText_context.ignoreContentAdaptWithSize(false);
        this._text_richText_context.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
        this.addChild(this._text_richText_context);
    },

    setFontSize:function(size){
        this._content_font_size =size;
    },

    setSize:function(w, h){
        this._text_richText_context.width = w;
        this._text_richText_context.height = h;
    },

    setString:function(text){
        this._text_richText_context._richElements = [];

        if(text.length > 0){
            var strs = text.split("@");

            for(var i=0; i<strs.length; i++){
                var color_text = strs[i];
                var str_text = "";

                if(color_text.substring(0, 1) !="#"){
                    color_text = "#FFFFFF";
                    str_text = strs[i];
                }else{
                    color_text = color_text.substring(0, 7);
                    str_text = strs[i].substring(7, strs[i].length);
                }

                var r = color_text.substring(1, 3);
                var g = color_text.substring(3, 5);
                var b = color_text.substring(5, 7);

                r = parseInt(r, 16);
                g = parseInt(g, 16);
                b = parseInt(b, 16);

                var tag = i + 1;
                var element = new ccui.RichElementText(tag, new cc.Color(r, g, b), 255, str_text, "Arial", this._content_font_size);
                this._text_richText_context.pushBackElement(element);
            }
        }

        this._text_richText_context._formatTextDirty = true;
    },   


});

