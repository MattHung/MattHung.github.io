/**
 * Created by Matt Hung on 2016/12/6.
 */

 ui_RoadMapBlock = gameLayer.extend({

    ctor: function (rootNode, col_count, x, y, scale_x, scale_y, types, room) {
        this._super(rootNode);

        this.col_count = col_count;
        this.changeTypes = types;
        this.changeType_index = 0;
        this.roadMapType = this.changeTypes[this.changeType_index];
        this.roadMapTag = 0;
        this.askRoadMap = true;

        // this.initUI();

        //背景圖片
        var bgSprite = new cc.Sprite(rp.res.roadmapDefaultBG_14);

        bgSprite.setScaleX(scale_x);
        bgSprite.setScaleY(scale_y);
        bgSprite.setPosition(x, y);
        bgSprite.setAnchorPoint(cc.p(0.5, 0.5));
        this.addChild(bgSprite);

        this.registerMouseEvent(bgSprite, function (node, mouseHitPoint) {
            this.changeRoadMapType();
        }, function (node, mouseHitPoint) {
            room.uiTableArea.hideQuickBet();
        }.bind(this));

        //STEP 1 
        //新增加用來繪製路紙的Node
        var roadMapNode = new cc.Node();                
        roadMapNode.setContentSize(bgSprite.getContentSize());
        roadMapNode.setAnchorPoint(cc.p(0.5, 0.5));
        roadMapNode.setPosition(x, y);
        roadMapNode.setScaleX(scale_x);
        roadMapNode.setScaleY(scale_y);
        this.roadMapNode = roadMapNode;
        this.addChild(roadMapNode);

        //STEP2
        //把路紙Plist、Png預載到Cache中
        cc.spriteFrameCache.addSpriteFrames(rp.res.newRoadMapPlist, rp.res.newRoadMapPng);    

        //STEP3
        this.roadMapPresenter = new BaccaratCustomRoadMapPresenter();

        // 這非常重要，一定要給這張圖的路徑
        this.roadMapPresenter.setBatchNodeImagePath(rp.res.newRoadMapPng);

        //繪圖路紙的流程都是先透過updateDataSoruce更新路紙
        this.roadMapPresenter.updateDataSource("");
        this.reloadRoadMap();
        
        //STEP4 如果有莊閒問路需求
        // this.initAskNode();
        // this.roadMapPresenter.reloadAskRoadMapImage();
    },

    //************** Test Function **************

    initUI: function () {
        var back = new ccui.Button("back");
        back.setTitleText("ChangeType");
        back.x = cc.winSize.width / 2;
        back.y = 0;
        back.setAnchorPoint(cc.p(0.5, 0));
        back.addTouchEventListener(this.buttonListener, this);
        this.addChild(back, 10000);
        this.back = back;

        var green = new ccui.Button("green");
        green.setTitleText("ChangeRoadMap");
        green.x = cc.winSize.width / 2 - 200;
        green.y = 0;
        green.setAnchorPoint(cc.p(0.5, 0));
        green.addTouchEventListener(this.buttonListener, this);
        this.addChild(green, 10000);
        this.green = green;

        var red = new ccui.Button("showAskRoad");
        red.setTitleText("showAskRoad");
        red.x = cc.winSize.width / 2 + 200;
        red.y = 0;
        red.setAnchorPoint(cc.p(0.5, 0));
        red.addTouchEventListener(this.buttonListener, this);
        this.addChild(red, 10000);
        this.red = red;
    },
    buttonListener: function (sender, eventType) {
        if (eventType === ccui.Widget.TOUCH_ENDED) {
            if (sender === this.back) {
                this.changeRoadMapType();
            } else if (sender === this.green) {
                this.changeRoadMapString();
            } else {
                this.showAskRoadMap();
            }
        }
    },

    changeRoadMapType: function () {
        this.changeType_index++;
        if(this.changeType_index > this.changeTypes.length-1)
            this.changeType_index = 0;

        this.roadMapType = this.changeTypes[this.changeType_index];
        if (this.roadMapType == 5) this.roadMapType = 1;
        this.reloadRoadMap();
    },

    changeRoadMapString: function () {
        if (this.roadMapTag == 6) this.roadMapTag = 0;
        this.roadMapPresenter.updateDataSource(roadMapStrArray[this.roadMapTag]);
        this.roadMapTag ++;
        this.reloadRoadMap();
    },

    updateDataSource:function(source){
        this.roadMapPresenter.updateDataSource(source);
    },

    showAskRoadMap: function () {
        this.roadMapPresenter.showAskRoadMapCell(this.askRoadMap);
        this.askRoadMap = !this.askRoadMap;
    },

    specifyAskRoadMap: function (value) {
        this.askRoadMap = value;
        this.roadMapPresenter.showAskRoadMapCell(this.askRoadMap);        
    },

    reloadRoadMap: function () {        
        //更新完路紙後，在call這個方法去把路紙畫在想要的Node上面，可以選擇想要畫的路紙是哪種的。
        this.roadMapPresenter.drawRoadMapByType(this.roadMapNode, this.roadMapType, this.col_count);
        
        // this.roadMapPresenter.drawRoadMapByType(this.roadMapNode, BACCARATROADMAPTYPE.CHIPTRAPROAD, 14);
        // this.roadMapPresenter.drawRoadMapByType(this.roadMapNode, BACCARATROADMAPTYPE.BIGROAD);
        // this.roadMapPresenter.drawRoadMapByType(this.roadMapNode, BACCARATROADMAPTYPE.NOTYPE);
        // this.roadMapPresenter.drawRoadMapByType(this.roadMapNode, BACCARATROADMAPTYPE.BIGROAD);
        // this.roadMapPresenter.drawRoadMapByType(this.roadMapNode, BACCARATROADMAPTYPE.HYBRIDROAD);
        // this.roadMapPresenter.drawRoadMapByType(this.roadMapNode, BACCARATROADMAPTYPE.BIGSMALLROAD);
        // this.roadMapPresenter.drawRoadMapByType(this.roadMapNode, BACCARATROADMAPTYPE.CHIPTRAPROAD);

        // this.roadMapPresenter.reloadAskRoadMapImage();
    },

    initAskNode:function (pos_player, pos_banker) {        
        var width = 110;
        var height =50;

        var scale = 0.35;

        var playerAskView = new ccui.Node();        
        playerAskView.setPosition(cc.p(pos_player.x, pos_player.y));
        playerAskView.setContentSize(cc.size(width, height));
        playerAskView.setScale(scale);
        this.addChild(playerAskView);
                
        var bankerAskView = new ccui.Node()
        bankerAskView.setPosition(cc.p(pos_banker.x, pos_banker.y));
        bankerAskView.setContentSize(cc.size(width, height));
        bankerAskView.setScale(scale);
        this.addChild(bankerAskView);

        this.roadMapPresenter.setAskRoadMapView(playerAskView, bankerAskView);
    },

    getRoadMapInformation:function(){
        return this.roadMapPresenter.getRoadMapInformation();
    }
});


