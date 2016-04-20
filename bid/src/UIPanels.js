/**
 * Created by matt1201 on 2016/3/23.
 */

UIPanels=function(){};

UIPanels.Btn_Control=gameLayer.extend({
    callback_confirm:null,
    callback_clear:null,
    ctor:function(root, callback_confirm, callback_clear) {
        this._super(root);
        this.callback_confirm = callback_confirm;
        this.callback_clear = callback_clear;

        this.registerMouseEvent(this.getNode("/btn_confirm"),
            function(node, mouseHitPoint){this.callback_confirm();}.bind(this)
        );

        this.registerMouseEvent(this.getNode("/btn_clear"),
            function(node, mouseHitPoint){this.callback_clear();}.bind(this)
        );
    }
});

UIPanels.ChipSelector=gameLayer.extend({
    node_select_highLight:null,
    select_chip_value:0,
    ctor:function(root){
        this._super(root);

        this.node_select_highLight=this.getNode("/chip/chip_down");
        this.registerChipClick();
    },
    registerChipClick:function(){
        this.registerMouseEvent(this.getNode("/chip/chip_chip_10"), this.onChipClick );
        this.registerMouseEvent(this.getNode("/chip/chip_chip_100"), this.onChipClick );
        this.registerMouseEvent(this.getNode("/chip/chip_chip_1000"), this.onChipClick );
        this.registerMouseEvent(this.getNode("/chip/chip_chip_10000"), this.onChipClick );
    },

    onChipClick:function(node, mouseHitPoint){
        var value=parseInt(node.getName().replace("chip_chip_", ""));
        this.node_select_highLight.setVisible(true);
        this.node_select_highLight.setPosition(node.getPosition());
        this.select_chip_value = value;
    }
});

UIPanels.Peek=gameLayer.extend({
    showCard:null,
    win_bg:null,
    bg_peek:null,
    bg_peek_player:null,
    bg_peek_banker:null,

    ctor:function(root){
        this._super(root);
        this.showCard={};
        this.showCard.peek_player_a={};
        this.showCard.peek_player_b={};
        this.showCard.peek_player_c={};

        this.showCard.peek_banker_a={};
        this.showCard.peek_banker_b={};
        this.showCard.peek_banker_c={};

        this.win_bg = {};
        this.win_bg.banker = this.getNode("/bg_peek_banker_win");
        this.win_bg.player = this.getNode("/bg_peek_player_win");

        this.bg_peek = this.getNode("/bg_peek");
        this.bg_peek_player ={};
        this.bg_peek_banker ={};
        this.connectNode(this.getNode("/bg_peek/bg_peek_player"), this.bg_peek_player);
        this.connectNode(this.getNode("/bg_peek/bg_peek_banker"), this.bg_peek_banker);

        this.setShowCardPosition();
    },

    setShowCardPosition:function(){
        this.showCard.peek_player_a.position = this.getNode("/peek_player_a").getPosition();
        this.showCard.peek_player_b.position = this.getNode("/peek_player_b").getPosition();
        this.showCard.peek_player_c.position = this.getNode("/peek_player_c").getPosition();

        this.showCard.peek_banker_a.position = this.getNode("/peek_banker_a").getPosition();
        this.showCard.peek_banker_b.position = this.getNode("/peek_banker_b").getPosition();
        this.showCard.peek_banker_c.position = this.getNode("/peek_banker_c").getPosition();

        this.showCard.peek_player_a.size = this.getNode("/peek_player_a").getContentSize();
        this.showCard.peek_player_b.size = this.getNode("/peek_player_b").getContentSize();
        this.showCard.peek_player_c.size = this.getNode("/peek_player_c").getContentSize();

        this.showCard.peek_banker_a.size = this.getNode("/peek_banker_a").getContentSize();
        this.showCard.peek_banker_b.size = this.getNode("/peek_banker_b").getContentSize();
        this.showCard.peek_banker_c.size = this.getNode("/peek_banker_c").getContentSize();

        this.showCard.peek_player_a.card = null;
        this.showCard.peek_player_b.card = null;
        this.showCard.peek_player_c.card = null;

        this.showCard.peek_banker_a.card = null;
        this.showCard.peek_banker_b.card = null;
        this.showCard.peek_banker_c.card = null;
    },

    show:function(car_field_name, card_name, card){
        if(this.showCard[car_field_name].card)
            this.root_node.removeChild(this.showCard[car_field_name].card);

        if(!card)
            return;

        var scale_x = this.showCard[car_field_name].size.width / card.width;
        var scale_y = this.showCard[car_field_name].size.height / card.height;

        this.showCard[car_field_name].card=card;

        this.showCard[car_field_name].card.setPosition(this.showCard[car_field_name].position);
        this.showCard[car_field_name].card.setScale(scale_x, scale_y);
        this.showCard[car_field_name].card.zIndex=2;
        this.showCard[car_field_name].card.setVisible(true);
        this.showCard[car_field_name].Style = function(){return card_name.split(".")[0];};
        this.showCard[car_field_name].Num = function(){return parseInt(card_name.split(".")[1]);};

        this.root_node.addChild(this.showCard[car_field_name].card);

        this.bg_peek.setVisible(true);
    },

    updateScore:function(score_player, score_banker){
        this.bg_peek_player.Text.setString(score_player);
        this.bg_peek_banker.Text.setString(score_banker);
    },

    clear:function(){
        for(var car_field_name in this.showCard){
            if(this.showCard[car_field_name].card) {
                this.root_node.removeChild(this.showCard[car_field_name].card);
                this.showCard[car_field_name].card.release();
            }
        }

        this.win_bg.player.setVisible(false);
        this.win_bg.banker.setVisible(false);

        this.bg_peek.setVisible(false);
    }
});

