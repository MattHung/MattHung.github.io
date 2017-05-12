/**
 * Created by nora_wang on 2016/11/24.
 */
var ui_Msg = gameLayer.extend({
    _room: null,
    _AwardTittle: {},
    _text: null,
    _clip_node: null,
    _Sprite: null,
    _awardNode: null,
    _LimitNode:{},
    _btnAward: null,
    _btnLimit:null,
    _isOpen: true,
    _CheckBtn:true,
    _LimitTitle:null,
    _Other: {},
    _GameInfo: {},
    _winners: {},
    _rank:{},
    _playerBetAmount: 0,
    _WinMoney: 0,
    _Money: 0,
    _isBet: false,
    _isShowResult: false,  
     Lang_en:0,
    ctor: function (SceneNode, room) {
        this._super(SceneNode);
        this._room = room;

        this._AwardTittle={};
        this._Other={};
        this._GameInfo={};
        this._winners ={};
        this._LimitNode={};
        this._rank={};

        this.initMsgPushBar();
        this.initLoadUI();
        this.getNode("Gambler_MainMsg_Node").addChild(this);

        this._GameInfo.UserID= AccountCenter.getInstance().getUserID();
    },

    initMsgPushBar:function(){

        var initTextPositionX =0;
        var initTextPositionY =130;
        var TextMoveToX=-317;
        var initText=250;


        if(language_manager.getInstance().getLanguage()==0){
            var s = "System notification:：Game maintenance time is every Friday AM 7:00.";
            this._text = new cc.LabelTTF(s,"Arial",12);
        }
        else
            var s = "系統公告：遊戲維護時間為每周AM 7:00。";
            (this._text = new cc.LabelTTF(s,"Arial",12));

        this._text.setPosition(initTextPositionX,initTextPositionY);
        this._text.setColor(cc.color(255,255,255,1));
        this._text.setAnchorPoint(0,0);

        this._Sprite = new cc.Sprite.create(res.ClippingNode_png);
        this._Sprite.setAnchorPoint(0,0);
        this._Sprite.setPosition(this._text.getPosition().x-20,initTextPositionY);
        this._clip_node = new cc.ClippingNode(this._Sprite);
        this._clip_node.setAlphaThreshold(0);
        this._clip_node.addChild(this._text);
        this.addChild(this._clip_node);

        var action =cc.repeatForever(cc.sequence(cc.moveTo(9,TextMoveToX,initTextPositionY),
                                     cc.place(initText,initTextPositionY)));
        this._text.runAction(action);


    },

    initLoadUI:function(){
        this._awardNode = this.getNode("Award_Node");
        this._LimitNode._litmitNode = this.getNode("Btn_Limit_Node");
        this._LimitNode._showLimitInfo = this.getNode("Gambler_MainMsg_Node/Btn_Limit_Node/LimitInfo_Node");
        this._LimitNode.SideBetMin = this._LimitNode._showLimitInfo.getChildByName("Min");
        this._LimitNode.SideBetMax = this._LimitNode._showLimitInfo.getChildByName("Max");
        this._LimitNode.SideBetPair = this._LimitNode._showLimitInfo.getChildByName("Pair");
        this._LimitNode.SideBetTie = this._LimitNode._showLimitInfo.getChildByName("Tie");
        this._LimitNode._litmitNode.setVisible(false);
        this._LimitNode._showLimitInfo.setVisible(false);
        this.GamblerInfoTittle();

        this._AwardTittle._Ranking = this.getNode("Award_Node/txt_Ranking");
        this._AwardTittle._Award = this.getNode("Award_Node/txt_Award");


        this._awardNode.setVisible(false);
        this._btnAward = this.getNode("Gambler_MainMsg_Node/btn_award_structure");
        this._btnLimit = this.getNode("Gambler_MainMsg_Node/Btn_Limit_Node/btn_Limit");
        this._Other.PicArrow = this.getNode("Gambler_MainMsg_Node/Btn_Limit_Node/pic_open");
        this._btnAward.imgover = this.getNode("Gambler_MainMsg_Node/btn_award_structure/Over");
        this._btnAward.imgover.setAnchorPoint(cc.p(0,0));
        this._btnAward.imgover.setPosition(0, 0);
        this._btnAward.imgover.setVisible(false);
        this._btnAward.imgdown = this.getNode("Gambler_MainMsg_Node/btn_award_structure/Down");
        this._btnAward.imgdown.setAnchorPoint(cc.p(0,0));
        this._btnAward.imgdown.setPosition(0, 0);
        this._btnAward.imgdown.setVisible(false);
        this._btnLimit.imgover = this.getNode("Gambler_MainMsg_Node/Btn_Limit_Node/btn_Limit/Over");
        this._btnLimit.imgover.setAnchorPoint(cc.p(0,0));
        this._btnLimit.imgover.setPosition(0, 0);
        this._btnLimit.imgover.setVisible(false);
        this._btnLimit.imgdown = this.getNode("Gambler_MainMsg_Node/Btn_Limit_Node/btn_Limit/Down");
        this._btnLimit.imgdown.setAnchorPoint(cc.p(0,0));
        this._btnLimit.imgdown.setPosition(0, 0);
        this._btnLimit.imgdown.setVisible(false);



        this.registerMouseEvent(this._btnAward,this.showAwardRanking.bind(this),null,
                this.enterAwardBtn.bind(this),
                function(node, mouseHitPoint){
                    this._btnAward.imgover.setVisible(false);
                }
        );
        this.registerMouseEvent(this._btnLimit,this.showLimitContext.bind(this),null,
            this.enterLimitBtn.bind(this),
            function(node, mouseHitPoint){
                this._btnLimit.imgover.setVisible(false);
            }
        );
    },


    enterAwardBtn:function(sender){
        this._btnAward.imgover.setVisible(true);
    },
    enterLimitBtn:function(sender){
        this._btnLimit.imgover.setVisible(true);
    },

    showLimitContext:function(){
        this._room.uiTableArea.hideQuickBet();
        if(this._CheckBtn==true){
            this._Other.PicArrow.setRotation(180);
            this._LimitNode._showLimitInfo.setVisible(true);
            this._btnLimit.imgover.setVisible(false);
            this._btnLimit.imgdown.setVisible(true);
            this._CheckBtn=false;
            this._awardNode.setVisible(false);
            this._btnAward.imgover.setVisible(false);
            this._btnAward.imgdown.setVisible(false);
            this._isOpen=true;
            return;
        }

        if(this._CheckBtn!=true) {
            this._Other.PicArrow.setRotation(0);
            this._LimitNode._showLimitInfo.setVisible(false);
            this._btnLimit.imgover.setVisible(false);
            this._btnLimit.imgdown.setVisible(false);
            this._CheckBtn=true;
            return;
        }


    },

    CheckWatcher:function(){
        if(this._room.checkOnSeat()==false){ //Watcher
            this._GameInfo.Promotion.setVisible(false); // 每桌晉級人數
            this._LimitNode._litmitNode.setVisible(true); //限額
            this._GameInfo.BetLimit.setVisible(false); //投注限額
            this._GameInfo.Balance.setVisible(true); //可用餘額
            this._GameInfo.TotalBet.setVisible(true);//投注金額

            //--------------------------------------------//
            this._GameInfo._Remainder.setPosition(cc.p(876,584)); //剩餘
            this._GameInfo.Balance.setString(language_manager.getInstance().getTextID(10) +"@#FFFF00"+"¥"+" "+AccountCenter.getInstance().getBalance());
            this._GameInfo.TotalBet.setString(language_manager.getInstance().getTextID(11)+"@#FFFF00"+"¥"+" "+this._playerBetAmount);
            this._GameInfo.Limit_Min.setString(this._room._roomMessage.minBet);
            this._GameInfo.Limit_Max.setString(this._room._roomMessage.maxBet);
            this._GameInfo.Limit_Pair.setString();
            this._GameInfo.Limit_Tie.setString();
            this._GameInfo.Limit_Min.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);
            this._GameInfo.Limit_Max.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);
            this._GameInfo.Limit_Pair.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);
            this._GameInfo.Limit_Tie.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);

        }
        else {
            this._GameInfo.Promotion.setVisible(true);
            this._LimitNode._litmitNode.setVisible(false);
            this._GameInfo.Balance.setVisible(false);
            this._GameInfo.TotalBet.setVisible(false);
            this._GameInfo.BetLimit.setVisible(true);
            //--------------------------------------------//
            this._GameInfo._Remainder.setPosition(cc.p(875,564));


        }
    },


    showAwardRanking: function () {
        this._room.uiTableArea.hideQuickBet();
        if(this._isOpen==true){
            this._awardNode.setVisible(true);
            this._btnAward.imgover.setVisible(false);
            this._btnAward.imgdown.setVisible(true);
            this._isOpen=false;
            this._Other.PicArrow.setRotation(0);
            this._LimitNode._showLimitInfo.setVisible(false);
            this._btnLimit.imgover.setVisible(false);
            this._btnLimit.imgdown.setVisible(false);
            this._CheckBtn=true;
            return;
        }
        if(this._isOpen!=true) {
            this._awardNode.setVisible(false);
            this._btnAward.imgover.setVisible(false);
            this._btnAward.imgdown.setVisible(false);
            this._isOpen=true;
            return;
        }
    },


    update:function(dt){
            this.CheckWatcher();
            var NowCycle  = this._room._roomMessage.turnCount+1;
            var Count = 22;

            this._AwardTittle._Ranking.setString(language_manager.getInstance().getTextID(82));
            this._AwardTittle._Ranking.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            this._AwardTittle._Award.setString(language_manager.getInstance().getTextID(83));
            this._AwardTittle._Award.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        //-----------------------------------------------------//
            for(var i=0;i< this._LimitTitle.getChildrenCount();i++){
                Count++;
                this._LimitTitle.children[i].setString(language_manager.getInstance().getTextID(Count));
            }
        //-----------------------------------------------------//
            this._GameInfo.Title.setString(language_manager.getInstance().getTextID(73)+(this._room._roomMessage.RegisterFee-this._room._roomMessage.Service_fee)+language_manager.getInstance().getTextID(31));
            this._GameInfo._BetLimit.setString(language_manager.getInstance().getTextID(21));

            this._GameInfo.NowCycle.setString("@#E7D8A5"+language_manager.getInstance().getTextID(42)+" "+"@#FFFFFF"+NowCycle+" "+"@#E7D8A5"+language_manager.getInstance().getTextID(43));

            this._GameInfo._Remainder.setString("@#E7D8A5"+language_manager.getInstance().getTextID(84)+"@#FFFFFF"+this._room._roomMessage.playerCount+" / " +"@#FFFFFF"+this._room._roomMessage.totalTickets);
            this._GameInfo.SessionID.setString("@#E7D8A5"+language_manager.getInstance().getTextID(75)+"@#FFFFFF"+(this._room._roomMessage.sessionID));
            this._GameInfo.Promotion.setString("@#E7D8A5"+language_manager.getInstance().getTextID(76)+"@#FFFFFF"+"3");
            this._GameInfo.BetLimit.setString("@#E7D8A5"+language_manager.getInstance().getTextID(48)+"@#FFFFFF"+this._room._roomMessage.minBet+" - "+this._room._roomMessage.maxBet);
            this._GameInfo.Dealer.setString("@#E7D8A5"+language_manager.getInstance().getTextID(77)+"@#FFFFFF"+this._room._roomMessage.DealerName);
            this._GameInfo.UserName.setString("@#E7D8A5"+language_manager.getInstance().getTextID(78)+"@#FFFFFF"+AccountCenter.getInstance().getUserName());
            this._GameInfo.TableRank.setString("@#E7D8A5"+language_manager.getInstance().getTextID(80));
            this._GameInfo._txt_Limit.setString(language_manager.getInstance().getTextID(163));
            //------------------------------------------//

            this._Other.No1.setString(this._room._roomMessage.rankReward[0]);
            this._Other.No2.setString("@#D2CDBA"+this._room._roomMessage.rankReward[1]);
            this._Other.No3.setString("@#DA7050"+this._room._roomMessage.rankReward[2]);
            this._Other.No1.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            this._Other.No2._text_richText_context.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            this._Other.No3._text_richText_context.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            this._Other.RankPool._text_richText_context.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            this._Other.RankPool.setString("@#E7D8A5"+language_manager.getInstance().getTextID(81));

            //-----------------------------------------//

        if(this._room.getShoeInfo()==null){

            this._GameInfo.RoundID.setString("@#E7D8A5"+language_manager.getInstance().getTextID(79)+"@#FFFFFF"+"0-0"+"  "+ this._room._roomMessage.sessionID);
        }
        else {
            this._GameInfo.RoundID.setString("@#E7D8A5"+language_manager.getInstance().getTextID(79)+"@#FFFFFF"+this._room.getShoeInfo()+"  "+ this._room._roomMessage.sessionID);
        }

       

        if (language_manager.getInstance().getLanguage() == this.Lang_en) {
            this._GameInfo.TotalCycle.setString("@#E7D8A5" + language_manager.getInstance().getTextID(124) + " " + "@#FFFFFF" + (this._room._roomMessage.totalTurn + 1) * 3 + " " + "@#E7D8A5" + language_manager.getInstance().getTextID(45) + "," +
                "@#FFFFFF" + (this._room._roomMessage.totalTurn + 1) + "@#E7D8A5" + language_manager.getInstance().getTextID(43) + "(" + "@#FFFFFF" + "3" + "@#E7D8A5" + language_manager.getInstance().getTextID(161) +
                "/" + language_manager.getInstance().getTextID(162) + ")");
        }
        else {
            this._GameInfo.TotalCycle.setString("@#E7D8A5" + language_manager.getInstance().getTextID(124) + " " + "@#FFFFFF" + (this._room._roomMessage.totalTurn + 1 ) * 3 + " " + "@#E7D8A5" + language_manager.getInstance().getTextID(45) + "，" +
                "@#FFFFFF" + (this._room._roomMessage.totalTurn + 1) + "@#E7D8A5" + language_manager.getInstance().getTextID(43) + "(" + "@#FFFFFF" + "3" + "@#E7D8A5" + language_manager.getInstance().getTextID(161) +
                "/" + language_manager.getInstance().getTextID(162) + ")");
        }       
        var RankBG_size =1.5;

        for (var i = 3; i < this._room._roomMessage.rankReward.length; i++) {
            this._rank["No"+(i + 1)].setString((i+1) +"                 " + this._room._roomMessage.rankReward[i]);
            this._Other.Bg.setScale(1.0,RankBG_size);
        }
        for( var j =3;j<this._room._roomMessage.rankReward.length-1;j++){
                RankBG_size+= 0.6;
                this._Other.Bg.setScale(1.0,RankBG_size);
        }

        this._LimitNode.SideBetMin.setString(this._room._SideBetLimit._BetMinLimit);
        this._LimitNode.SideBetMax.setString(this._room._SideBetLimit._BetMaxLimit);
        this._LimitNode.SideBetPair.setString(this._room._SideBetLimit._BetPair);
        this._LimitNode.SideBetTie.setString(this._room._SideBetLimit._BetTie);
    },


    setCountDownVisible:function(){
        cc.director.getScheduler().schedule(this.countdown,this,3,0,0,false,0);
    },


    countdown: function () {

        if (this._isBet || this._isShowResult)
            if (this._Other.TotalMoney)
                if (this._Other.TotalMoney.isVisible()) {
                    this._Other.TotalMoney.setVisible(false);

                    if (this._isBet)
                        this._isBet = false;
                    if (this._isShowResult)
                        this._isShowResult = false;

                }

    },

    GamblerInfoTittle:function(){
        this._LimitTitle = this.getNode("Gambler_MainMsg_Node/Btn_Limit_Node/Title_Node");
        this._GameInfo.Limit_Min = this.getNode("Gambler_MainMsg_Node/Btn_Limit_Node/LimitInfo_Node/Min");
        this._GameInfo.Limit_Max = this.getNode("Gambler_MainMsg_Node/Btn_Limit_Node/LimitInfo_Node/Max");
        this._GameInfo.Limit_Pair= this.getNode("Gambler_MainMsg_Node/Btn_Limit_Node/LimitInfo_Node/Pair");
        this._GameInfo.Limit_Tie = this.getNode("Gambler_MainMsg_Node/Btn_Limit_Node/LimitInfo_Node/Tie");

        this._GameInfo.Title = this.getNode("GameInfo_Node/Tittle");
        this._GameInfo._BetLimit =this.getNode("Gambler_MainMsg_Node/Btn_Limit_Node/BetLimit");
        this._GameInfo._BetLimit.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);


        this._GameInfo.SessionID = new CocosWidget.TextField();//比賽場號
        this._GameInfo.SessionID.setAnchorPoint(cc.p(0.5,0.5));
        this._GameInfo.SessionID.setFontSize(13);
        this._GameInfo.SessionID.setPosition(cc.p(865,651));
        this._GameInfo.SessionID.setSize(150,20);


        this._GameInfo.NowCycle =  new CocosWidget.TextField();//第N輪
        this._GameInfo.NowCycle.setAnchorPoint(cc.p(0.5,0.5));
        this._GameInfo.NowCycle.setFontSize(13);
        this._GameInfo.NowCycle.setPosition(cc.p(865,631));
        this._GameInfo.NowCycle.setSize(150,20);

        this._GameInfo.TotalCycle = new CocosWidget.TextField();//共N局，N輪(3局/輪)
        this._GameInfo.TotalCycle.setAnchorPoint(cc.p(0.5,0.5));
        this._GameInfo.TotalCycle.setFontSize(13);
        this._GameInfo.TotalCycle.setPosition(cc.p(940,611));
        this._GameInfo.TotalCycle.setSize(300,20);

        this._GameInfo.Promotion = new CocosWidget.TextField();//每桌晉級人數
        this._GameInfo.Promotion.setAnchorPoint(cc.p(0.5,0.5));
        this._GameInfo.Promotion.setFontSize(13);
        this._GameInfo.Promotion.setPosition(cc.p(880,584));
        this._GameInfo.Promotion.setSize(180,20);

        this._GameInfo.BetLimit = new CocosWidget.TextField();//投注限紅
        this._GameInfo.BetLimit.setAnchorPoint(cc.p(0.5,0.5));
        this._GameInfo.BetLimit.setFontSize(13);
        this._GameInfo.BetLimit.setPosition(cc.p(890,544));
        this._GameInfo.BetLimit.setSize(200,20);

        this._GameInfo.Dealer = new CocosWidget.TextField();//荷官
        this._GameInfo.Dealer.setAnchorPoint(cc.p(0.5,0.5));
        this._GameInfo.Dealer.setFontSize(13);
        this._GameInfo.Dealer.setPosition(cc.p(890,520));
        this._GameInfo.Dealer.setSize(200,20);

        this._GameInfo.UserName = new CocosWidget.TextField();//帳號
        this._GameInfo.UserName.setAnchorPoint(cc.p(0.5,0.5));
        this._GameInfo.UserName.setFontSize(13);
        this._GameInfo.UserName.setPosition(cc.p(890,500));
        this._GameInfo.UserName.setSize(200,20);

        this._GameInfo._Remainder = new CocosWidget.TextField(); //剩餘/參賽人數
        this._GameInfo._Remainder.setAnchorPoint(cc.p(0.5,0.5));
        this._GameInfo._Remainder.setFontSize(13);
        this._GameInfo._Remainder.setSize(170,20);

        this._GameInfo.RoundID = new CocosWidget.TextField();//局號
        this._GameInfo.RoundID.setAnchorPoint(cc.p(0.5,0.5));
        this._GameInfo.RoundID.setFontSize(13);
        this._GameInfo.RoundID.setPosition(cc.p(890,480));
        this._GameInfo.RoundID.setSize(200,20);

        this._GameInfo.TableRank = new CocosWidget.TextField();//本桌排行榜
        this._GameInfo.TableRank.setAnchorPoint(cc.p(0.5,0.5));
        this._GameInfo.TableRank.setFontSize(13);
        this._GameInfo.TableRank.setPosition(cc.p(710,653));
        this._GameInfo.TableRank.setSize(100,20);

        this._GameInfo.Balance = new CocosWidget.TextField(); //可用餘額
        this._GameInfo.Balance.setAnchorPoint(cc.p(0.5,0.5));
        this._GameInfo.Balance.setFontSize(13);
        this._GameInfo.Balance.setPosition(940,564);
        this._GameInfo.Balance.setSize(300,20);

        this._GameInfo.TotalBet = new CocosWidget.TextField(); //投注餘額
        this._GameInfo.TotalBet.setAnchorPoint(cc.p(0.5,0.5));
        this._GameInfo.TotalBet.setFontSize(13);
        this._GameInfo.TotalBet.setPosition(940,544);
        this._GameInfo.TotalBet.setSize(300,20);

        this._GameInfo._txt_Limit =  new CocosWidget.TextField();
        this._GameInfo._txt_Limit.setAnchorPoint(cc.p(0.5,0.5));
        this._GameInfo._txt_Limit.setFontSize(15);
        this._GameInfo._txt_Limit.setPosition(740,451);
        this._GameInfo._txt_Limit.setSize(80,17);



        this.addChild(this._GameInfo.NowCycle);
        this.addChild(this._GameInfo.TotalCycle);
        this.addChild(this._GameInfo._Remainder);
        this.addChild(this._GameInfo.SessionID);
        this.addChild(this._GameInfo.RoundID);
        this.addChild(this._GameInfo.Promotion);
        this.addChild(this._GameInfo.BetLimit);
        this.addChild(this._GameInfo.Dealer);
        this.addChild(this._GameInfo.UserName);
        this.addChild(this._GameInfo.TableRank);
        this.addChild(this._GameInfo.Balance);
        this.addChild(this._GameInfo.TotalBet);
        this._LimitNode._showLimitInfo.addChild(this._GameInfo._txt_Limit);
        //--------------------------------------------------------------//
        this._Other.No1 = this.getNode("Gambler_MainMsg_Node/Award_Node/txt_Award1");

        this._Other.Bg = this.getNode("Gambler_MainMsg_Node/Award_Node/bg_down");
        this._Other.No2 = new CocosWidget.TextField();
        this._Other.No2.setAnchorPoint(cc.p(0.5,0.5));
        this._Other.No2.setFontSize(14);
        this._Other.No2.setPosition(cc.p(924,388));
        this._Other.No2.setSize(75,15);
        this._Other.No3 = new CocosWidget.TextField();
        this._Other.No3.setAnchorPoint(cc.p(0.5,0.5));
        this._Other.No3.setFontSize(14);
        this._Other.No3.setPosition(cc.p(924,367));
        this._Other.No3.setSize(75,15);


        this._Other.RankPool = new CocosWidget.TextField();
        this._Other.RankPool.setAnchorPoint(cc.p(0.5,0.5));
        this._Other.RankPool.setFontSize(15);
        this._Other.RankPool.setPosition(cc.p(885,455));
        this._Other.RankPool.setSize(200,20);
        this._awardNode.addChild(this._Other.RankPool);
        this._awardNode.addChild(this._Other.No2);
        this._awardNode.addChild(this._Other.No3);
        this._Other.TotalMoney = new CocosWidget.TextField();
        this._Other.TotalMoney.setAnchorPoint(cc.p(0.5,0.5));
        this._Other.TotalMoney.setFontSize(30);
        this._Other.TotalMoney.setPosition(cc.p(510,310));
        this._Other.TotalMoney.setSize(500,100);
        this._Other.TotalMoney.setVisible(false);
        this._Other.TotalMoney._text_richText_context.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this._isBet = false;
        this._isShowResult = false;
        this._Other.TotalMoney.setVisible(false);
        this._playerBetAmount = 0;
        this._WinMoney = 0;
        this._Money = 0;

        this.addChild( this._Other.TotalMoney);
        //------------------------------------------------------//


        this._rank.Rank4=this._awardNode.getChildByName("txt_Ranking4");

        for (var i = 3; i < 7; i++) {
            this._rank["No"+(i + 1)] = this._rank.Rank4.clone();
            this._rank["No"+(i + 1)].setAnchorPoint(cc.p(0.5, 0.5));
            this._rank["No"+(i + 1)].setPosition(cc.p(this._rank.Rank4.getPositionX(), this._rank.Rank4.getPositionY() - Math.round(22 * (i - 3))));
            this._rank["No"+(i + 1)].setVisible(true);
            this._rank["No"+(i + 1)].setString("");
            this._awardNode.addChild(this._rank["No"+(i + 1)]);
        }
        this._rank.Rank4.setVisible(false);

    },

    ShowWatcherBet: function () {
        this._isBet = true;
        this._Other.TotalMoney.setVisible(true);
        this._Other.TotalMoney.setString(language_manager.getInstance().getTextID(123) +" "+ this._playerBetAmount.toFixed(2) + language_manager.getInstance().getTextID(154));
    },


    showTotalBet: function () {
        this._isBet = true;
        this._Other.TotalMoney.setString(language_manager.getInstance().getTextID(123) +" "+ this._playerBetAmount);
        this._Other.TotalMoney.setVisible(true);
    },

    showLoseMoney: function (money) {
        this._isShowResult = true;
        this._Other.TotalMoney.setVisible(true);
        if (!this._room.uiBetChip._isTakeSeat)
            this._Other.TotalMoney.setString(language_manager.getInstance().getTextID(20) +" "+money+" "+ language_manager.getInstance().getTextID(154));
        if (this._room.uiBetChip._isTakeSeat)
            this._Other.TotalMoney.setString(language_manager.getInstance().getTextID(20) +" "+ money);
    },

    showWinMoney: function (money) {
        this._isShowResult = true;
        this._Other.TotalMoney.setVisible(true);
        if (!this._room.uiBetChip._isTakeSeat)
            this._Other.TotalMoney.setString(language_manager.getInstance().getTextID(19) +" "+ Math.floor(money*100)/100 +" "+ language_manager.getInstance().getTextID(154));
        if (this._room.uiBetChip._isTakeSeat)
            this._Other.TotalMoney.setString(language_manager.getInstance().getTextID(19) +" "+ money);
    },

    getNowPlayerBetAmount: function (BetAmount) {
        this._playerBetAmount = BetAmount;
    },

    //getWinnersMoney: function (WinMoney) {
    //    this._WinMoney += WinMoney;
    //    return this._WinMoney;
    //},

    clear: function () {    
        this._playerBetAmount = 0;
        this._WinMoney = 0;
        this._Money = 0;
    }

});