ui_RoadMap = gameLayer.extend({
    _block_chip_trap_road:null,
    _block_hybrid_road:null, 

    _lb_banker_title:null,
    _lb_player_title:null,
    _lb_tie_title:null,

    _lb_banker_score:null,
    _lb_player_score:null,
    _lb_tie_score:null,

    _lb_btn_hover: null,
    _lb_btn_text_banker_ask: null,
    _lb_btn_text_player_ask: null,

    _ask_road_bank:null,
    _ask_road_player:null,

    ctor: function (rootNode, room) {
        this._super(rootNode);

        var node_reference = this.getNode("Rute_Node/bg_route");

        var x = 139;
        var y = node_reference.getPosition().y;
        var ref_size = node_reference.getContentSize();

        
        var bgSprite = new cc.Sprite(rp.res.roadmapDefaultBG_14);
        var scale_x = ref_size.width / bgSprite.getContentSize().width; 
        var scale_y = ref_size.height / bgSprite.getContentSize().height; 
        scale_x *= 0.99;
        scale_x /= 2;
        scale_y *= 0.97;

        this._block_chip_trap_road = new ui_RoadMapBlock(node_reference, 14, x, y, scale_x, scale_y,
            [BACCARATROADMAPTYPE.BIGROAD, BACCARATROADMAPTYPE.CHIPTRAPROAD], room);

        this._block_hybrid_road = new ui_RoadMapBlock(node_reference, 14, x + 265, y, scale_x, scale_y,
            [BACCARATROADMAPTYPE.HYBRIDROAD, BACCARATROADMAPTYPE.BIGSMALLROAD], room);

        this._ask_road_bank = this.getNode("Rute_Node/AskB/Btn_askb");
        this._ask_road_player = this.getNode("Rute_Node/AskP/Btn_askp");

        this._lb_btn_text_banker_ask = this.getNode("Rute_Node/AskB/txt_askb");
        this._lb_btn_text_player_ask = this.getNode("Rute_Node/AskP/txt_askp");
        this._lb_btn_text_banker_ask.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this._lb_btn_text_player_ask.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);


        this._lb_btn_hover = {};
        this._lb_btn_hover[this._ask_road_bank.getName()] = this.getNode("Rute_Node/AskB/btn_askb_over");
        this._lb_btn_hover[this._ask_road_player.getName()] = this.getNode("Rute_Node/AskP/btn_askp_over");

        this.registerMouseEvent(this._ask_road_bank, this.downBtnAsk.bind(this), function (node, mouseHitPoint) {
            this._block_chip_trap_road.specifyAskRoadMap(false);
            this._block_hybrid_road.specifyAskRoadMap(false);
            room.uiTableArea.hideQuickBet();
        }.bind(this), this.enterBtnAsk.bind(this), this.overBtnAsk.bind(this));

        this.registerMouseEvent(this._ask_road_player, this.downBtnAsk.bind(this), function (node, mouseHitPoint) {
            this._block_chip_trap_road.specifyAskRoadMap(true);
            this._block_hybrid_road.specifyAskRoadMap(true);
            room.uiTableArea.hideQuickBet();
        }.bind(this), this.enterBtnAsk.bind(this), this.overBtnAsk.bind(this));

        this.addChild(this._block_chip_trap_road);
        this.addChild(this._block_hybrid_road);

        this.initialLabels();

        this.updateRoadMapStr("");
    },

    enterBtnAsk: function (sender) {
        var sprite_path = this._lb_btn_hover[sender.getName()].getTexture().url;
        var hoverSprite = cc.Sprite.create(sprite_path);
        sender.addChild(hoverSprite);
        hoverSprite.setPosition(cc.p(sender.width / 2 * sender.getScaleX(), sender.height / 2 * sender.getScaleY()));
        hoverSprite.setName(sender.getName() + "_" + sprite_path.split("_")[sprite_path.split("_").length - 1].split(".")[0]);
    },

    downBtnAsk: function (sender) {
        var hoverSprite = sender.getChildByName(sender.getName() + "_over");
        if (hoverSprite)
            hoverSprite.setVisible(false);
    },

    overBtnAsk: function (sender) {
        if (sender.getChildByName(sender.getName() + "_over"))
            sender.removeChild(sender.getChildByName(sender.getName() + "_over"));
    },

    update: function () {
        var text_banker_ask = language_manager.getInstance().getTextID(85);
        var text_player_ask = language_manager.getInstance().getTextID(86);

        this._lb_btn_text_banker_ask.setString(text_banker_ask);
        this._lb_btn_text_player_ask.setString(text_player_ask);

        var title_banker = language_manager.getInstance().getTextID(12);
        var title_player = language_manager.getInstance().getTextID(13);
        var title_tie = language_manager.getInstance().getTextID(14);

        this._lb_banker_title.setString(title_banker);
        this._lb_player_title.setString(title_player);
        this._lb_tie_title.setString(title_tie);
    },

    initialLabels:function(){
        this._lb_banker_score = this.getNode("Rute_Node/Banker/B_Score");
        this._lb_player_score = this.getNode("Rute_Node/Player/P_Score");
        this._lb_tie_score = this.getNode("Rute_Node/Tie/T_Score");

        this._lb_banker_score.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);
        this._lb_player_score.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);
        this._lb_tie_score.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);

        this._lb_banker_title = this.getNode("Rute_Node/Banker/B");
        this._lb_player_title = this.getNode("Rute_Node/Player/P");
        this._lb_tie_title = this.getNode("Rute_Node/Tie/Tie");

        if(language_manager.getInstance().getLanguage() ==language_manager.getInstance().Choose_Language.lan_English){
            this._lb_tie_title.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        }
        else{
            this._lb_tie_title.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
        }
    },

    updateRoadMapStr:function(roadMapStr){
        this._block_chip_trap_road.updateDataSource(roadMapStr);
        this._block_hybrid_road.updateDataSource(roadMapStr);

        this._block_chip_trap_road.reloadRoadMap();
        this._block_hybrid_road.reloadRoadMap();


        var data = this._block_chip_trap_road.getRoadMapInformation();

        this._lb_banker_score.setString(data.Banker);
        this._lb_player_score.setString(data.Player);
        this._lb_tie_score.setString(data.Tie);

        var left = 607;
        var top =6;
        var height_gap = 15;
        this._block_chip_trap_road.initAskNode({x:left, y:top}, {x:left, y:top + height_gap});
        this._block_chip_trap_road.roadMapPresenter.reloadAskRoadMapImage();

        this.getNode("Rute_Node/Circle_b").setVisible(false);
        this.getNode("Rute_Node/Circle_p").setVisible(false);
    },

    updateRoadMap:function(roadMapStr){
        this.updateRoadMapStr(roadMapStr);
    },

    clearRoadMap:function(){        
        this.updateRoadMap("");
    },
});

