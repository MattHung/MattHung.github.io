/**
 * Created by matt1201 on 2016/3/22.
 */

var MaxBetAreaID=5;

var InnfoPanel = function(){
    this.gameCodeName="";		//房間名稱
    this.dealerName="";		    //荷官名
    this.roundNo="";			//靴局號
    this.roundSerial="";		//局號
    this.userName="";           //會員帳號
    this.credit=0;  	        // 該用戶餘額

    this.UI = {};

    this.updateData = function(data){
        var properties_count = Object.keys(this).length;
        for(var field in this)
            if(data.hasOwnProperty(field))
                this[field] = data[field];
        this.updateUI();
    },

        this.setUI_RoundNO = function(label){
            this.UI.RoundNO = label;
            this.UI.RoundNO.setTextAreaSize(new cc.Size(500, 28));
        },

        this.updateUI = function(){
            var round_text = String.format("{0}{1} {2}", "局号", this.roundNo, this.roundSerial);
            this.UI.RoundNO.setString(round_text);
        }
};


poker_cards=function(){
    var cards={};
    function addCard(name, sprite){
        this.cards[name]=sprite;
    }

    return{
        cards:cards,
        addCard:addCard
    }
};

var ShowCardAreaID ={
    player_A:"peek_player_a",
    player_B:"peek_player_b",
    player_C:"peek_player_c",

    banker_A:"peek_banker_b",
    banker_B:"peek_banker_a",
    banker_C:"peek_banker_c"
};

var TableStatus = {
    Betting:0,
    WaitingNext:1,
    Dealing:2
};