UIPanels.BetArea=gameLayer.extend({
    placeBet_root:null,
    tableBet_root:null,
    bet_down:null,
    flickerArea:null,
    flickerParam:{},
    bet_chips_sample:[],  //key : chip values, value:chip sprite
    placeBetsInfo:{b1:{}, b2:{}, b3:{}, b4:{}, b5:{}},
    tableBet_positionList:{
        b1: [
            {area_id: "b1",point: {"x": 1273.7782448765108, "y": 152.08556149732618, "pixel": {"0": 82, "1": 41, "2": 64, "3": 255}}},
            {area_id: "b1",point: {"x": 1346.4214398318445, "y": 154.97326203208556, "pixel": {"0": 82, "1": 41, "2": 64, "3": 255}}},
            {area_id: "b1",point: {"x": 1421.0825013137153, "y": 163.63636363636363, "pixel": {"0": 82, "1": 41, "2": 64, "3": 255}}},
            {area_id: "b1",point: {"x": 1500.7882291119286, "y": 163.63636363636363, "pixel": {"0": 82, "1": 41, "2": 64, "3": 255}}},
            {area_id: "b1",point: {"x": 1572.4224908039937, "y": 163.63636363636363, "pixel": {"0": 82, "1": 41, "2": 64, "3": 255}}},
            {area_id: "b1",point: {"x": 1645.0656857593274, "y": 164.59893048128342, "pixel": {"0": 82, "1": 41, "2": 64, "3": 255}}},
            {area_id: "b1",point: {"x": 1728.8071466106148, "y": 165.56149732620318, "pixel": {"0": 82, "1": 41, "2": 64, "3": 255}}}
        ],
        b2:[
            {area_id:"b2",  point:{"x":180.09458749343145,"y":125.13368983957218,"pixel":{"0":82,"1":41,"2":64,"3":255}}},
            {area_id:"b2",  point:{"x":261.8181818181818,"y":155.93582887700535,"pixel":{"0":82,"1":41,"2":64,"3":255}}},
            {area_id:"b2",  point:{"x":331.43457698371,"y":127.05882352941175,"pixel":{"0":82,"1":41,"2":64,"3":255}}},
            {area_id:"b2",  point:{"x":405.08670520231215,"y":161.71122994652404,"pixel":{"0":82,"1":41,"2":64,"3":255}}},
            {area_id:"b2",  point:{"x":459.5691014188124,"y":123.20855614973262,"pixel":{"0":82,"1":41,"2":64,"3":255}}},
            {area_id:"b2",  point:{"x":541.2926957435628,"y":168.44919786096256,"pixel":{"0":82,"1":41,"2":64,"3":255}}},
            {area_id:"b2",  point:{"x":620.9984235417762,"y":122.24598930481282,"pixel":{"0":82,"1":41,"2":64,"3":255}}}
        ],
        b3:[
            {area_id:"b3",  point:{"x":738.0346820809249,"y":144.3850267379679,"pixel":{"0":82,"1":41,"2":64,"3":255}}},
            {area_id:"b3",  point:{"x":816.7314766158697,"y":151.12299465240642,"pixel":{"0":82,"1":41,"2":64,"3":255}}},
            {area_id:"b3",  point:{"x":895.4282711508146,"y":153.04812834224597,"pixel":{"0":82,"1":41,"2":64,"3":255}}},
            {area_id:"b3",  point:{"x":975.133998949028,"y":156.8983957219251,"pixel":{"0":82,"1":41,"2":64,"3":255}}},
            {area_id:"b3",  point:{"x":1051.8129269574356,"y":148.23529411764704,"pixel":{"0":196,"1":149,"2":227,"3":255}}},
            {area_id:"b3",  point:{"x":1118.4025223331582,"y":172.2994652406417,"pixel":{"0":82,"1":41,"2":64,"3":255}}},
            {area_id:"b3",  point:{"x":1178.9385181292696,"y":128.02139037433153,"pixel":{"0":82,"1":41,"2":64,"3":255}}}
        ],
        b4:[
            {area_id:"b4",  point:{"x":1238.4655806621124,"y":337.8609625668449,"pixel":{"0":82,"1":41,"2":64,"3":255}}},
            {area_id:"b4",  point:{"x":1257.6353126642146,"y":236.79144385026737,"pixel":{"0":82,"1":41,"2":64,"3":255}}},
            {area_id:"b4",  point:{"x":1299.001576458224,"y":330.1604278074866,"pixel":{"0":82,"1":41,"2":64,"3":255}}},
            {area_id:"b4",  point:{"x":1312.1177088807146,"y":245.45454545454544,"pixel":{"0":82,"1":41,"2":64,"3":255}}},
            {area_id:"b4",  point:{"x":1366.600105097215,"y":325.34759358288767,"pixel":{"0":82,"1":41,"2":64,"3":255}}},
            {area_id:"b4",  point:{"x":1378.7073042564373,"y":246.41711229946523,"pixel":{"0":96,"1":54,"2":83,"3":255}}},
            {area_id:"b4",  point:{"x":1451.350499211771,"y":279.14438502673795,"pixel":{"0":82,"1":41,"2":64,"3":255}}}
        ],
        b5:[
            {area_id:"b5",  point:{"x":484.79243300052553,"y":333.04812834224595,"pixel":{"0":82,"1":41,"2":64,"3":255}}},
            {area_id:"b5",  point:{"x":466.6316342616921,"y":242.56684491978606,"pixel":{"0":82,"1":41,"2":64,"3":255}}},
            {area_id:"b5",  point:{"x":550.3730951129795,"y":330.1604278074866,"pixel":{"0":82,"1":41,"2":64,"3":255}}},
            {area_id:"b5",  point:{"x":539.2748292170257,"y":246.41711229946523,"pixel":{"0":83,"1":42,"2":66,"3":255}}},
            {area_id:"b5",  point:{"x":613.9358906988965,"y":334.01069518716577,"pixel":{"0":82,"1":41,"2":64,"3":255}}},
            {area_id:"b5",  point:{"x":612.926957435628,"y":246.41711229946523,"pixel":{"0":82,"1":41,"2":64,"3":255}}},
            {area_id:"b5",  point:{"x":681.5344193378876,"y":281.06951871657753,"pixel":{"0":82,"1":41,"2":64,"3":255}}}
        ]
    },

    ctor:function(root){
        this._super(root);
        this.bet_down={};
        this.connectNode(this.getNode("/bet_down"), this.bet_down);

        this.flickerParam.Interval=0.5;
        this.flickerParam.Times=6;

        this.setupBetChipSample();
    },

    setPlaceBetEvent:function(callback_fun){
        this.placeBet_root = new cc.Node();
        this.placeBet_root.setName("placeBet_root");
        this.root_node.addChild(this.placeBet_root);

        this.tableBet_root = new cc.Node();
        this.tableBet_root.setName("tableBet_root");
        this.root_node.addChild(this.tableBet_root);

        this.placeBetsInfo.b1 = {node:this.getNode("/bet_area/bet_area_bet_1"), betValue:0};
        this.placeBetsInfo.b2 = {node:this.getNode("/bet_area/bet_area_bet_3"), betValue:0};
        this.placeBetsInfo.b3 = {node:this.getNode("/bet_area/bet_area_bet_2"), betValue:0};
        this.placeBetsInfo.b4 = {node:this.getNode("/bet_area/bet_area_bet_4"), betValue:0};
        this.placeBetsInfo.b5 = {node:this.getNode("/bet_area/bet_area_bet_5"), betValue:0};

        for(var i=1;i<=5; i++){
            var key =String.format("b{0}", i);
            this.placeBetsInfo[key].node.area_id = key;

            var event = this.registerMouseEvent(this.placeBetsInfo[key].node,
                function(node, mouseHitPoint){
                    var area_id=node.area_id;
                    callback_fun(area_id, mouseHitPoint);

                    //logger.log(String.format("area_id:{0}  point={1}", area_id, JSON.stringify(mouseHitPoint)));
                }.bind(this)
            );
        }
    },

    getChipStack:function(chipValue){
        var parent_node=new cc.Node();
        var top_index = 0;
        var value = chipValue;
        for(var i=this.bet_chips_sample.length-1; i>=0; i--){
            while(value >= this.bet_chips_sample[i].id)
            {
                var chip_sprite = cc.Sprite.create(this.bet_chips_sample[i].node.getTexture());
                chip_sprite.setPosition(0, top_index * 2);
                top_index++;
                parent_node.addChild(chip_sprite);
                value -=this.bet_chips_sample[i].id;
            }
        }

        var textField = new ccui.Text(chipValue.toString(), "Arial", 24);
        textField.setPosition(0, (top_index * 2) +30);
        textField.setColor(new cc.Color(0, 255, 0, 255));
        parent_node.addChild(textField);

        return parent_node;
    },

    showPlaceBet:function(area_id, chipValue, worldPosition){
        var tag_id = area_id;
        this.placeBet_root.removeChildByTag(tag_id, true);

        if(chipValue==0)
            return;

        var parent_node = this.getChipStack(chipValue);
        var position = this.root_node.convertToNodeSpace(worldPosition);
        parent_node.setPosition(position);
        parent_node.setTag(tag_id);
        this.placeBet_root.addChild(parent_node);
    },

    clearPlaceBet:function(){
        this.placeBet_root.removeAllChildren();
    },

    showTableBet:function(userName, index, betValues){
        for(var i=0; i<betValues.length; i++) {
            var key =String.format("b{0}", i+1);
            var x =this.tableBet_positionList[key][index].point.x;
            var y =this.tableBet_positionList[key][index].point.y;

            var chipValue = betValues[i];
            var worldPosition = new cc.Point(x, y);

            if(chipValue==0)
                continue;

            node = this.getChipStack(chipValue);
            var position = this.root_node.convertToNodeSpace(worldPosition);
            node.setPosition(position);
            this.tableBet_root.addChild(node);
        }
    },

    clearTableBet:function(){
        this.tableBet_root.removeAllChildren();
    },

    setupBetChipSample:function(){
        var node_bet_chips={};
        this.connectNode(this.getNode("/bet_chips"), node_bet_chips);

        this.bet_chips_sample.push({id:1, node:node_bet_chips.chip_chip_bet_1});
        this.bet_chips_sample.push({id:10, node:node_bet_chips.chip_chip_bet_10});
        this.bet_chips_sample.push({id:100, node:node_bet_chips.chip_chip_bet_100});
        this.bet_chips_sample.push({id:1000, node:node_bet_chips.chip_chip_bet_1000});
        this.bet_chips_sample.push({id:10000, node:node_bet_chips.chip_chip_bet_10000});
        this.bet_chips_sample.push({id:100000, node:node_bet_chips.chip_chip_bet_100000});
        this.bet_chips_sample.push({id:1000000, node:node_bet_chips.chip_chip_bet_1000k});
        this.bet_chips_sample.push({id:100000000, node:node_bet_chips.chip_chip_bet_100000k});

        this.bet_chips_sample.push({id:5, node:node_bet_chips.chip_chip_bet_5});
        this.bet_chips_sample.push({id:20, node:node_bet_chips.chip_chip_bet_20});
        this.bet_chips_sample.push({id:50, node:node_bet_chips.chip_chip_bet_50});
        this.bet_chips_sample.push({id:500, node:node_bet_chips.chip_chip_bet_500});
        this.bet_chips_sample.push({id:5000, node:node_bet_chips.chip_chip_bet_5000});
        this.bet_chips_sample.push({id:50000, node:node_bet_chips.chip_chip_bet_50000});
        this.bet_chips_sample.push({id:500000, node:node_bet_chips.chip_chip_bet_500000});
        this.bet_chips_sample.push({id:5000000, node:node_bet_chips.chip_chip_bet_5000k});
        this.bet_chips_sample.push({id:50000000, node:node_bet_chips.chip_chip_bet_50000k});

        this.bet_chips_sample.sort(function(item1, item2){return parseInt(item1.id - item2.id)});
    },
    flickerBetArea:function(area){
        var _this = this;
        this.flickerArea=area;

        cc.director.getScheduler().schedule(
            function(){
                for(var i =0 ;i<area.length; i++)
                {
                    var field_name=String.format("btn_down_{0}", area[i]);
                    _this.bet_down[field_name].setVisible(!_this.bet_down[field_name].isVisible());
                }
            },
            this,
            this.flickerParam.Interval,
            this.flickerParam.Times,
            0,
            false,
            this.instanceId
        );
    },
    clear:function(){
        cc.director.getScheduler().unschedule(this.instanceId, this);

        for(var element in this.bet_down)
            this.bet_down[element].setVisible(false);

        for(var bet in this.placeBetsInfo)
            this.placeBetsInfo[bet]=0;

        this.clearPlaceBet();
        this.clearTableBet();
    }
});

