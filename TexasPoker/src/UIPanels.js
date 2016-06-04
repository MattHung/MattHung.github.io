/**
 * Created by LE  YI-HSUAN on 2016/4/4.
 */

PokerCards = gameLayer.extend({
    CardStyleMap:["s", "h", "d", "c"],
    CardNumMap:["k", "a", "2", "3", "4", "5", "6", "7", "8", "9", "10", "j", "q"],
    TotalCount:52,
    _cards:[],

    ctor:function(resName_or_rootNode){
        this._super(resName_or_rootNode);

        var children = this.root_node.getChildren();

        var i =0;
        var node;

        for(i =0; i<children.length; i++){
            node = children[i];
            CocosWidget.removeRedundantSuffix(node, "_");
        }

        this._cards[0] =this.getNode("ooo_cardback");
        for(i=1; i<=this.TotalCount; i++){
            var cardStyle =  Math.floor(i / 13);
            if(cardStyle>=this.CardStyleMap.length)
                cardStyle--;
            var cardNum = i % 13;

            var suffix = this.CardStyleMap[cardStyle];
            var prefix = this.CardNumMap[cardNum];

            var srcName= String.format("ooo_{0}{1}", prefix, suffix);
            node = this.getNode(srcName);
            this._cards[i] = node;;
        }
    },

    popCard:function(cardNum){
        var result = new cc.Sprite();
        result.setTexture(this._cards[cardNum].getTexture());
        return result;
    }
});

PokerCards._instance=null;
PokerCards.getInstance =function(){
    if(!PokerCards._instance)
        PokerCards._instance = new PokerCards(res.CardScene_json);

    return PokerCards._instance;
};