VideoTableBase=cc.Class.extend({
    poker_cards:null,
    panel_BtnControl:null,
    panel_ChipSelector:null,
    panel_Peek:null,
    panel_BetArea:null,
    panel_Counter:null,
    panel_Messages:null,

    infoPanel: null,
    currentBetValue:{},
    currentStatus:TableStatus.WaitingNext,

    ctor:function(){
        this.poker_cards=new poker_cards();
    },

    update:function(dt){
        this.infoPanel.updateUI();
    },

    setPanel_Info:function(root_node){
        this.infoPanel = new InnfoPanel();
        this.infoPanel.setUI_RoundNO(CocosWidget.getNode(root_node, "/sn"));

        MediaData.getInstance().OnStatusUpdate = function (status)
        {
            var layer = SceneManger.getInstance().findSpecifyScene(MainScene).main_layer;
            layer.table.infoPanel.updateData(status);
            layer.table.updateStatus(status);
        };
    },

    setPanel_BtnControl:function(root_node)
    {
        this.panel_BtnControl=new UIPanels.Btn_Control(root_node,
            function(){
                var bet_value=this.panel_ChipSelector.select_chip_value;
                if(bet_value==0)
                    return;

                this.placeBet(this.currentBetValue);
                this.currentBetValue = {};
                this.panel_BetArea.clearPlaceBet();
            }.bind(this),
            function(){
                this.currentBetValue = {};
                this.panel_BetArea.clearPlaceBet();
            }.bind(this)
        )
    },

    setPanel_Chips:function(root_node)
    {
        this.panel_ChipSelector = new UIPanels.ChipSelector(root_node);
    },

    setPanel_Peek:function(root_node)
    {
        this.panel_Peek = new UIPanels.Peek(root_node);
    },

    setPanel_BetArea:function(root_node)
    {
        this.panel_BetArea = new UIPanels.BetArea(root_node);
        this.panel_BetArea.setPlaceBetEvent(
            function(area_id, mouseHitPoint){
                var chipValue = this.panel_ChipSelector.select_chip_value;
                if(chipValue==0)
                    return;

                if(this.currentStatus != TableStatus.Betting)
                    return;

                if(this.currentBetValue[area_id]==undefined)
                    this.currentBetValue[area_id]=0;

                this.currentBetValue[area_id] +=chipValue;
                this.panel_BetArea.showPlaceBet(area_id, this.currentBetValue[area_id], mouseHitPoint)

            }.bind(this)
        );
    },

    setPanel_Counter:function(root_node)
    {
        this.panel_Counter = new UIPanels.Counter(root_node);
    },

    setPanel_Messages:function(root_node)
    {
        this.panel_Messages = new UIPanels.Messages(root_node);
    },

    loadAllCards:function(parent_node){
        var card_sprites=parent_node.getChildren();

        for(var i=0; i<card_sprites.length; i++)
        {
            var name_prefix="";
            var card_name =card_sprites[i].getName();
            var num = parseInt(card_name.substring(card_name.lastIndexOf("_") + 1, card_name.length));

            if(card_name.indexOf("pic_poker_clubs")>-1)
                name_prefix = "C";
            if(card_name.indexOf("pic_poker_diamonds")>-1)
                name_prefix = "D";
            if(card_name.indexOf("pic_poker_heart")>-1)
                name_prefix = "H";
            if(card_name.indexOf("pic_poker_spades")>-1)
                name_prefix = "S";

            if(name_prefix!="")
                this.poker_cards.addCard(String.format("{0}.{1}", name_prefix, num), card_sprites[i]);
        }
    },

    processMessage_OnVtableUpdate:function(status){
        this.panel_BetArea.clearTableBet();

        for(var i =0 ;i<7; i++){
            var playerInfo =status[i];

            var userID = playerInfo.userID;
            var userName = playerInfo.userName;

            var totalB1 = playerInfo.totalB1;
            var totalB2 = playerInfo.totalB2;
            var totalB3 = playerInfo.totalB3;
            var totalB4 = playerInfo.totalB4;
            var totalB5 = playerInfo.totalB5;

            this.panel_BetArea.showTableBet(userName, i, [totalB1, totalB2, totalB3, totalB4, totalB5]);
        }
    },

    processMessage_OnUpdate:function(status){
        if(status.poker){
            var cards=status.poker.split(",");

            var hasCard=false;

            for(var i =0; i<cards.length; i++)
            if(cards[i]!="") {
                hasCard = true;
                break;
            }

            if(!hasCard)
                this.panel_Peek.clear();

            this.showCard(cards[0], ShowCardAreaID.player_A);
            this.showCard(cards[1], ShowCardAreaID.banker_A);
            this.showCard(cards[2], ShowCardAreaID.player_B);
            this.showCard(cards[3], ShowCardAreaID.banker_B);
            this.showCard(cards[4], ShowCardAreaID.player_C);
            this.showCard(cards[5], ShowCardAreaID.banker_C);

            if(cards[0]!="")
                this.panel_Messages.showRedMessage("Show cards");
        }

        if(status.status){
            switch (status.status){
                case "cleartable":
                    this.clear();
                    break;
                case "waiting":
                    this.currentStatus = TableStatus.WaitingNext;
                    if(status.result){
                        //this.panel_BtnControl.setVisible(false);
                        var result = this.getResultArea(status.result);
                        this.flickerBetArea(result);

                        //close peek panel after 4s
                        cc.director.getScheduler().schedule(
                            function(){
                                this.panel_Peek.clear();
                            }.bind(this),
                            this,
                            0,
                            1,
                            4,
                            false,
                            this.instanceId
                        );

                        var player_num1 =this.panel_Peek.showCard[ShowCardAreaID.player_A].Num?this.panel_Peek.showCard[ShowCardAreaID.player_A].Num():0;
                        var player_num2 =this.panel_Peek.showCard[ShowCardAreaID.player_B].Num?this.panel_Peek.showCard[ShowCardAreaID.player_B].Num():0;
                        var player_num3 =this.panel_Peek.showCard[ShowCardAreaID.player_C].Num?this.panel_Peek.showCard[ShowCardAreaID.player_C].Num():0;

                        var banker_num1 =this.panel_Peek.showCard[ShowCardAreaID.banker_A].Num?this.panel_Peek.showCard[ShowCardAreaID.banker_A].Num():0;
                        var banker_num2 =this.panel_Peek.showCard[ShowCardAreaID.banker_B].Num?this.panel_Peek.showCard[ShowCardAreaID.banker_B].Num():0;
                        var banker_num3 =this.panel_Peek.showCard[ShowCardAreaID.banker_C].Num?this.panel_Peek.showCard[ShowCardAreaID.banker_C].Num():0;

                        var sum_player = 0;
                        var sum_banker = 0;

                        if(player_num1<10)sum_player+=player_num1;
                        if(player_num2<10)sum_player+=player_num2;
                        if(player_num3<10)sum_player+=player_num3;

                        if(banker_num1<10)sum_banker+=banker_num1;
                        if(banker_num2<10)sum_banker+=banker_num2;
                        if(banker_num3<10)sum_banker+=banker_num3;

                        this.panel_Peek.updateScore(sum_player, sum_banker);
                        this.panel_Counter.setVisible(false);
                    }
                    break;
            }
        }

        if(status.countDown)
        if(!status.dealerName)
        {
            this.panel_Counter.setSeconds(status.countDown);
            if(status.countDown>0)
                this.currentStatus = TableStatus.Betting;
            if(status.countDown ==25) {
                this.currentStatus = TableStatus.Betting;
                this.panel_BtnControl.setVisible(true);
                this.panel_Messages.showGreenMessage("plz place bets.");
            }
        }

        if((status.hasOwnProperty("payoff"))&&(status.payoff!=0)){
            switch(status.payoff>0){
                case true:
                    this.panel_Messages.showWinMessage(String.format("You win {0}", status.payoff));
                    break;
                case false:
                    this.panel_Messages.showLoseMessage(String.format("You lose {0}", status.payoff));
                    break;
            }
        }

        if(status.hasOwnProperty("dealing"))
            this.currentStatus=TableStatus.Dealing;
    },

    updateStatus:function(status){
        switch(status.action)
        {
            case "onPoolInfo":
                var poolArea_Banker =status.b1;
                var poolArea_Player =status.b2;
                var poolArea_Tie =status.b3;

                var poolArea_BankerPair =status.b4;
                var poolArea_PlayerPair =status.b5;
                break;
        }

        switch(status.action) {
            case "onBet":
                if(status.runEor) {
                    this.panel_Messages.showYellowMessage(status.runEor);
                    break;
                }

                var totalBet=0;

                for(var i=1; i<=5; i++)
                {
                    var key = String.format("b{0}", i);
                    if(status.hasOwnProperty(key)) {
                        totalBet += parseInt(status[key]);
                    }
                }

                this.panel_Messages.showInfoMessage(String.format("Total bet amount {0}", totalBet));
                break;
            case "onVtableUpdate":
                this.processMessage_OnVtableUpdate(status);
                break;
            default:
                this.processMessage_OnUpdate(status);
                break;
        }
    },

    clear:function(){
        this.currentBetValue = {};
        this.panel_BetArea.clear();
    },

    flickerBetArea:function(area){
        this.panel_BetArea.flickerBetArea(area);
    },

    getResultArea:function(Id){
        var StateID= [];

        //下注區定義： * 目前不使用
        //1, '百家樂 莊'
        //2, '百家樂 閑'
        //3, '百家樂 和'
        //4, '百家樂 莊對'
        //5, '百家樂 閑對'
        //6, '百家樂 大'
        //7, '百家樂 小'
        //*8 莊單
        //*9 莊雙
        //*10 閒單
        //*11 閒雙
        //12 任意對子
        //13 完美對子

        //playerBingo	pairPlayerBingo	tieBingo	pairBankerBingo	bankerBingo	moreBingo	lessBingo
        //2		6		7		5		1		3		4
        //2		5		3		4		1		6		7

        // 8:banker odd
        // 9:banker even
        // 10:player odd
        // 11 player even

        StateID[1] = [1, 6];
        StateID[2] = [1,6,4,12];
        StateID[3] =[5,1,6,12];
        StateID[4] = [5,4,1,6,12];
        StateID[5] = [2,6];
        StateID[6] = [2, 4, 6,12];
        StateID[7] = [2, 5,6,12];
        StateID[8] = [2, 5, 4,6,12];
        StateID[9] = [3, 6];
        StateID[10] = [3, 4, 6,12];
        StateID[11] = [5, 3, 6,12];
        StateID[12] = [5, 3, 4,6,12];
        StateID[13] = [1, 7];
        StateID[14] = [4, 1, 7,12];
        StateID[15] = [5, 1, 7,12];
        StateID[16] = [5, 4, 1, 7,12];
        StateID[17] = [2, 7];
        StateID[18] = [2, 4, 7,12];
        StateID[19] = [2, 5, 7,12];
        StateID[20] = [2, 5, 4, 7,12];
        StateID[21] = [3, 7];
        StateID[22] = [3, 4, 7,12];
        StateID[23] = [5, 3, 7,12];
        StateID[24] = [5, 3, 4, 7,12];

        // 轉換成舊stateID;
        var oldStateID = Id % 24;
        if (oldStateID == 0) {
            oldStateID = 24;
        }
        // 計算莊閒單雙
        /*var  index:int = Math.floor(Id / 24);

         // Banker and Player Even and Odd area
         var bpeo:Array;
         switch (index) {
         case 0:
         bpeo = [8, 10];//莊單閒單
         break;
         case 1:
         bpeo = [8, 11];//莊單閒雙
         break;
         case 2:
         bpeo = [9, 10];//莊雙閒單
         break;
         case 3:
         case 4:
         bpeo = [9, 11];//莊雙閒雙
         break;

         }
         // 將原本的結果區和新的單雙結果區合併
         var resultArea:Array = StateID[oldStateID].concat(bpeo);
         */
        var resultArea = StateID[oldStateID];
        if (Id > 96)
            resultArea.push(13);

        return resultArea;
    },

    showCard:function(card_name, showCardAreaID){
        var card = null;

        if(card_name==="")
            return;

        card = cc.Sprite.create(this.poker_cards.cards[card_name].getTexture());
        this.panel_Peek.show(showCardAreaID, card_name, card);
    },

    bet_bs:0,

    placeBet:function(betInfo) {
        var now = new Date();
        var send_obj=
        {
            action:"bet",
            roundSerial: this.infoPanel.roundSerial,
            ts: String.format("{0}/{1}/{2}-{3}:{4}:{5}", now.getFullYear(), now.getMonth(), now.getDate(),
                                                         now.getHours(), now.getMinutes(), now.getSeconds()),
            bs: this.bet_bs++
        };

        for(var i=1; i<=MaxBetAreaID; i++){
            var key=String.format("b{0}", i);
            if(betInfo.hasOwnProperty(key))
                send_obj[key] = betInfo[key];
        }

        MediaData.getInstance().Send(send_obj);
    }
});

