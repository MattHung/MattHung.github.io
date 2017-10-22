/**
 * Created by helen_pai on 2017/1/23.
 */

var ui_Accumulated = gameLayer.extend({
    LAYER_Z_ORDER: 2,
    CUT_NAME: 3,
    signRoom: null,
    joinClassify: {},
    listBox: {},
    pageInfo: {},
    participatorList: [],
    listTitle: {},
    _userName: "",
    _Room_Width: null,
    _Room_Height: null,
    _distance: 0,
    _dateData: null,
    _dateSearch: null,
    _Lang_txt: [],
    _LangTitle: null,
    scrollList: null,
    isScrollVisible: null,
    dropDownNode: null,

    ctor: function (main_node, sign_room) {
        this._super(main_node);
        this.signRoom = sign_room;
        this._userName = AccountCenter.getInstance().getUserName();
        this.setLocalZOrder(this.LAYER_Z_ORDER);
        this.initListBox();
        this.initTitle();
        this.eventBuild();

        this.isScrollVisible = {};
        this.isScrollVisible.start = false;
        this.isScrollVisible.end = false;
        this.settingSearchScroll();
    },

    initListBox: function () {
        this.participatorList = {};
        this.joinClassify = {};
        this.joinClassify["Today"] = 0;
        this.joinClassify["Total"] = 1;
        this.listTitle.UsetName = 0;
        this.listTitle.GameType = 1;
        this.listTitle.Session = 2;
        this.listTitle.SognUpTime = 3;

        this.listBox = {};
        this.listBox.outPos = new cc.Point(2000, 2000);
        this.listBox.currentData = this.joinClassify["Today"];
        this.listBox.boxNode = this.getNode("Accumlated_Node");
        this.listBox.mask = this.getNode("Accumlated_Node/black_alpha_70");
        this.listBox.bgBox = this.getNode("Accumlated_Node/black_alpha_70/bg");
        this.listBox.listView = this.getNode("Accumlated_Node/ConText_Scroll");
        this.listBox.txtNoRecord = this.getNode("Accumlated_Node/Language_Node/NoMemory");
        this.listBox.txtLoad = this.getNode("Accumlated_Node/Language_Node/Wait");
        this.listBox.posMessage = this.getNode("Accumlated_Node/Result_Node/Text_Position_Node");
        this.listBox.listHeight = 480;
        this.listBox.listModel = this.getNode("Accumlated_Node/Scroll_Sample");
        this.listBox.lineSpriteModel = this.getNode("Accumlated_Node/Scroll_Sample/line");
        this.listBox.btnClose = this.getNode("Accumlated_Node/Btn_Close");
        this.listBox.picClose = this.getNode("Accumlated_Node/Btn_Over_Node/Btn_Close_over");
        this.listBox.chooseDateBar = this.getNode("Accumlated_Node/Search_Node");
        this.listBox.listView.setTouchEnabled(false);
        this.listBox.listView.setScrollBarEnabled(false);
        this.listBox.boxNode.setVisible(false);

        this.listBox.pageControl = {};
        this.listBox.pageControl["NowPage"] = this.getNode("Accumlated_Node/Result_Node/NowPage");
        this.listBox.pageControl["TotalPage"] = this.getNode("Accumlated_Node/Result_Node/TotalPage");
        this.listBox.pageControl["TotalCount"] = this.getNode("Accumlated_Node/Result_Node/TotalNum");

        this.listBox.pageControl["Next"] = this.getNode("Accumlated_Node/Arrow_Node/Btn_Next");
        this.listBox.pageControl["Forward"] = this.getNode("Accumlated_Node/Arrow_Node/Btn_Forward");
        this.listBox.pageControl["Top"] = this.getNode("Accumlated_Node/Arrow_Node/Btn_Top");
        this.listBox.pageControl["Last"] = this.getNode("Accumlated_Node/Arrow_Node/Btn_Last");

        this.listBox.pageControl["Top_over"] = this.getNode("Accumlated_Node/Btn_Over_Node/Btn_Top_over");
        this.listBox.pageControl["Next_over"] = this.getNode("Accumlated_Node/Btn_Over_Node/Btn_Next_over");
        this.listBox.pageControl["Last_over"] = this.getNode("Accumlated_Node/Btn_Over_Node/Btn_Last_over");
        this.listBox.pageControl["Forward_over"] = this.getNode("Accumlated_Node/Btn_Over_Node/Btn_Forward_over");

        this.listBox.listChild = {};
        for (var i = 0; i < this.listBox.listModel.getChildrenCount(); i++) {
            var nodeName = this.listBox.listModel.children[i].getName();
            this.listBox.listChild[nodeName] = this.listBox.listModel.children[i];
        }

        this.pageInfo = {};
        this.pageInfo.hasPage = {};
        this.pageInfo.totalDataCount = 30;
        this.pageInfo.eachPageCount = 20;
        this.pageInfo.currentPage = 1;
        this.pageInfo.startPage = 1;
        this.pageInfo.endPage = Math.ceil(this.pageInfo.totalDataCount / this.pageInfo.eachPageCount);
        this.pageInfo.itemMargin = 1;
    },


    initTitle: function () {
        this._Lang_txt = [];
        this._LangTitle = {};
        var ChildrenCount = this.getNode("Accumlated_Node/Language_Node");
        for (var i = 0; i < ChildrenCount.getChildrenCount(); i++) {

            this._Lang_txt.push(ChildrenCount.children);

        }
        this._LangTitle.AccumlatedNum = this.getNode("Accumlated_Node/Language_Node/AccumlatedNum");
        this._LangTitle.Time = this.getNode("Accumlated_Node/Search_Node/Time");
        this._LangTitle.To = this.getNode("Accumlated_Node/Search_Node/To");
        this._LangTitle.Search = this.getNode("Accumlated_Node/Search_Node/Btn_Search/Search");
        this._LangTitle.Session = this.getNode("Accumlated_Node/Language_Node/Session");
        this._LangTitle.Session.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this._LangTitle.AccumlatedNum.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this._LangTitle.Search.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this._LangTitle.To.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
    },


    setCurrentList: function (data_name) {
        this.listBox.currentData = this.joinClassify[data_name];
        this.pageInfo.currentPage = 1;
        this.getParticipateData();
        this.updateList();
    },

    updateList: function () {
        this.modifyPageCount();
        this.showBtnPage();
        this.listBox.listView.removeAllChildren();
        if (this.pageInfo.currentPage == 0) {
            var pos_msg = this.listBox.posMessage.convertToWorldSpace(new cc.Point(0, 0));
            this.listBox.txtNoRecord.setPosition(pos_msg);
            return;
        }
        if (this.pageInfo.currentPage != 0)
            this.listBox.txtNoRecord.setPosition(this.listBox.outPos);

        var startIndex = (this.pageInfo.currentPage - 1) * this.pageInfo.eachPageCount;
        var endIndex = this.pageInfo.currentPage * this.pageInfo.eachPageCount;

        for (var i = startIndex; i < endIndex; i++) {
            var cloneList = this.listBox.listModel.clone();

            if (i >= this.pageInfo.totalDataCount) {
                for (var j = 0; j < cloneList.getChildrenCount(); j++)
                    cloneList.children[j].setString(" ");
            }

            if (i < this.pageInfo.totalDataCount) {
                var userName = this.participatorList[i].userName;
                if (userName != this._userName)
                    userName = "***" + userName.substr(userName.length - this.CUT_NAME);
                cloneList.children[this.listTitle.UsetName].setString(userName);
                cloneList.children[this.listTitle.GameType].setString(String.format(language_manager.getInstance().getTextID(160), this.participatorList[i].gameName));
                cloneList.children[this.listTitle.Session].setString(this.participatorList[i].gameSession);
                cloneList.children[this.listTitle.SognUpTime].setString(this.participatorList[i].gameTime);

                cloneList.children[this.listTitle.UsetName].setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
                cloneList.children[this.listTitle.GameType].setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
                cloneList.children[this.listTitle.Session].setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
                cloneList.children[this.listTitle.SognUpTime].setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            }

            var lastIndex = i % this.pageInfo.eachPageCount;
            if (lastIndex != this.pageInfo.eachPageCount - 1) {
                var lineSprite = new cc.Sprite.create(this.listBox.lineSpriteModel.getTexture().url);
                cloneList.addChild(lineSprite);
                lineSprite.setPosition(this.listBox.lineSpriteModel.getPositionX(), this.listBox.lineSpriteModel.getPositionY());
                lineSprite.setName(this.listBox.listModel.children[4].getName() + "_" + i);
            }

            this.listBox.listView.insertCustomItem(cloneList, i);

            this.listBox.listView.setItemsMargin(this.pageInfo.itemMargin);
            this.listBox.listView.setInnerContainerSize(cc.size(this.listBox.listView.getContentSize().width, this.listBox.listHeight));
            this.listBox.listView.forceDoLayout();
            this.listBox.listView.refreshView();
        }
    },

    getParticipateData: function () {
        var list = this.signRoom.getParticipatorList();
        this.participatorList = [];
        switch (this.listBox.currentData) {
            case this.joinClassify["Today"]:
                this.listBox.chooseDateBar.setVisible(false);
                list.Today == null ? this.participatorList = [] : this.participatorList = list.Today;
                this.pageInfo.totalDataCount = this.participatorList.length;
                this.pageInfo.eachPageCount = 20;
                break;

            case  this.joinClassify["Total"]:
                this.listBox.chooseDateBar.setVisible(true);
                list.Total == null ? this.participatorList = [] : this.participatorList = list.Total;
                this.pageInfo.totalDataCount = this.participatorList.length;
                this.pageInfo.eachPageCount = 20;

                break;
        }
    },

    closeBox: function () {
        this.listBox.boxNode.setVisible(false);
    },

    downClose: function (sender) {
        var pic = sender.getChildByName(sender.getName() + "_over");
        // pic.setVisible(false);
    },

    enterClose: function (sender) {
        this.onChangeSprite(this.listBox.picClose.getTexture().url, sender);
    },

    overClose: function (sender) {
        sender.removeChild(sender.getChildByName(sender.getName() + "_over"));
    },

    modifyPageCount: function () {
        this.pageInfo.endPage = Math.ceil(this.pageInfo.totalDataCount / this.pageInfo.eachPageCount);

        if (this.pageInfo.currentPage <= this.pageInfo.startPage)
            this.pageInfo.currentPage = this.pageInfo.startPage;
        if (this.pageInfo.currentPage >= this.pageInfo.endPage)
            this.pageInfo.currentPage = this.pageInfo.endPage;

        this.listBox.pageControl["TotalPage"].setString(String.format("/ {0}", this.pageInfo.endPage));
        this.listBox.pageControl["TotalCount"].setString(String.format(language_manager.getInstance().getTextID(138), this.pageInfo.totalDataCount));
        this.listBox.pageControl["NowPage"].setString(this.pageInfo.currentPage.toString());
        this.listBox.pageControl["NowPage"].setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
    },

    enterPage: function (sender) {
        if (!sender.isBright())
            return;
        var spriteName = sender.getName().split("_")[sender.getName().split("_").length - 1] + "_over";
        this.onChangeSprite(this.listBox.pageControl[spriteName].getTexture().url, sender);
    },

    overPage: function (sender) {
        if (!sender.isBright())
            return;
        sender.removeChild(sender.getChildByName(sender.getName() + "_over"));
    },

    mouseDownPage: function (sender) {
        if (!sender.isBright())
            return;
        sender.removeChild(sender.getChildByName(sender.getName() + "_over"));
    },

    mouseUpPage: function (sender) {
        if (!sender.isBright())
            return;
        if (sender == this.listBox.pageControl["Next"]) {
            this.pageInfo.currentPage++;
        }
        if (sender == this.listBox.pageControl["Forward"])
            this.pageInfo.currentPage--;

        this.updateList();
    },

    mouseUpLimitPage: function (sender) {
        if (!sender.isBright())
            return;
        if (sender == this.listBox.pageControl["Top"])
            this.pageInfo.currentPage = this.pageInfo.startPage;
        if (sender == this.listBox.pageControl["Last"])
            this.pageInfo.currentPage = this.pageInfo.endPage;

        this.updateList();
    },

    onChangeSprite: function (sprite_path, parent_node, z_order) {
        var hoverSprite = cc.Sprite.create(sprite_path);
        parent_node.addChild(hoverSprite, z_order);
        hoverSprite.setPosition(cc.p(parent_node.width / 2 * parent_node.getScaleX(), parent_node.height / 2 * parent_node.getScaleY()));
        hoverSprite.setName(parent_node.getName() + "_" + sprite_path.split("_")[sprite_path.split("_").length - 1].split(".")[0]);
    },

    showBtnPage: function () {
        var hasNext = true;
        var hasPrevious = true;

        if (this.pageInfo.currentPage == this.pageInfo.endPage) {
            hasNext = false;
            hasPrevious = true;
        }

        if (this.pageInfo.currentPage == this.pageInfo.startPage) {
            hasNext = true;
            hasPrevious = false;
        }

        if (this.pageInfo.startPage == this.pageInfo.endPage) {
            hasNext = false;
            hasPrevious = false;
        }

        if (this.pageInfo.currentPage == 0) {
            hasNext = false;
            hasPrevious = false;
        }

        this.listBox.pageControl["Next"].setBright(hasNext);
        this.listBox.pageControl["Last"].setBright(hasNext);
        this.listBox.pageControl["Forward"].setBright(hasPrevious);
        this.listBox.pageControl["Top"].setBright(hasPrevious);
    },

    eventBuild: function () {
        this.registerMouseEvent(this.listBox.mask, function () {
        }, null, function () {
        }.bind(this));
        this.registerMouseEvent(this.listBox.btnClose, this.downClose.bind(this), this.closeBox.bind(this), this.enterClose.bind(this), this.overClose.bind(this));
        this.registerMouseEvent(this.listBox.pageControl["Next"], this.mouseDownPage.bind(this), this.mouseUpPage.bind(this), this.enterPage.bind(this), this.overPage.bind(this));
        this.registerMouseEvent(this.listBox.pageControl["Forward"], this.mouseDownPage.bind(this), this.mouseUpPage.bind(this), this.enterPage.bind(this), this.overPage.bind(this));
        this.registerMouseEvent(this.listBox.pageControl["Top"], this.mouseDownPage.bind(this), this.mouseUpLimitPage.bind(this), this.enterPage.bind(this), this.overPage.bind(this));
        this.registerMouseEvent(this.listBox.pageControl["Last"], this.mouseDownPage.bind(this), this.mouseUpLimitPage.bind(this), this.enterPage.bind(this), this.overPage.bind(this));
    },

    update: function (dt) {
        this._LangTitle.Time.setString(language_manager.getInstance().getTextID(129));
        this._LangTitle.To.setString(language_manager.getInstance().getTextID(130));
        this._LangTitle.Search.setString(language_manager.getInstance().getTextID(70));
        this._LangTitle.Session.setString(language_manager.getInstance().getTextID(159));

        var count = 130;
        for (var i = 2; i < this._Lang_txt.length; i++) {

            count += 1;

            this._Lang_txt[i][i].setString(language_manager.getInstance().getTextID(count));
            this._Lang_txt[i][i].setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            this._Lang_txt[6][6].setString(language_manager.getInstance().getTextID(135) + " " + "20");//每頁顯示:20
        }
        if (this.listBox.currentData == this.joinClassify["Today"]) {
            this._LangTitle.AccumlatedNum.setString(language_manager.getInstance().getTextID(128));
        }
        if (this.listBox.currentData == this.joinClassify["Total"]) {
            this._LangTitle.AccumlatedNum.setString(language_manager.getInstance().getTextID(139));
        }
    },

    settingSearchScroll: function (dataObj) {
        this._dateData = dataObj;
        this.dataAry = [];

        if (dataObj != null)
            this.dataAry = new Array(dataObj.length);

        this.initialNode();
        this.scrollList._start._protectedChildren[0].getChildren().splice(1, this.scrollList._start._protectedChildren[0].getChildren().length - 1);
        this.scrollList._start._protectedChildren[1].getChildren().splice(1, this.scrollList._start._protectedChildren[1].getChildren().length - 1);
        this.createScrollList(this.dropDownNode.startBtnSample, this.scrollList._start, dataObj);
        this.scrollList._end._protectedChildren[0].getChildren().splice(1, this.scrollList._end._protectedChildren[0].getChildren().length - 1);
        this.scrollList._end._protectedChildren[1].getChildren().splice(1, this.scrollList._end._protectedChildren[1].getChildren().length - 1);
        this.createScrollList(this.dropDownNode.endBtnSample, this.scrollList._end, dataObj);
        this.initialBtn();
	
        this.scrollList._start.setVisible(this.isScrollVisible.start);
        this.scrollList._end.setVisible(this.isScrollVisible.end);

        this.dropDownNode.startBtnSample.setVisible(false);
        this.dropDownNode.endBtnSample.setVisible(false);
    },

    initialNode: function () {
        this.scrollList = {};
        this.scrollList._start = this.getNode("Accumlated_Node/DropDown_Node/Start_Scroll");
        this.scrollList._end = this.getNode("Accumlated_Node/DropDown_Node/End_Scroll");

        this.dropDownNode = {};
        this.dropDownNode.startBtn = this.getNode("Accumlated_Node/Search_Node/DropDown_Node/Btn_StartDate");
        this.dropDownNode.endBtn = this.getNode("Accumlated_Node/Search_Node/DropDown_Node/Btn_EndDate");
        this.dropDownNode.searchBtn = this.getNode("Accumlated_Node/Search_Node/Btn_Search");
        this.dropDownNode.searchBtn_OverPic = this.getNode("Accumlated_Node/Search_Node/Btn_Search/Btn_Serch_over");

        this.dropDownNode.startBtn.isClick = false;
        this.dropDownNode.endBtn.isClick = false;

        this.dropDownNode.startBtnSample = this.scrollList._start.getChildByName("Sample");
        this.dropDownNode.endBtnSample = this.scrollList._end.getChildByName("Sample");
    },

    createScrollList: function (sample, scroll, dateData) {
        var len = 0;
        var buttonCount = 7;
        var deviation = 1.5;
        if (dateData == null)
            len = 0;
        else
            len = dateData.length;

        this._distance = sample.getChildByName("Btn_Select").height;
        this._Room_Width = scroll.width;
        this._Room_Height = scroll.height;

        scroll.setDirection(ccui.ScrollView.DIR_VERTICAL);
        scroll.setContentSize(cc.size(this._Room_Width, (sample.getChildByName("Btn_Select").height - deviation) * buttonCount - deviation));
        scroll.setInnerContainerSize(cc.size(this._Room_Width, sample.getChildByName("Btn_Select").height * buttonCount));
        scroll.y = this.dropDownNode.startBtn.getPositionY() - this.dropDownNode.startBtn.height / 2 - scroll.height;
        scroll.x = scroll.getPositionX();
        scroll.jumpToTop();

        if (dateData == null) {
            this.dropDownNode.startBtn.getChildByName("txt_Date").setString("--/--/--");
            this.dropDownNode.endBtn.getChildByName("txt_Date").setString("--/--/--");
            return;
        } else {
            this.dropDownNode.startBtn.getChildByName("txt_Date").setString(dateData[0].date);
            this.dropDownNode.endBtn.getChildByName("txt_Date").setString(dateData[dateData.length - 1].date);
        }

        for (var i = 1; i <= dateData.length; i++) {
            var point = new cc.Node();
            point.setName("Day" + i);
            scroll.addChild(point);

            for (var j = 0; j < sample.getChildren().length; j++) {
                if (sample.getChildren()[j] instanceof cc.Sprite) {
                    var _sp = cc.Sprite.create(sample.getChildren()[j].getTexture());
                    _sp.setPosition(0, 0);
                    _sp.setAnchorPoint(0, 0);
                    _sp.setName(sample.getChildren()[j].getName());
                    _sp.setVisible(false);
                    point.getChildByName("Btn_Select").addChild(_sp);
                    continue;
                }

                var clone = sample.getChildren()[j].clone();
                clone.setAnchorPoint(0, 0);
                clone.setName(sample.getChildren()[j].getName());
                point.addChild(clone);

                if (clone instanceof ccui.TextField) {
                    clone.setString(dateData[i - 1].date);
                    clone.setPosition(13, scroll.innerHeight + 2.5 - (this._distance - deviation) * i);
                } else {
                    clone.setPosition(0, scroll.innerHeight - (this._distance - deviation) * i);
                }
            }
        }
    },

    initialBtn: function () {
        this._dateSearch = {};
        if (this._dateData == null) {
            return;
        }
        this._dateSearch.start = "";
        this._dateSearch.end = "";
        this.dropDownNode.startBtn.getChildByName("txt_Date").setString("--/--/--");
        this.dropDownNode.endBtn.getChildByName("txt_Date").setString("--/--/--");
        this.dropDownNode.searchBtn_OverPic.setVisible(false);

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

        this.registerMouseEvent(this.dropDownNode.searchBtn,
            this.downBtn.bind(this),
            this.upBtn.bind(this),
            this.enterBtn.bind(this),
            this.overBtn.bind(this));

        for (var i = 1; i <= this.dataAry.length; i++) {
            this.registerMouseEvent(this.scrollList._start.getChildByName("Day" + i).getChildByName("Btn_Select"),
                function (sender) {

                }.bind(this),
                function (sender) {
                    this.dropDownNode.startBtn.getChildByName("txt_Date").setString(sender.getParent().getChildByName("txt_Date").getString());
                    this._dateSearch.start = sender.parent.getName();
                    this.isScrollVisible.end = false;
                    this.scrollList._end.setVisible(false);
                    this.isScrollVisible.start = false;
                    this.scrollList._start.setVisible(false);
                }.bind(this),
                function (sender) {
                    sender.getChildByName("Pic_over").setVisible(true);
                }.bind(this),
                function (sender) {
                    sender.getChildByName("Pic_over").setVisible(false);
                }.bind(this));
        }

        for (var i = 1; i <= this.dataAry.length; i++) {
            this.registerMouseEvent(this.scrollList._end.getChildByName("Day" + i).getChildByName("Btn_Select"),
                function (sender) {

                }.bind(this),
                function (sender) {
                    this.dropDownNode.endBtn.getChildByName("txt_Date").setString(sender.getParent().getChildByName("txt_Date").getString());
                    this._dateSearch.end = sender.parent.getName();
                    this.isScrollVisible.end = false;
                    this.scrollList._end.setVisible(false);
                    this.isScrollVisible.start = false;
                    this.scrollList._start.setVisible(false);
                }.bind(this),
                function (sender) {
                    sender.getChildByName("Pic_over").setVisible(true);
                }.bind(this),
                function (sender) {
                    sender.getChildByName("Pic_over").setVisible(false);
                }.bind(this));
        }

        this.setMouseEvent();
    },

    downBtn: function (sender) {
        switch (sender) {
            case this.dropDownNode.startBtn:
                this.isScrollVisible.start = !this.isScrollVisible.start;
                this.scrollList._start.setVisible(this.isScrollVisible.start);
                this.isScrollVisible.end = false;
                this.scrollList._end.setVisible(false);
                break;
            case this.dropDownNode.endBtn:
                this.isScrollVisible.end = !this.isScrollVisible.end;
                this.scrollList._end.setVisible(this.isScrollVisible.end);
                this.isScrollVisible.start = false;
                this.scrollList._start.setVisible(false);
                break;
            case this.dropDownNode.searchBtn:
                this.dropDownNode.searchBtn_OverPic.setVisible(false);
                this.isScrollVisible.end = false;
                this.scrollList._end.setVisible(false);
                this.isScrollVisible.start = false;
                this.scrollList._start.setVisible(false);
                break;
        }
        sender._isClick = true;
    },

    upBtn: function (sender) {
        sender._isClick = false;
        switch (sender) {
            case this.dropDownNode.searchBtn:
                this.signRoom.searchDate(this._dateSearch);
                // showData
                this.setCurrentList("Total");
                break;
        }
    },

    enterBtn: function (sender, scroll) {
        if(sender == this.dropDownNode.searchBtn){
            this.dropDownNode.searchBtn_OverPic.setVisible(true);
        }

        if (sender._isClick) {
            return;
        }
    },

    overBtn: function (sender) {
        switch(sender){
            case this.dropDownNode.startBtn:
                this.dropDownNode.startBtn.isClick = false;
                break;
            case this.dropDownNode.endBtn:
                this.dropDownNode.endBtn.isClick = false;
                break;
            case this.dropDownNode.searchBtn:
                this.dropDownNode.searchBtn.isClick = false;
                this.dropDownNode.searchBtn_OverPic.setVisible(false);
                break;
        }
        sender._isClick = false;
    },

    setMouseEvent:function () {
        var moveEvent = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            posM: null,

            onMouseDown: function (event) {
                var pos = event.getLocation();
                var target = event.getCurrentTarget();
                
                if(!!cc.rectContainsPoint(this.scrollList._start.getBoundingBox(), pos) || !!cc.rectContainsPoint(this.dropDownNode.startBtn.getBoundingBox(), pos)){
                    if(this.scrollList._end.isVisible()){
                        this.isScrollVisible.end = false;
                        this.scrollList._end.setVisible(false);
                    }
                    return;
                }else{
                    this.isScrollVisible.start = false;
                    this.scrollList._start.setVisible(false);
                }

                if(!!cc.rectContainsPoint(this.scrollList._end.getBoundingBox(), pos) || !!cc.rectContainsPoint(this.dropDownNode.endBtn.getBoundingBox(), pos)){
                    if(this.scrollList._start.isVisible()){
                        this.isScrollVisible.start = false;
                        this.scrollList._start.setVisible(false);
                    }
                    return;
                }else{
                    this.isScrollVisible.end = false;
                    this.scrollList._end.setVisible(false);
                }

            }.bind(this),

            onMouseUp: function (event) {
                var pos = event.getLocation();
                var target = event.getCurrentTarget();
                this.isTouchScrollBar = false;
            }.bind(this),
        });

        cc.eventManager.addListener(moveEvent, this.scrollList._start);
        cc.eventManager.addListener(moveEvent, this.scrollList._end);
    }
});