Panel_Players = gameLayer.extend({
    dealer_icon:null,
    node_players:[],
    emptySeat_sample:null,
    actionMap:[
        null,
        "Fold" ,         //棄牌
        "Allin" ,        //全下
        "Check" ,        //過牌
        "Raise" ,        //加注
        "CatchBlind" ,   //大小盲自動下注
        "Timeout"        //下注Timeout
    ],

    ctor:function(rootNode){
        this._super(rootNode);

        this.emptySeat_sample = this.getNode("empty_seat");

        for(var i=1; i<=9; i++) {
            var nodeName=String.format("player{0}", i);
            var node = this.getNode(nodeName);
            node.setVisible(false);

            var counterNode = node.getChildByName("counter");
            counterNode.setVisible(false);
            var timer = null;
            timer = new cc.ProgressTimer(counterNode);
            timer.setType(cc.ProgressTimer.TYPE_RADIAL);
            timer.setPercentage(100);
            timer.x = counterNode.getPosition().x;
            timer.y = counterNode.getPosition().y;
            timer.setScale(counterNode.getScaleX(), counterNode.getScaleY());
            timer.setReverseProgress(true);
            timer.setName("progressTimer");
            timer.setVisible(false);
            node.addChild(timer);

            this.node_players[i] = {};
            this.node_players[i]=node;
            this.connectNode(node, this.node_players[i]);

            this.node_players[i].properties={};

            this.node_players[i].chips.text.setString("0");
            this.node_players[i].bet_chips.setVisible(false);
            this.node_players[i].empty_seat = CocosWidget.cloneNode(this.emptySeat_sample);
            this.node_players[i].empty_seat.setVisible(true);
            this.node_players[i].empty_seat.seatID = i;
            this.node_players[i].empty_seat.setPosition(this.node_players[i].getPosition().x-15, this.node_players[i].getPosition().y-55);
            this.node_players[i].setLocalZOrder(10);

            this.root_node.addChild(this.node_players[i].empty_seat, this.node_players[i].getLocalZOrder()-1);

            this.registerMouseEvent(this.node_players[i].empty_seat, function(node, mouseHitPoint){

                //2:要求入座 : 座位編號(u1)
                var msg = new MemoryStream();
                ProtocolBuilder.Encode_FromByte(msg, node.seatID);
                pokerPeer.getInstance().sendMessage(2, msg);
            });
        }

        this.dealer_icon = this.getNode("dealer");
        this.dealer_icon.setLocalZOrder(11);
        this.roundOver();
    },

    addPlayer:function(seatID, playerID){
        if(playerID ==0)
            return;
        var alias = PokerManager.getInstance().getSave(playerID).NickName;
        this.node_players[seatID].Text.setString(alias);
        this.node_players[seatID].setVisible(true);

        this.node_players[seatID].properties={};
        this.node_players[seatID].properties.playerID = playerID;
        this.node_players[seatID].properties.alias = alias;
        this.node_players[seatID].properties.chips = 0;
        this.node_players[seatID].properties.bet = 0;
        this.node_players[seatID].properties.node = this.node_players[seatID];
    },
    removePlayer:function(seatID, playerID){
        if(seatID ==0)
            return;
        if(playerID ==0)
            return;
        this.node_players[seatID].Text.setString("");
        this.node_players[seatID].setVisible(false);
    },

    setEmptySeat:function(visible){
        for(var i =1; i<this.node_players.length; i++)
            this.node_players[i].empty_seat.setVisible(visible);
    },

    setCountDown:function(playerID, seatID, remainSecs){
        this.node_players[seatID].progressTimer.setVisible(true);
        this.node_players[seatID].progressTimer.currentSec = remainSecs / 1000;
        this.node_players[seatID].progressTimer.totalSec = remainSecs / 1000;

        var percent = (this.node_players[seatID].progressTimer.currentSec / this.node_players[seatID].progressTimer.totalSec)*100;

        this.node_players[seatID].progressTimer.setPercentage(percent);

        //count event secs
        cc.director.getScheduler().schedule(
            function(){
                this.currentSec--;

                //set progress
                var percent = (this.currentSec / this.totalSec)*100;
                this.setPercentage(percent);

                if(this.currentSec<=0)
                    cc.director.getScheduler().unscheduleAllForTarget(this);
            },
            this.node_players[seatID].progressTimer, 1, remainSecs/1000 , 0, false
        )
    },

    getPlayer:function(seatID){
        return this.node_players[seatID].properties;
    },

    setBlind:function(bankSeatID, bigBlind, smallBlind){
        if(bankSeatID) {
            var position = this.node_players[bankSeatID].getPosition();

            position.x -= 94;
            position.y += 35;

            this.dealer_icon.setPosition(position);
            this.dealer_icon.setVisible(true);
        }
    },

    setAction:function(seatID, action, chips, bet, handCards){
        action = this.actionMap[action];

        this.node_players[seatID].properties.action = action;

        if(chips!=null)
            this.node_players[seatID].properties.chips = parseInt(chips);

        if((bet!=null) && (bet>0))
            this.node_players[seatID].properties.bet = parseInt(bet);

        if(handCards)
            this.node_players[seatID].properties.handCards = handCards;

        this.node_players[seatID].progressTimer.setVisible(false);
        cc.director.getScheduler().unscheduleAllForTarget(this.node_players[seatID].progressTimer);

        if (this.node_players[seatID].properties.action){
            if(this.node_players[seatID].properties.action==this.actionMap[1])
                this.node_players[seatID].bg.setVisible(false);

            this.node_players[seatID].action.Text.setString(this.node_players[seatID].properties.action);
            this.node_players[seatID].action.setVisible(true);
        }

        this.node_players[seatID].chips.text.setString(this.node_players[seatID].properties.chips.toString());
        this.node_players[seatID].bet_chips.Text.setString(this.node_players[seatID].properties.bet);

        this.node_players[seatID].chips.setVisible(true);

        if(bet!=null)
            this.node_players[seatID].bet_chips.setVisible(true);


        if((handCards!=null)&&(handCards.length>0)) {
            var card1Node=PokerCards.getInstance().popCard(handCards[0]);
            var card2Node=PokerCards.getInstance().popCard(handCards[1]);

            this.node_players[seatID].hand_card.hand_card1.setTexture(card1Node.getTexture());
            this.node_players[seatID].hand_card.hand_card2.setTexture(card2Node.getTexture());
            this.node_players[seatID].hand_card.setVisible(true);
        }
    },

    roundOver:function(){
        for(var i =1; i<this.node_players.length; i++) {
            this.node_players[i].action.setVisible(false);
            this.node_players[i].hand_card.setVisible(false);
            this.node_players[i].bet_chips.setVisible(false);
            this.node_players[i].bg.setVisible(true);
            this.node_players[i].progressTimer.setVisible(false);

            this.node_players[i].properties.bet = 0;
        }

        this.dealer_icon.setVisible(false);
    }
});

