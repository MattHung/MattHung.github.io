/**
 * Created by Matt Hung on 2016/4/4.
 */

TableBase=gameLayer.extend({
    _tableID:0,
    _seatID:0,
    UIPanel_Table:null,
    UIPanel_Players:null,

    Blind:{},
    PublicCard:[],

    ctor:function(tableID){
        this._tableID = tableID;
        this._super(res.MainScene_json);

        CocosWidget.eventRegister.getInstance().setRootNode(this.getNode("Scene"));

        this.UIPanel_Table = new Panel_Table(this.getNode("Scene"));
        this.UIPanel_Players = new Panel_Players(this.getNode("Scene"));
    },

    getTableID:function(){
        return this._tableID;
    },

    getSeatID:function(){
        return this._seatID;
    },

    getPlayer:function(seatID){
        return this.UIPanel_Players.getPlayer(seatID);
    },

    addPlayer:function(seatID, playerID){
        this.UIPanel_Players.addPlayer(seatID, playerID);
    },
    removePlayer:function(seatID, playerID){
        this.UIPanel_Players.removePlayer(seatID, playerID);

        if(seatID>0)
        if(seatID==this._seatID)
            this.UIPanel_Players.setEmptySeat(true);
    },

    onTakeSeat : function(seatID){
        this._seatID = seatID;

        this.UIPanel_Players.setEmptySeat(false);

        var buyInValue = PokerManager.getInstance().getTableSetting(this.getTableID()).min_buyin;

        //3:兌換籌碼 : 數量(4)
        var msg = new MemoryStream();
        ProtocolBuilder.Encode_FromInt(msg, buyInValue);
        pokerPeer.getInstance().sendMessage(3, msg);
    },

    setBlind:function(bankSeatID, bigBlind, smallBlind, value_bigBlind, value_smallBlind){
        this.UIPanel_Players.setBlind(bankSeatID, bigBlind, smallBlind);

        if(!this.Blind.bigBlind)this.Blind.bigBlind={};
        if(!this.Blind.smallBlind)this.Blind.smallBlind={};

        this.Blind.bankSeatID=bankSeatID;
        if(bigBlind)this.Blind.bigBlind.seatID=bigBlind;
        if(value_bigBlind)this.Blind.bigBlind.value = value_bigBlind;

        if(smallBlind)this.Blind.smallBlind.seatID=smallBlind;
        if(value_smallBlind)this.Blind.smallBlind.value = value_smallBlind;
    },

    addPublicCard:function(order, cardNum){
        this.UIPanel_Table.addPublicCard(order, cardNum);
        this.PublicCard.push(cardNum);
    },

    setCountDown:function(playerID, seatID, remainSecs){
        this.UIPanel_Players.setCountDown(playerID, seatID, remainSecs);

        if(seatID==this._seatID)
            this.UIPanel_Table.setBetPanel(true);
    },

    setPlayer:function(seatID, action, chips, bet, handCards){
        this.UIPanel_Players.setAction(seatID, action, chips, bet, handCards);

        this.UIPanel_Table.setBetPanel(false);

        if((bet) && (bet>0))
        {
            if(!this.Blind.highestBet)
                this.Blind.highestBet={seatID:0, value:0};

            if(bet> this.Blind.highestBet.value){
                this.Blind.highestBet.seatID = seatID;
                this.Blind.highestBet.value = bet;
            }
        }
    },

    doAction:function(seatID, action, chips, bet){

        var chipValue =this.getPlayer(seatID).chips;
        var betValue = null;

        if(isNumeric(chips))
            chipValue += chips;

        if(isNumeric(bet)){
            chipValue -= bet;
            betValue = this.getPlayer(seatID).bet + bet;
        }

        this.setPlayer(seatID, action, chipValue, betValue, null);
    },

    setPool:function(poolID, value){
        this.UIPanel_Table.setPool(poolID, value);
    },
    clearPool:function(){
        this.UIPanel_Table.clearPool();
    },

    giveWinnings:function(PotNum, SeatID, Bonus){
        var destination = this.getPlayer(SeatID).node.bet_chips.convertToWorldSpace(new cc.Point(0, 0));
        this.UIPanel_Table.showWinningsAnim(PotNum, destination);

        this.doAction(SeatID, null, Bonus, null, null);
    },

    roundOver:function(){
        this.UIPanel_Players.roundOver();
        this.UIPanel_Table.clearTable();
        this.PublicCard=[];
        this.Blind.highestBet=null;
    }
});