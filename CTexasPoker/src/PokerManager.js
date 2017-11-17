/**
 * Created by LE  Matt Hung on 2016/4/4.
 */

BetActoin ={
    Fold:1,
    Allin:2,
    Check:3,
    Raise:4
};

PokerManager = function(){
    this.FADEIN_SECS = 3;
    this.callback_onCreateTable =null;
    this.currentTableType = 1; // normal table
    this.currentTable = null;
    this._equestTableListTick=new Date().getTime();

    this.OnLogin = null;
    this.OnEnterGame = null;
    this.OnSystemMessage = null;
    this.OnResponseTableList = null;

    this._messageLayer = new MessageLayer();
    this._tableSettings=[];
    this._saves={};

    cc.director.getScheduler().scheduleUpdate(this);

    cc.loader.loadJson("res/game_settings/tableDefine.json", function(error, data){
        if(error) {
            console.log(error);
            return;
        }

        for(var i =0; i<data.rows.length; i++)
            this._tableSettings.push(data.rows[i]);

    }.bind(this));

    this.connect = function(ws_url, onOpen, onClose){
        pokerPeer.getInstance().connect(ws_url);

        pokerPeer.getInstance().setCallback_onOpen(onOpen);
        pokerPeer.getInstance().setCallback_onClose(onClose);
    }.bind(this);

    this.showMessage = function(text) {
        var layer = cc.director.getRunningScene().getChildByName("messageLayer");
        if (!layer) {
            layer = new MessageLayer();
            cc.director.getRunningScene().addChild(layer);
        }

        layer.showMessage(text);

    }.bind(this);

    this.getCurrentPlayer = function(){
        if(!this.currentTable)
            return null;
        if(this.currentTable.getSeatID()>0)
            return this.currentTable.getPlayer(this.currentTable.getSeatID());

    }.bind(this);

    this.setSave = function(playerID, save){
        this._saves[playerID] = save;
    }.bind(this);

    this.getSave = function(playerID){
        return this._saves[playerID];
    }.bind(this);

    this.setCallback = function(fun_name, callback, instance){
        if(instance==null)
            instance =pokerPeer.getInstance();

        instance[fun_name] = callback;

    }.bind(this);

    this.update = function(dt){

    }.bind(this);

    this.getTableSetting = function(tableID){
        for(var i = this._tableSettings.length-1; i>=0; i--)
        if(tableID>= this._tableSettings[i].table_range_min)
            return this._tableSettings[i];

        return null;
    }.bind(this);

    this.requestTableList = function(){
        if (CocosWidget.getElapseTick(this._equestTableListTick) < 1000)
            return;
        this._equestTableListTick = new Date().getTime();

        //0:要求牌桌資訊: 桌次種類(1)
        var Message = new MemoryStream();
        ProtocolBuilder.Encode_FromByte(Message, this.currentTableType);
        pokerPeer.getInstance().sendMessage(0, Message);
    }.bind(this);

    this.onGotTableList=function(tableInfo){
        if(this.OnResponseTableList)
            this.OnResponseTableList(tableInfo);

    }.bind(this);

    this.enterTable = function(tableID){
        this.currentTable= new TableBase(tableID);
        this.callback_onCreateTable();
    }.bind(this);

    this.onTakeSeat = function(seatID){
        if(!this.currentTable)
            return;

        this.currentTable.onTakeSeat(seatID);
    }.bind(this);

    this.addPlayer=function(seatID, playerID){
        this.currentTable.addPlayer(seatID, playerID);
    }.bind(this);

    this.leaveTable=function(seatID, playerID){
        this.removePlayer(seatID, playerID);

        if(playerID==pokerPeer.getInstance().getPlayerID()){
            this.currentTable = null;
            var nextScene = new LobbyScene();
            cc.director.runScene(new cc.TransitionFade(pokerPeer.getInstance().FADEIN_SECS, nextScene));
        }
    }.bind(this);

    this.removePlayer=function(seatID, playerID){
        this.currentTable.removePlayer(seatID, playerID);
    }.bind(this);

    this.setBlind=function(bankSeatID, bigBlind, smallBlind, value_bigBlind, value_smallBlind)
    {
        this.currentTable.setBlind(bankSeatID, bigBlind, smallBlind, value_bigBlind, value_smallBlind);
    }.bind(this);

    this.getBlind = function(){
        return this.currentTable.Blind;
    }.bind(this);

    this.getPublicCard = function(){
        return this.currentTable.PublicCard;
    }.bind(this);

    this.addPublicCard=function(order, cardNum){
        this.currentTable.addPublicCard(order, cardNum);
    }.bind(this);

    this.getPlayer = function(seatID){
        return this.currentTable.getPlayer(seatID);
    }.bind(this);

    this.setPlayer=function(seatID, action, chips, bet, handCards){
        this.currentTable.setPlayer(seatID, action, chips, bet, handCards);
    }.bind(this);

    this.doAction = function(seatID, action, chips, bet){
        this.currentTable.doAction(seatID, action, chips, bet);
    }.bind(this);

    this.setCountDown = function(playerID, seatID, remainSecs){
        this.currentTable.setCountDown(playerID, seatID, remainSecs);
    }.bind(this);

    this.clearPool=function(){
        this.currentTable.clearPool();
    }.bind(this);

    this.setPool=function(poolID, value){
        this.currentTable.setPool(poolID, value);
    }.bind(this);

    this.giveWinnings=function(PotNum, SeatID, Bonus){
        this.currentTable.giveWinnings(PotNum, SeatID, Bonus);
    }.bind(this);

    this.roundOver=function(){
        this.currentTable.roundOver();
    }.bind(this);
};

PokerManager._instance = null;

PokerManager.getInstance =function(){
    if(!PokerManager._instance) {
        PokerManager._instance = new PokerManager();
    }

    return PokerManager._instance;
};