UIPanels.Counter=gameLayer.extend({
    samples:null,
    counter:null,
    progressTimer:null,

    ctor:function(root){
        this._super(root);

        this.counter={};
        this.samples={};

        this.connectNode(root, this.counter);
        this.connectNode(this.getNode("/samples"), this.samples);

        this.progressTimer = new cc.ProgressTimer(this.counter.bg_counter_time2);
        this.progressTimer.setType(cc.ProgressTimer.TYPE_RADIAL);
        this.progressTimer.setPercentage(100);
        this.progressTimer.x = this.counter.bg_counter_time2.getPosition().x;
        this.progressTimer.y = this.counter.bg_counter_time2.getPosition().y;
        this.progressTimer.setScale(0.9, 0.9);
        this.progressTimer.setReverseProgress(true);
        this.root_node.addChild(this.progressTimer);
    },

    setSeconds:function(secs){
        var digit_tens = Math.floor(secs / 10);
        var digit_ones = secs % 10;

        this.counter.num_counter_2.setVisible(false);
        this.counter.num_counter_5.setVisible(false);

        if(digit_tens>0) {
            var spriteName_tens = String.format("num_counter_{0}", digit_tens);
            this.counter.num_counter_2.setTexture(this.samples[spriteName_tens].getTexture());
            this.counter.num_counter_2.setVisible(true);
        }

        var spriteName_ones = String.format("num_counter_{0}", digit_ones);
        this.counter.num_counter_5.setTexture(this.samples[spriteName_ones].getTexture());
        this.counter.num_counter_5.setVisible(true);

        //set progress
        var percent = (secs/26)*100;
        this.progressTimer.setPercentage(percent);

        this.setVisible(true);
    }
});