Panel_Table = gameLayer.extend({
    publicCards:[],
    pools:[],
    bet_chips_sample:[],  //key : chip values, value:chip sprite

    panel_betAction:null,

    ctor:function(rootNode){
        this._super(rootNode);

        var i =0;
        var nodeName;
        var node
        for(i=1; i<=9; i++) {
            nodeName=String.format("pool{0}", i);
            node = this.getNode(nodeName);
            node.setVisible(false);
            this.pools[i]={};
            this.pools[i].position = node.getPosition();
            this.pools[i].scale = new cc.Point(node.getScaleX(), node.getScaleY());
            this.pools[i].parent = node.getParent();
            node.removeFromParent(true);
        }

        for(i=1; i<=5; i++){
            nodeName=String.format("public_cards/card{0}", i);
            node = this.getNode(nodeName);
            node.setVisible(false);

            this.publicCards[i] ={};
            this.publicCards[i].position = node.getPosition();
            this.publicCards[i].scale = new cc.Point(node.getScaleX(), node.getScaleY());
            this.publicCards[i].node = node;
        }

        this.setupBetChipSample();

        this.registerMouseEvent(this.getNode("back_off"), function(node, mouseHitPoint){
            //6:要求返回大廳
            var Message = new MemoryStream();
            pokerPeer.getInstance().sendMessage(6, Message);
        });

        this.panel_betAction =this.getNode("bet_action");
        this.connectNode(this.panel_betAction, this.panel_betAction);
        this.panel_betAction.setLocalZOrder(12);
        this.panel_betAction.setVisible(false);

        this.panel_betAction.slider.addEventListener(
            function(sender, type) {
                if(type==ccui.Slider.EVENT_PERCENT_CHANGED)
                    this.onSliderChange();
            }
        , this);


        //bet action =======================================

        this.registerMouseEvent(this.panel_betAction.btn_raise_up, function(node, mouseHitPoint){
            var percentage = this.panel_betAction.slider.getPercent();

            if(percentage>=100)
                return;

            this.panel_betAction.slider.setPercent(percentage+1);
            this.onSliderChange();
        });

        this.registerMouseEvent(this.panel_betAction.btn_raise_down, function(node, mouseHitPoint){
            var percentage = this.panel_betAction.slider.getPercent();

            if(percentage<=0)
                return;

            this.panel_betAction.slider.setPercent(percentage-1);
            this.onSliderChange();
        });

        this.registerMouseEvent(this.panel_betAction.btn_raise_confirm, function(node, mouseHitPoint){
            //4:要求下注 : 下注動作(1) + 下注籌碼(4)
            //                Fold:1
            //                Allin:2
            //                Check:3
            //                Raise:4

            var betValue = parseInt(this.panel_betAction.raise_text.getString());

            var action = BetActoin.Raise;

            if(betValue <=0)
                action = BetActoin.Check;

            if(betValue >= PokerManager.getInstance().getCurrentPlayer().chips)
                action = BetActoin.Allin;

            var msg = new MemoryStream();
            ProtocolBuilder.Encode_FromByte(msg, action);
            ProtocolBuilder.Encode_FromInt(msg, betValue);
            pokerPeer.getInstance().sendMessage(4, msg);
        });

        this.registerMouseEvent(this.panel_betAction.btn_raise_cancel, function(node, mouseHitPoint){
            //4:要求下注 : 下注動作(1) + 下注籌碼(4)
            //                Fold:1
            //                Allin:2
            //                Check:3
            //                Raise:4
            var msg = new MemoryStream();
            ProtocolBuilder.Encode_FromByte(msg, BetActoin.Fold);
            ProtocolBuilder.Encode_FromInt(msg, 0);
            pokerPeer.getInstance().sendMessage(4, msg);
        });

        //===================================================
    },

    onSliderChange:function(){
        var minBetValue = PokerManager.getInstance().getBlind().bigBlind.value;

        if (PokerManager.getInstance().getPublicCard.length<=0)
            MinRaiseValue = PokerManager.getInstance().getBlind().bigBlind.value * 2;

        if (PokerManager.getInstance().getBlind().highestBet.value > PokerManager.getInstance().getCurrentPlayer().bet) {
            var totalRequireBetValue = PokerManager.getInstance().getBlind().highestBet.value + (PokerManager.getInstance().getBlind().bigBlind.value * 2);
            MinRaiseValue = totalRequireBetValue - PokerManager.getInstance().getCurrentPlayer().bet;
        }

        if(MinRaiseValue >= PokerManager.getInstance().getCurrentPlayer().chips)
            MinRaiseValue = PokerManager.getInstance().getCurrentPlayer().chips;

        this.panel_betAction.raise_text.setString(MinRaiseValue.toString());

        var percentage = this.panel_betAction.slider.getPercent() / 100;
        var maxChips = PokerManager.getInstance().getCurrentPlayer().chips;

        var raiseValue = Math.floor(maxChips * percentage);

        if(raiseValue<MinRaiseValue)
            return;

        this.panel_betAction.raise_text.setString(raiseValue);
    },

    setBetPanel:function(visible){
        this.panel_betAction.setVisible(visible);

        if(visible) {
            this.panel_betAction.slider.setPercent(0);
            this.onSliderChange();
        }
    },

    setupBetChipSample:function(){
        var sampleNode = this.getNode("/pools/sample");
        var children = sampleNode.getChildren();
        for(var i =0; i<children.length; i++)
            CocosWidget.removeRedundantSuffix(children[i], "_");

        var node_bet_chips={};
        this.connectNode(this.getNode("/pools/sample"), node_bet_chips);

        this.bet_chips_sample.push({id:1, node:node_bet_chips.chip0001});
        this.bet_chips_sample.push({id:5, node:node_bet_chips.chip0005});
        this.bet_chips_sample.push({id:25, node:node_bet_chips.chip0025});
        this.bet_chips_sample.push({id:100, node:node_bet_chips.chip0100});
        this.bet_chips_sample.push({id:500, node:node_bet_chips.chip0500});
        this.bet_chips_sample.push({id:1000, node:node_bet_chips.chip1000});
        this.bet_chips_sample.push({id:100000000, node:node_bet_chips.chip100000000});

        this.bet_chips_sample.push({id:25000, node:node_bet_chips.chip25000});
        this.bet_chips_sample.push({id:5000, node:node_bet_chips.chip5000});
        this.bet_chips_sample.push({id:100000, node:node_bet_chips.chip100000});
        this.bet_chips_sample.push({id:500000, node:node_bet_chips.chip500000});

        this.bet_chips_sample.sort(function(item1, item2){return parseInt(item1.id - item2.id)});
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

    showWinningsAnim:function(PotNum, destination){
        var action = new cc.Sequence(
            new cc.MoveTo(0.5, destination),
            new cc.MoveTo(0.3, destination),
            new cc.CallFunc(function(){
                this.setVisible(false);
            }.bind(this.pools[PotNum].node))
        );

        this.pools[PotNum].node.runAction(action);
    },

    addPublicCard:function(order, cardNum){
        var cardNode = PokerCards.getInstance().popCard(cardNum);
        this.publicCards[order].node.setTexture(cardNode.getTexture());
        this.publicCards[order].node.setVisible(true);
    },

    setPool:function(poolID, value){
        var node = this.getChipStack(value);
        node.setPosition(this.pools[poolID].position);
        this.pools[poolID].parent.addChild(node);
        this.pools[poolID].node = node;
    },

    clearPool:function(){
        for(i =1; i<this.pools.length; i++)
            this.pools[i].parent.removeAllChildren();
    },

    clearTable:function(){
        var i;
        for(i =1; i<this.publicCards.length; i++)
            this.publicCards[i].node.setVisible(false);

        this.clearPool();
        this.panel_betAction.setVisible(false);
    }
});
