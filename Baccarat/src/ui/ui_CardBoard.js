/**
 * Created by Matt Hung on 2016/12/6.
 */


ui_CardBoard = gameLayer.extend({
    _cards_sample: [],
    _cards_sample_h: [],
    _timePic: [],
    _timeNumberPic: [],
    _scoreCount: [0, 0],

    _card_nodes: {},
    _timeNode: {},
    _cardBoardNode: null,
    _winner_light: {},
    _winner_hint: null,
    _statusUI: {},
    _mark_text: {},

    _Time_Interval: 0.52,//13 / totalTime
    _count: 13,
    _countTime: 25,
    _countPic: 0,
    _TOTAL_TIME: 25,
    _TIME_ROUND_TEXTURES: 13,

    _cardsNumberContent: [],
    _CardsNumber: {
        ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5, SIX: 6, SEVEN: 7, EIGHT: 8, NINE: 9, TEN: 10, J: 11, Q: 12, K: 0
    },

    _msg_round: {},

    _sprite_digit_tens:[],
    _sprite_digit_ones:[],

    ctor: function (rootNode) {
        this._super(rootNode);

        this._cards_sample = [];
        this._cards_sample_h = [];
        this._timePic = [];
        this._timeNumberPic = [];    
        this._sprite_digit_tens = [];
        this._sprite_digit_ones = [];
        
        this._cardsNumberContent = new Array(52);

        this.initialCardSample();
        this.initialCardNodes();
        this.initialTimeUI();
        // this.initialCountDown();
        this.initialWinnerHightLight();

        this.initialUI();
        this.initialCardContent();
        this.initialSpriteDigit();

        this._timeNode.main.setVisible(false);
        this._winner_hint.setVisible(false);
        this.clear();
    },

    setTimeInitial: function (time) {
        this._countTime = time / 1000;
    },

    initialSpriteDigit: function () {
        for (var i = 0; i < this._timeNumberPic.length; i++) {
            var sprite_tens = cc.Sprite.create(this._timeNumberPic[i].getTexture());
            var sprite_ones = cc.Sprite.create(this._timeNumberPic[i].getTexture());

            this._sprite_digit_tens.push(sprite_tens);
            this._sprite_digit_ones.push(sprite_ones);

            this._timeNode.number.addChild(sprite_tens);
            this._timeNode.number.addChild(sprite_ones);

            sprite_tens.setScale(0.36);
            sprite_ones.setScale(0.36);

            sprite_tens.setPosition(this._timeNode.center.x - 12.5, this._timeNode.center.y);
            sprite_ones.setPosition(this._timeNode.center.x + 12.5, this._timeNode.center.y);

            sprite_tens.setVisible(false);
            sprite_ones.setVisible(false);
        }
    },

    update: function (dt) {
        var text = "";

        // this._winner_hint.text.setString(this._winner_hint.msg);
        text = language_manager.getInstance().getTextID(this._mark_text.msg_status_id);
        this._mark_text.Status.setString(text);
        this._mark_text.Status.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);

        var mark_text_player_txt = language_manager.getInstance().getTextID(13);
        var mark_text_banker_txt = language_manager.getInstance().getTextID(12);

        this._mark_text.Player.setString(mark_text_player_txt);
        this._mark_text.Banker.setString(mark_text_banker_txt);

        var playerScore = this._scoreCount[0] % 10;
        var bankerScore = this._scoreCount[1] % 10;

        this._mark_text.PlayerScore.setString(playerScore);
        this._mark_text.BankerScore.setString(bankerScore);
    },


    initialTimeUI: function () {
        this._timeNode.main = this.getNode("Small_Show_Poker_Node/CountDown_Node");
        this._timeNode.center = this.getNode("Small_Show_Poker_Node/CountDown_Node/pic_counter_center");

        var point = new cc.Node();
        point.setName("point");
        this._timeNode.main.addChild(point);

        this._timeNode.number = this.getNode("Small_Show_Poker_Node/CountDown_Node/point");

        for (var i = 0; i < 10; i++) {
            var pic = this.getNode("Small_Show_Poker_Node/CountDown_Node/CountDownNumber/num_counter_" + i);

            this._timeNumberPic.push(pic);
        }

        for (var i = 1; i <= 13; i++) {
            var pic = this.getNode("Small_Show_Poker_Node/CountDown_Node/CountDownPic/pic_counter_" + i);

            this._timePic.push(pic);
        }
    },

    initialUI: function () {
        this._cardBoardNode = this.getNode("Small_Show_Poker_Node/ShowCard_Node");

        this._winner_hint = this.getNode("Small_Show_Poker_Node/ShowCard_Node/Win_Bg");
        // this._winner_hint.text = this.getNode("Small_Show_Poker_Node/ShowCard_Node/Win_Bg/txt_Player_Win");
        // this._winner_hint.text.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);

        this._statusUI.bet = this.getNode("Small_Show_Poker_Node/Bet_bg");
        this._statusUI.result = this.getNode("Small_Show_Poker_Node/ShowCard_Bg");
        this._statusUI.wait = this.getNode("Small_Show_Poker_Node/Wait_NewGame_bg");

        this._mark_text.Player = this.getNode("Small_Show_Poker_Node/ShowCard_Node/txt_Player");
        this._mark_text.Banker = this.getNode("Small_Show_Poker_Node/ShowCard_Node/txt_Banker");
        this._mark_text.Status = this.getNode("Small_Show_Poker_Node/txt_WaitNewGame");
        this._mark_text.PlayerScore = this.getNode("Small_Show_Poker_Node/ShowCard_Node/txt_PlayerScore");
        this._mark_text.BankerScore = this.getNode("Small_Show_Poker_Node/ShowCard_Node/txt_BankerScore");

        this._msg_round[RoundStatus.RoundStart] = 0;
        this._msg_round[RoundStatus.DealCard] = 1;
        this._msg_round[RoundStatus.CheckResult] = 2;

        if(language_manager.getInstance().getLanguage()==language_manager.getInstance().Choose_Language.lan_English){
            this._mark_text.Player.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
            this._mark_text.Banker.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
        }
        else  {
            this._mark_text.Player.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            this._mark_text.Banker.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        }

    },

    initialWinnerHightLight: function () {
        this._winner_light.Player = this.getNode("Small_Show_Poker_Node/ShowCard_Node/playerWin_bg");
        this._winner_light.Banker = this.getNode("Small_Show_Poker_Node/ShowCard_Node/bankerWin_bg");
    },

    // initialCountDown: function () {
    // this._count_down = this.getNode("Small_Show_Poker_Node/txt_Countdwown");
    // },

    initialCardSample: function () {

        var sample_root_node = this.getNode("Small_Show_Poker_Node/Small_Poker");

        var name = "";
        var point = 0;

        this._cards_sample.push(null);
        this._cards_sample_h.push(null); 

        for (var i = 1; i <= 52; i++) {

            name = "pic_poker_spades_";

            if (i > 13)
                name = "pic_poker_heart_";

            if (i > 26)
                name = "pic_poker_diamonds_";

            if (i > 39)
                name = "pic_poker_clubs_";

            point = i % 13;
            point = point == 0 ? 13 : point;

            var card_node = this.getNode("Small_Show_Poker_Node/Small_Poker/" + name + point);
            this._cards_sample.push(card_node);

            var card_node_h = this.getNode("Small_Show_Poker_Node/H_Poker/h_" + name + point);
            this._cards_sample_h.push(card_node_h);
        }
    },

    initialCardNodes: function () {
        for (var i = 1; i <= 6; i++) {
            var name = "";
            switch (i) {
                case 1:
                    name = "Small_Show_Poker_Node/Player_Poker_1";
                    break;
                case 2:
                    name = "Small_Show_Poker_Node/Player_Poker_2";
                    break;
                case 3:
                    name = "Small_Show_Poker_Node/Banker_Poker_1";
                    break;
                case 4:
                    name = "Small_Show_Poker_Node/Banker_Poker_2";
                    break;
                case 5:
                    name = "Small_Show_Poker_Node/Player_Poker_3";
                    break;
                case 6:
                    name = "Small_Show_Poker_Node/Banker_Poker_3";
                    break;
            }

            this._card_nodes["Card" + i] = this.getNode(name);
        }
    },

    initialCardContent: function () {
        for (var i = 0; i < this._cardsNumberContent.length; i++) {
            var num = (i + 1) % 13;
            if (num == this._CardsNumber.TEN || num == this._CardsNumber.J || num == this._CardsNumber.Q || num == this._CardsNumber.K) {
                num = 0;
            }

            this._cardsNumberContent[i] = num;
        }
    },

    clear: function () {
        for (var i = 1; i <= 6; i++)
            this._card_nodes["Card" + i].setVisible(false);

        for (var i = 0; i < this._timePic.length; i++) {
            this._timePic[i].setVisible(false);
        }

        this.count = 13;
        this._countPic = 0;
        this._countTime = this._TOTAL_TIME;

        this._scoreCount[0] = 0;
        this._scoreCount[1] = 0;

        // this._count_down.setString(0);
        // this._winner_hint.setVisible(false);
        this._winner_light.Player.setVisible(false);
        this._winner_light.Banker.setVisible(false);

        var msg_id = this._msg_round[RoundStatus.RoundStart];
        this._mark_text.msg_status = language_manager.getInstance().getTextID(msg_id);

    },

    setCardsData: function (order, card_id, visible) {
        this.cardCompute(order, card_id);
        this.showCard(order, card_id, visible);
    },

    showCard: function (order, card_id, visible) {
        if (card_id <= 0)
            return;

        var samples = (order >= 5) ? this._cards_sample_h : this._cards_sample;

        var texture = samples[card_id].getTexture();            

        this._card_nodes["Card" + order].setTexture(texture);
        this._card_nodes["Card" + order].setVisible(visible);
    },

    cardCompute: function (order, card_id) {
        if (order == 1 || order == 2 || order == 5)
            this._scoreCount[0] += this._cardsNumberContent[card_id - 1];
        if (order == 3 || order == 4 || order == 6)
            this._scoreCount[1] += this._cardsNumberContent[card_id - 1];
    },

    _current_value_tens:0,
    _current_value_ones:0,

    updateCountDown: function (value) {
        var _value = Math.floor(value);

        var value_tens = Math.floor(_value / 10);
        var value_ones = Math.floor(_value % 10);

        if(this._current_value_tens==value_tens)
        if(this._current_value_ones==value_ones)
            return;

        this._current_value_tens = value_tens;
        this._current_value_ones = value_ones;


        for(var i=0; i<this._sprite_digit_tens.length; i++){
            this._sprite_digit_tens[i].setVisible(false);
            this._sprite_digit_ones[i].setVisible(false);
        }

        var sprite_tens = this._sprite_digit_tens[value_tens];
        var sprite_ones = this._sprite_digit_ones[value_ones];

        if (_value > 1) {
            sprite_ones.setColor(cc.color(0, 0, 0, 0));
        } else {
            sprite_ones.setColor(cc.color(255, 0, 0, 0));
        }

        if (_value >= 10) {
            sprite_tens.setVisible(true);
            sprite_ones.setVisible(true);
            sprite_ones.setPosition(this._timeNode.center.x + 12.5, this._timeNode.center.y);
        } else {
            sprite_tens.setVisible(false);
            sprite_ones.setVisible(true);
            sprite_ones.setPosition(this._timeNode.center.x, this._timeNode.center.y);
        }

        //-----------------------------------------------------------------Circle----------------------------------------------------------------------
        if (value == 0)return;
        if (this._countTime >= value) {
            this._count = 13;
            this._countTime = _value--;

            this._countPic = (this._TOTAL_TIME - value) * this._Time_Interval;
            for (var i = 0; i < this._countPic; i++) {
                if (this._count > this._TIME_ROUND_TEXTURES || this._count < 1)break;

                if (this._timePic[this._TIME_ROUND_TEXTURES - this._count].visible == true) {
                    this._count--;
                    continue;
                } else {
                    this._timePic[this._TIME_ROUND_TEXTURES - this._count].setVisible(true);
                    this._count--;
                }
            }            
        }
    },

    updateHitArea: function (area) {
        var lang_id = 0;
        switch (area) {
            case 1:
                lang_id = 5;
                break;
            case 2:
                lang_id = 3;
                this._winner_light.Player.setVisible(true);
                break;
            case 3:
                lang_id = 4;
                this._winner_light.Banker.setVisible(true);
                break;
            default:
                return;
        }

        // this._winner_hint.msg = language_manager.getInstance().getTextID(lang_id);
        // this._winner_hint.setVisible(true);
    },

    updateRoundStatus: function (status) {
        if (status != RoundStatus.DealCard) {
            this._cardBoardNode.setVisible(true);
            this._timeNode.main.setVisible(false);
        } else {
            this._cardBoardNode.setVisible(false);
            this._timeNode.main.setVisible(true);
        }

        switch(status){
            case RoundStatus.DealCard:
                this._statusUI.bet.setVisible(true);
                this._statusUI.result.setVisible(false);
                this._statusUI.wait.setVisible(false);
                break;
            case RoundStatus.CheckResult:
                this._statusUI.bet.setVisible(false);
                this._statusUI.result.setVisible(true);
                this._statusUI.wait.setVisible(false);
                break;
            case RoundStatus.RoundStart:
                this._statusUI.bet.setVisible(false);
                this._statusUI.result.setVisible(false);
                this._statusUI.wait.setVisible(true);
                break;
        }

        var msg_id = this._msg_round[status];
        if (msg_id == undefined)
            return;

        this._mark_text.msg_status_id = msg_id;
    }
});