// var testRoadMapStr1 = "37-9,37-9,37-9,37-9,37-9,37-9,37-9,37-9,37-9,37-9,37-9,37-9,37-9,37-9,37-9,37-9,17-9,17-9,17-9,17-9,17-9,17-9,17-9,17-9,37-9,37-9,37-9,37-9,37-9,37-9,37-9,17-9,17-9,17-9,17-9,17-9,17-9,37-9,37-9,37-9,37-9,17-9,17-9,17-9,37-9,37-9,37-9,37-9,37-9,37-9";
// var testRoadMapStr0 = "1-1,1-1,101-1,101-1,1-1,1-1,101-1,1-1,101-1,1-1";
// var testRoadMapStr1 = "37-9,37-9,37-9,37-9,37-9,37-9,37-9,37-9,37-9,37-9,37-9,37-9,37-9,37-9,37-9,37-9,17-9,17-9,17-9,17-9,17-9,17-9,17-9,17-9,37-9,37-9,37-9,37-9,37-9,37-9,37-9,17-9,17-9,17-9,17-9,17-9,17-9,37-9,37-9,37-9,37-9,17-9,17-9,17-9,37-9,37-9,37-9,37-9,37-9,37-9";
// var testRoadMapStr2 = "3-7,65-9,77-2,124-5,151-9,65-7,53-7,37-9,61-8,49-2,1-7,73-2,5-7,1-7,13-9,13-9,92-8,62-8,25-7,65-9,37-9,25-9,5-9,89-8,81-4,89-8,65-9,17-9,17-9,53-5,89-8,41-8,82-8,65-9,17-9,89-8,17-9,53-7,17-9,1-5";
// var testRoadMapStr3 = "3-7,65-9,77-2,124-5,151-9,65-7,53-7,37-9,61-8,49-2,1-7,73-2,5-7,1-7,13-9,13-9,92-8,62-8,25-7,65-9,37-9,25-9,5-9,89-8,81-4,89-8,65-9,17-9,17-9,53-5,89-8,41-8,82-8,65-9,17-9,89-8,17-9,53-7,17-9,1-5";
// var testRoadMapStr4 = "49-8,61-8,61-8,9-5,13-9,103-3,53-9,49-6,55-7,37-9,21-9,49-8,25-5,1-7,54-5,41-8,78-8,13-9,74-4,49-6,6-5,13-9,89-8,13-9,5-7,73-8,5-9,41-8,73-6,49-4,85-8,49-8,49-8,49-6,13-9,25-7,53-9,50-6,66-9,53-5,65-9,77-4,183-8,49-8,25-7,5-5,5-7,92-8,175-6,31-6,73-8,93-6,49-8,5-9,49-4,49-4,13-9,53-3,55-7,39-9,49-8,29-4,1-7,25-3,89-8,65-7,17-9,37-9,106-1,128-8,1-9,37-9,13-9,73-6,49-4,85-8,2-9,77-4,25-9,65-9,77-2,73-4,29-2,5-5,5-9,43-8,123-5,61-8,49-2,49-6,29-4,53-1,29-8,37-9,77-6,29-6,66-9,43-8,77-6,1-3,5-3,41-8,25-7,187-8,77-8,53-1,53-7,82-4,65-9,85-8,50-6,53-7,49-4,73-6,162-9,25-5,29-8,37-9,13-9,107-9,1-7,49-6,53-7,73-6,9-7,49-8,25-5,49-6,53-3,61-8,65-7,17-9,41-8,77-6,77-2,49-8,79-8";
// var testRoadMapStr5 = "41-8,37-9,162-9,65-9,9-5,77-6,162-9,85-8,73-6,61-8,25-9,29-2,65-7,1-7,81-4,49-4,1-9,53-9,25-3,93-8,29-8,1-9,13-9,1-5,49-6,53-7,74-4,25-5,17-9,5-5,25-5,25-9,37-9,13-9,78-6,85-8,89-8,85-8,66-9,37-9,9-7,5-9,25-7,27-7,37-9,61-8,89-8,25-5,85-8,25-7,187-8,1-3,25-9,87-8,25-5,5-7,53-9,73-8,5-3,27-7,55-5,13-9,25-7,37-9,65-9,49-8,77-6,1-7,61-8,29-6,49-6,53-7,9-9,37-9,77-6,37-9,13-9,53-9,85-8,25-7,1-5,99-9,174-6,126-6,25-9,25-5,25-1,85-8,17-9,25-7,29-6,29-6,65-9,66-9,89-8,89-8,37-9,5-7,17-9,162-9,65-9,29-6,13-9,3-7,53-5,66-9,49-6,9-1,61-8,53-5,5-7,13-9,41-8,1-9,53-7,37-9,89-8,53-1,65-9,93-6,89-8,65-9,61-8,25-9,9-7,5-9,85-8,65-9,150-7,135-9,37-9,171-4,65-9,37-9,9-7,25-1,13-9,77-6,9-7,29-8,50-4,190-6,13-9,77-4,21-7,25-9,37-9,61-8,29-2,77-6,49-6,85-8,74-6,37-9,25-7,75-6,53-5,17-9,17-9,37-9,29-6,49-8,17-9,78-6,53-7,29-8,25-3,29-6,53-9,25-7,1-7,5-9,6-7,25-7,37-9,53-3,77-6,49-4,65-9,13-9,29-6,1-7,6-7,50-6,6-7,25-9,27-5,53-5,1-9,17-9,180-8,66-9,61-8,41-8,73-4,65-9,150-9,29-6,25-7,13-9,61-8,5-7,162-7,37-9";
// var roadMapStrArray =  [testRoadMapStr0, testRoadMapStr1, testRoadMapStr2, testRoadMapStr3, testRoadMapStr4, testRoadMapStr5];