UIPanels.Messages=gameLayer.extend({
    txt_home_page_pic_info_yellow:null,
    txt_home_page_pic_info_red:null,
    txt_home_page_pic_info_green:null,

    txt_home_page_pic_info_win:null,
    txt_home_page_pic_info_lose:null,
    txt_home_page_pic_info:null,

    ctor:function(root){
        this._super(root);

        this.txt_home_page_pic_info_yellow = this.getNode("/home_page_pic_info_yellow/Text");
        this.txt_home_page_pic_info_red = this.getNode("/home_page_pic_info_red/Text");
        this.txt_home_page_pic_info_green = this.getNode("/home_page_pic_info_green/Text");

        this.txt_home_page_pic_info_win = this.getNode("/home_page_pic_info_win/Text");
        this.txt_home_page_pic_info_lose = this.getNode("/home_page_pic_info_lose/Text");
        this.txt_home_page_pic_info = this.getNode("/home_page_pic_info/Text");

        var textSize= new cc.size(cc.winSize.width, 48);
        this.txt_home_page_pic_info_yellow.setTextAreaSize(textSize);
        this.txt_home_page_pic_info_red.setTextAreaSize(textSize);
        this.txt_home_page_pic_info_green.setTextAreaSize(textSize);
        this.txt_home_page_pic_info_win.setTextAreaSize(textSize);
        this.txt_home_page_pic_info_lose.setTextAreaSize(textSize);
        this.txt_home_page_pic_info.setTextAreaSize(textSize);
    },

    showMessageInternal:function(msg_field_name, text){
        this[msg_field_name].setString(text);
        this[msg_field_name].getParent().setVisible(true);

        //hide after 8 secs
        cc.director.getScheduler().schedule(
            function(){
                this.setVisible(false);
                cc.director.getScheduler().unscheduleAllForTarget(this);
            },
            this[msg_field_name].getParent(), 0, 0, 8, false
        )
    },

    showGreenMessage:function(text){
        this.showMessageInternal("txt_home_page_pic_info_green", text);
    },

    showRedMessage:function(text){
        this.showMessageInternal("txt_home_page_pic_info_red", text);
    },

    showYellowMessage:function(text){
        this.showMessageInternal("txt_home_page_pic_info_yellow", text);
    },

    showWinMessage:function(text){
        this.showMessageInternal("txt_home_page_pic_info_win", text);
    },

    showLoseMessage:function(text){
        this.showMessageInternal("txt_home_page_pic_info_lose", text);
    },

    showInfoMessage:function(text){
        this.showMessageInternal("txt_home_page_pic_info", text);
    }
});
