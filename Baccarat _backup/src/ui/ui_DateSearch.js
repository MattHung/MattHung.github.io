/**
 * Created by jeff_chien on 2017/1/24.
 */

var ui_DateSearch = gameLayer.extend({
    _Room_Width: null,
    _Room_Height: null,
    _deviation: 0,
    _distance: 0,
    _dateData: null,
    _date: null,
    scrollList: null,
    isScrollVisible: null,
    dataTxtAry: null,
    dropDownNode: null,

    getSelectDate: function () {
        return this._date;
    },

    ctor: function (roomNode, dateData) {
        this._super(roomNode);
        this._dateData = dateData;
        this.isScrollVisible = {};
        this.isScrollVisible.start = true;
        this.isScrollVisible.end = true;

        if (dateData.length <= 0)return;
        this.dataAry = new Array(dateData.length);

        this.initialNode();
        this.initialBtn();

        this.createScrollList(this.dropDownNode.startBtnSample, this.scrollList._start);
        this.createScrollList(this.dropDownNode.endBtnSample, this.scrollList._end);

        this.isScrollVisible.start = !this.isScrollVisible.start;
        this.scrollList._start.setVisible(this.isScrollVisible.start);
        this.isScrollVisible.end = !this.isScrollVisible.end;
        this.scrollList._end.setVisible(this.isScrollVisible.end);

        this.dropDownNode.startBtnSample.setPosition(10000, 10000);
        this.dropDownNode.endBtnSample.setPosition(10000, 10000);
    },

    initialNode: function () {
        this.scrollList = {};
        this.scrollList._start = this.getNode("Accumlated_Node/DropDown_Node/Start_Scroll");
        this.scrollList._end = this.getNode("Accumlated_Node/DropDown_Node/End_Scroll");

        this.dropDownNode = {};
        this.dropDownNode.startBtn = this.getNode("Accumlated_Node/DropDown_Node/Btn_StartDate");
        this.dropDownNode.endBtn = this.getNode("Accumlated_Node/DropDown_Node/Btn_EndDate");

        this.dropDownNode.startBtn.isClick = false;
        this.dropDownNode.endBtn.isClick = false;

        this.dropDownNode.startBtnSample = this.scrollList._start.getChildByName("Sample");
        this.dropDownNode.endBtnSample = this.scrollList._end.getChildByName("Sample");
    },

    createScrollList: function (sample, scroll) {
        this.dataTxtAry = [];
        var len = this.dataAry.length;

        this._deviation = scroll.height;
        this._distance = sample.getChildByName("Btn_Select").height;
        this._Room_Width = scroll.width;
        this._Room_Height = scroll.height;

        scroll.setDirection(ccui.ScrollView.DIR_VERTICAL);
        scroll.setVisible(true);
        scroll.setAnchorPoint(cc.p(0, 0));
        scroll.setContentSize(cc.size(this._Room_Width, this._Room_Height));
        scroll.setInnerContainerSize(cc.size(this._Room_Width, sample.getChildByName("Btn_Select").height));
        scroll.y = scroll.getPositionY();
        scroll.x = scroll.getPositionX();
        scroll.jumpToTop();

        for (var i = 0; i < this.dataAry.length; i++) {
            var point = new cc.Node();
            point.setName("Day" + (i + 1));
            scroll.addChild(point);

            for (var j = 0; j < sample.getChildren().length; j++) {
                if (sample.getChildren()[j] instanceof cc.Sprite) {
                    var _sp = cc.Sprite.create(sample.getChildren()[j].getTexture());
                    _sp.setPosition(sample.getChildren()[j].getPosition().x,
                        sample.getChildren()[j].getPosition().y + scroll.getInnerContainerSize().height - this._deviation - this._distance * i);
                    _sp.setName(sample.getChildren()[j].getName());
                    point.addChild(_sp);
                    continue;
                }

                var clone = sample.getChildren()[j].clone();
                clone.setPosition(sample.getChildren()[j].getPosition().x,
                    sample.getChildren()[j].getPosition().y + scroll.getInnerContainerSize().height - this._deviation - this._distance * i);
                clone.setName(sample.getChildren()[j].getName());
                point.addChild(clone);

                if (clone instanceof ccui.TextField) {
                    clone.setString("2016/12/" + (i + 1));
                }

                if(j == 0){
                    this.registerMouseEvent(clone,
                        function(){

                        }.bind(this),
                        function(){
                            this.dropDownNode.endBtn.getChildByName("txt_Date").setString(clone.getParent().getChildByName("txt_Date").getString());
                        }.bind(this),
                        function(){
                            clone.getParent().getChildByName("Pic_over").setVisible(true);
                        }.bind(this),
                        function(){
                            clone.getParent().getChildByName("Pic_over").setVisible(false);
                        }.bind(this));
                }
            }
        }
    },

    initialBtn: function () {
        this.registerMouseEvent(this.dropDownNode.startBtn,
            this.downBtn.bind(this),
            this.upBtn.bind(this),
            null,
            this.overBtn.bind(this));

        this.registerMouseEvent(this.dropDownNode.endBtn,
            this.downBtn.bind(this),
            this.upBtn.bind(this),
            null,
            this.overBtn.bind(this));
    },

    downBtn: function (sender) {
        sender._isClick = true;
        this.enterBtn(sender);
    },

    upBtn: function (sender) {
        switch (sender) {
            case this.dropDownNode.startBtn:
                this.isScrollVisible.start = !this.isScrollVisible.start;
                this.scrollList._start.setVisible(this.isScrollVisible.start);
                break;
            case this.dropDownNode.endBtn:
                this.isScrollVisible.end = !this.isScrollVisible.end;
                this.scrollList._end.setVisible(this.isScrollVisible.end);
                break;
        }

        sender._isClick = false;

    },

    enterBtn: function (sender, scroll) {
        if (sender._isClick) {
            return;
        }
    },

    overBtn: function (sender) {
        sender._isClick = false;
    },
});