/**
 * Created by Matt Hung on 2016/12/6.
 */

const MAX_SEAT = 7;
const MAX_CARD = 6;

var RoundStatus = {
    DrawGame: "DrawGame",
    None: "None",
    Rest: "Rest",
    RoundStart: "RoundStart",
    DealCard: "DealCard",
    CheckResult: "CheckResult",
    RoundOver: "RoundOver"
};

var GambleStageBehavior = {Start: 0, Conduct: 1, End: 2};

BaccaratRoom = cc.Class.extend({
    _id: 0,
    _user: null,
    _roomMessage: null,
    _cards: [],
    _betInfos: [],
    _seats: [],
    _status: RoundStatus.None,
    _roundID: 0,
    _shoeInfo:null,
    _user_seat_id: 0,
    _remain_ticks: null,
    _dealerName: null,
    // uiSeatSelector: null,    
    uiChooseChip: null,
    uiBetChip: null,
    uiMsg: null,
    uiMostBrand: null,
    uiGameSeat: null,
    uiTableArea: null,
    // uiBidArea: null,
    uiEffectController: null,
    uiGameResult:null,
    _chipChoice: 10000,
    _betArea: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    uiCardBoard: null,
    uiRoadMap: null,
    uiInRoomRanking: null,
    uiTip:null,
    _deltaTime: null,
    _SideBetLimit:null,
    _totalWin:0,

    getRoomID: function () {
        return this._id;
    },
    getChipChoice: function () {
        return this._chipChoice
    },
    setChipChoice: function (denomination) {
        this._chipChoice = denomination;
    },
    getStatus: function () {
        return this._status;
    },
    getSeatID: function () {
        return this._user_seat_id;
    },
    getSeatData: function () {
        return this._seats;
    },
    getCards: function () {
        return this._cards;
    },
    getBetArea: function () {
        return this._betArea;
    },

    getShoeInfo:function(){
        return this._shoeInfo;
    },
    getRoomMessage: function () {
        return this._roomMessage;
    },
    
    getPlayer: function () {
        if (this.checkOnSeat())
            this._user = this._seats[AccountCenter.getInstance().getSeatNo() - 1];
        return this._user;
    },
    setViewerData: function () {
        this._user = new BaccaratViewer(AccountCenter.getInstance().getUserID(), AccountCenter.getInstance().getUserName(), AccountCenter.getInstance().getBalance());
    },

    ctor: function (id) {
        this._id = id;

        this._roomMessage = {};
        this._SideBetLimit ={};
        this._cards = [];
        this._betInfos = [];
        this._seats = [];
        this._status = RoundStatus.None;
        this._remain_ticks = 0;
        this._totalWin =0;

        for (var i = 0; i < MAX_SEAT; i++)
            this._seats.push(new GamblerSeat(i));

        for (var i = 0; i <= MAX_CARD; i++)
            this._cards.push(null);

        this.settingBystander();
        this.setRoomMessage(GameManager.getInstance().SignUpRoom.getSelectRoom());
        this.uiTip = new ui_tip(GameManager.getInstance().Node_SceneRoot, this);
        this.uiTableArea = new ui_TableArea(GameManager.getInstance().Node_SceneRoot, this);
        // this.uiSeatSelector = new ui_SeatSelector(this);
        this.uiRoadMap = new ui_RoadMap(GameManager.getInstance().Node_SceneRoot,this);
        this.uiBetChip = new ui_BetChip(this, GameManager.getInstance().Node_SceneRoot, "Chip_Bet_Node");
        this.uiChooseChip = new ui_ChooseChip(this, GameManager.getInstance().Node_SceneRoot, "Chip_Set_Node");
        this.uiGameSeat = new ui_GameSeat(GameManager.getInstance().Node_SceneRoot, this);
        //this.uiBidArea = new ui_BidArea(GameManager.getInstance().Node_SceneRoot, this);
        this.uiMsg = new ui_Msg(GameManager.getInstance().Node_SceneRoot, this);
        this.uiCardBoard = new ui_CardBoard(GameManager.getInstance().Node_SceneRoot);
        this.uiMostBrand = new ui_MostBrand(GameManager.getInstance().Node_SceneRoot);
        this.uiEffectController = new ui_EffectController(GameManager.getInstance().Node_SceneRoot, this);
        this.uiInRoomRanking = new ui_InRoomRanking(GameManager.getInstance().Node_SceneRoot);
        this.uiGameResult = new ui_GameResult(CocosWidget.getNode(GameManager.getInstance().Node_SceneRoot, "GameResult_Node"));

        GameManager.getInstance().Node_SceneRoot.addChild(this.uiRoadMap);
        GameManager.getInstance().Node_SceneRoot.setVisible(true);
        GameManager.getInstance().setGameResult(false);
    },

    settingBystander: function () {
        if (!this.checkOnSeat()) {
            this.setViewerData();
        }
    },

    checkOnSeat: function () {
        var seatData = [];
        var SeatsData = this._seats;

        if (this._seats.length <= 0)return;

        for (var i = 0; i < SeatsData.length; i++)
            seatData.push(SeatsData[i].getPlayerID());

        var indexSeat = seatData.indexOf(AccountCenter.getInstance().getUserID());
        if (indexSeat < 0) {
            return false;
        }
        return true;
    },

    showSuccessRegister: function () {
        var title = language_manager.getInstance().getTextID(93);
        var text = String.format(language_manager.getInstance().getTextID(158),(this._roomMessage.RegisterFee - this._roomMessage.Service_fee) , this._roomMessage.sessionID);
        ui_MessageBox.getInstance().showText(title, text);
    },

    takeSeat: function (id, restoreSession, showRegisteredMsg) {
        this._user_seat_id = id;
        this._user = this._seats[id - 1];

        if (this._user_seat_id > 0) {
            this.uiBetChip.setSpecBet(this._roomMessage.minBet, this._roomMessage.maxBet);
            this.uiChooseChip.setSpecBet(this._roomMessage.minBet, this._roomMessage.maxBet);
            this.uiChooseChip.setDefaultContestant();
            this.uiBetChip.updateWebBet(AccountCenter.getInstance().getContestantChoose());
            this.uiChooseChip.setDefaultChipOpen(false);
        }
        //非斷線還原才顯示參賽成功
        if(!restoreSession)
        if(showRegisteredMsg)
            this.showSuccessRegister();
    },

    updateStatus: function (status) {
        this._status = status;

        this.uiCardBoard.updateRoundStatus(this._status);
        this.uiBetChip.updateRoundStatus(this._status);

        switch (this._status) {
            case RoundStatus.RoundStart:
                this.roundStart();
                break;
            case RoundStatus.DealCard:
                this.dealCard();
                break;
            case RoundStatus.CheckResult:
                this.checkResult();
                break;
            case RoundStatus.RoundOver:
                this.roundOver();
                break;
        }
    },

    updateRoundID: function (roomID, roundID, shoeInfo) {
        this.resetTargetRoom(roomID);
        this._roundID = roundID;
        this._shoeInfo = shoeInfo;
    },

    resetTargetRoom: function (roomID) {
        var roomListData = GameManager.getInstance().SignUpRoom._roomListData;
        for (var i = 0; i < roomListData.length; i++) {
            if (roomID == roomListData[i].RoomID) {
                GameManager.getInstance().SignUpRoom._roomSelect = roomListData[i];
            }
        }
    },

    updateCard: function (order, card_num, visible) {
        if (this._cards[order] == null)
            this._cards[order] = new BaccaratCard(card_num, visible);

        this._cards[order].ID = card_num;
        this._cards[order].Visible = visible;

        this.uiCardBoard.setCardsData(order, card_num, visible);
        //this.uiBidArea.setCards(order, card_num, visible);
    },

    onPlaceBet: function (data) {
        var user_id = data.UserID;
        var seat_id = data.SeatID;
        var bet_area = data.BetArea;
        var amount = data.Amount;
        var result = data.Result;
        var hide = data.Hide;
        var pass = data.Pass;

        if (result == 1) {
            var bet_info = {};
            bet_info.user_id = user_id;
            bet_info.seat_id = seat_id;
            bet_info.bet_area = bet_area;
            bet_info.amount = amount;
            this._betInfos.push(bet_info);

            this._betArea[bet_area - 1] += amount;
            // this.uiBetChip.updateToNoTouch(user_id);
            if (hide == 0) {
                if (AccountCenter.getInstance().getUserID() == user_id) {
                    this._user.isBet();
                } else {
                    this._seats[seat_id - 1].successBet(bet_info);
                }
            }

            if (hide != 0) {
                this.uiBetChip.showHideBet(user_id);
                if (AccountCenter.getInstance().getUserID() == user_id) {
                    this._seats[seat_id - 1].isBet();
                }
            }
	    
            if (AccountCenter.getInstance().getUserID() == user_id) {
                this.uiTableArea.hideQuickBet();
                this.uiBetChip.setBetControlState(result, hide, pass);
                this._user.setConfirmBet(bet_area, amount);
                if (pass == 1) {
                    this.uiTableArea.isPass = true;
                }

                if (this.getPlayer().getBetMoney() != 0) {
                    this.uiMsg.getNowPlayerBetAmount(this.getPlayer().getBetMoney());
                    if (seat_id == 0)
                        this.uiMsg.ShowWatcherBet();
                    if (seat_id != 0)
                        this.uiMsg.showTotalBet();
                }
            }

            this.uiTableArea.showBet();
            this.uiGameSeat.showBetAction(user_id, seat_id, hide, pass);
            this.uiMsg.setCountDownVisible();
            return;
        }

        if (result != 1) {
            this.getPlayer().betFail();
            this.uiBetChip.updateBetBtnToNormal(user_id);
            if (AccountCenter.getInstance().getUserID() == user_id)
                this.uiTableArea.hideQuickBet();
        }

        // 請求下注: PlaceBet: {"SeatID":1, "UserID":001, "BetArea": 1, "Amount":10, "Result":1}
        // Result:   1:成功
        //           2:餘額不足
        //           3:非可下注時間
        //           4:無效下注區
        //           5:下注失敗(API Error)
        //           6:無效下注額
        //           11:不可同時下注莊家與閒家
        //           12:至少需要下注莊家或閒家
        switch (result) {
            case 2:
                // "104":"信用額度不足",
                ui_MessageBox.getInstance().showTextByID(104);
                break;
            case 3:
                //"下注失敗",
                ui_MessageBox.getInstance().showTextByID(116);
                break;
            case 11:
                ui_MessageBox.getInstance().showTitleTextByID(98,142);
                break;
            case 12:
                ui_MessageBox.getInstance().showTitleTextByID(98,143);
                break;
            default:
                // ui_MessageBox.getInstance().showText("onPlaceBet" + result.toString());
                ui_MessageBox.getInstance().showTextByID(167);
                cc.log("onPlaceBet" + result.toString());
                break;
        }
    },

    updateRoomInfo: function (data) {
        for (var i = 0; i < data.length; i++) {
            if (data[i].SeatID == 0)
                continue;

            var seat_id = data[i].SeatID;
            var user_id = data[i].UserID;
            var user_name = GameManager.getInstance().getUserName(user_id);

            this._seats[seat_id - 1].updatePlayerData(user_id, user_name);
        }

        // this.uiSeatSelector.updateSeats(data);
    },

    updateChipInfo: function (seat_id, user_id, chips) {
        var user_name = GameManager.getInstance().getUserName(user_id);
        this.uiInRoomRanking.updateInfo(seat_id, user_id, user_name, chips);
        this._seats[seat_id - 1].updateSeatChip(chips);
        this._seats[seat_id - 1].updateSeatsInfo(user_id);
    },

    onCountDown: function (remain_tick) {
        this.uiCardBoard.setTimeInitial(remain_tick);
        this._remain_ticks = remain_tick;
    },

    update: function (dt) {
        this.updateCounter(dt);
        this.uiBetChip.update(dt);
        this.uiCardBoard.update(dt);
        this.uiGameSeat.update(dt);
        this.uiMostBrand.update(dt);
        this.uiRoadMap.update(dt);
        // this.uiSeatSelector.update(dt);
        this.uiTableArea.update(dt);
        this.uiEffectController.update(dt);
        this.uiMsg.update(dt);
        this.uiGameResult.update(dt);

        this.setRoomMessage(GameManager.getInstance().SignUpRoom.getSelectRoom());
    },

    updateCounter: function (dt) {
        if (this._remain_ticks > 0)
            this._remain_ticks -= dt * 1000;

        if (this._remain_ticks < 0)
            this._remain_ticks = 0;

        var secs = this._remain_ticks / 1000;
        this.uiCardBoard.updateCountDown(secs);
    },

    onGameResult: function (hit_areas, winners, result_id) {
        for (var i = 0; i < hit_areas.length; i++) {
            var area_id = hit_areas[i].HitArea;

            this.uiCardBoard.updateHitArea(area_id);
            this.uiTableArea.shineBtn(area_id);
        }
        this.uiTableArea.getHitArea(hit_areas);

        this.calculateBetResult(winners);
    },

    dealCard: function () {
        this._deltaTime = Math.ceil(this._remain_ticks / 1000);
        if (this._deltaTime - 1 > 1 && sound_manager.getInstance().isSoundVoiceOn())
            sound_manager.getInstance().setVoiceName("BettingStarted");

        cc.director.getScheduler().schedule(this.playBG.bind(this), this, 1, this._deltaTime, 0, false);
    },

    playBG: function () {
        var time = Math.ceil(this._deltaTime--);
        var startTime = 6;
        var endTime = 1;
        if (time - 1 <= startTime && time - 1 > endTime && sound_manager.getInstance().isSoundEffectOn())
            sound_manager.getInstance().setEffectName("countdown");

        if (time - 1 == 1 && sound_manager.getInstance().isSoundVoiceOn()) {
            sound_manager.getInstance().setVoiceName("BettingStopped");
        }
    },

    quitBG: function () {
        this._deltaTime = 0;
    },

    calculateBetResult: function (winners) {
        if (this.getPlayer().getBetMoney() == 0)
            return;


        var win_Money=0;
        for (var i = 0; i < winners.length; i++) {
            if (winners[i].UserID == AccountCenter.getInstance().getUserID())
                win_Money += winners[i].WinMoney;
                this._totalWin = win_Money;
        }
        this._totalWin= this._totalWin-this.getPlayer().getBetMoney();

        if (this._totalWin >= 0)
            this.uiMsg.showWinMoney(this._totalWin);

        if (this._totalWin < 0)
            this.uiMsg.showLoseMoney(Math.abs(this._totalWin));

    },

    checkResult: function () {
        if (this.getPlayer() != undefined)
            this.getPlayer().checkBet();
        this.uiTableArea.hideQuickBet();
    },

    roundStart: function () {
        this.uiCardBoard.clear();
        this.uiInRoomRanking.updateUI();
    },

    roundOver: function () {
        this._remain_ticks = 0;
        this.uiTableArea.isPass = false;

        for (var i = 0; i <= MAX_CARD; i++)
            this._cards[i] = null;

        for (var i = 0; i < this._betArea.length; i++)
            this._betArea[i] = 0;

        this._betInfos = [];

        for (var i = 0; i < this._seats.length; i++)
            this._seats[i].playerBetDataClear();

        if(!this.checkOnSeat()){
            this._user.playerBetDataClear();
        }

        this._user.clearConfirmBet();

        this.uiGameSeat.onRoundOver();

        // this.uiCardBoard.clear();
        //this.uiBidArea.clear();
        this.uiMsg.clear();
    },

    clearSeatChip: function (result, userID, seatID) {
        this._seats[seatID - 1].updateSeatChip(0);
        this._seats[seatID - 1].updateSeatsInfo(0);
    },

    setRoomMessage: function (roomMsg) {
        if(roomMsg == null){
            return;
        }

        this._roomMessage.roomName = roomMsg.Name;
        this._roomMessage.sessionID = roomMsg.SessionID;
        this._roomMessage.totalTickets = roomMsg.TotalTickets;
        this._roomMessage.playerCount = roomMsg.RegisteredPlayers.length;
        this._roomMessage.totalTurn = roomMsg.Total_Turn;
        this._roomMessage.turnCount = roomMsg.Turn_Count;
        this._roomMessage.minBet = roomMsg.MinBet;
        this._roomMessage.maxBet = roomMsg.MaxBet;
        this._roomMessage.rankReward = roomMsg.RankReward;
        this._roomMessage.TotalReward = roomMsg.TotalReward;
        this._roomMessage.RegisterFee = roomMsg.RegisterFee;
        this._roomMessage.Service_fee = roomMsg.Service_fee;
        this._roomMessage.DealerName = roomMsg.DealerName;
        this._roomMessage.passCount = roomMsg.PassCount;
        this._roomMessage.hideCount = roomMsg.HideCount;

    },

    onClearRoadMap:function(){
        this.uiRoadMap.clearRoadMap();
    },

    onLeaveRoom: function (userID, seatID) {
        this.uiInRoomRanking.clear(seatID);
    },

    onLeaveSeat: function (SeatID, UserID) {
        this._seats[SeatID - 1].updateSeatChip(0);
        this._seats[SeatID - 1].updateSeatsInfo(0);
    },

    onRoadMap: function (mapStr) {
        this.uiRoadMap.updateRoadMap(mapStr);
    },

    onMergeTable:function(src, dest){
        this.uiInRoomRanking.clearAll();
    },

    onSessionRank:function(data){
        var session_name = language_manager.getInstance().getTextID(73)+(this._roomMessage.RegisterFee-this._roomMessage.Service_fee) + language_manager.getInstance().getTextID(31);
        var session_id = this._roomMessage.sessionID;

        this.uiInRoomRanking.gameOver();
        this.uiGameResult.showRank(session_name, session_id, data);
        GameManager.getInstance().setGameResult(true);
    },

    onBetControl:function(hideCount, passCount){
        this.uiBetChip.updateBetControl(hideCount, passCount);
    },

    onBetLimitation:function(SideBetLimit){

        if(SideBetLimit == null){
            return;
        }

        this._SideBetLimit._BetMinLimit = SideBetLimit.BL;
        this._SideBetLimit._BetMaxLimit = SideBetLimit.BH;
        this._SideBetLimit._BetPair = SideBetLimit.P;
        this._SideBetLimit._BetTie = SideBetLimit.T;

        this.uiBetChip.setSpecBet(this._SideBetLimit._BetMinLimit, this._SideBetLimit._BetMaxLimit);
        this.uiChooseChip.setSpecBet(this._SideBetLimit._BetMinLimit, this._SideBetLimit._BetMaxLimit);
        this.uiChooseChip.setDefaultViewer();
        this.uiBetChip.updateWebBet(AccountCenter.getInstance().getViewerChoose());
        this.uiChooseChip.setDefaultChipOpen(true);
    }
});