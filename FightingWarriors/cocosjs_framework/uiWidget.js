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

