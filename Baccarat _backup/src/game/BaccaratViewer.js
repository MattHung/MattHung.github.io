/**
 * Created by jeff_chien on 2016/12/27.
 */

var recordBetData = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);

BaccaratViewer = cc.Class.extend({
    _playerID: 0,
    _playerName: "GGWP",
    _balance: 0,
    _betMoney: 0,
    _isSuccessBet: null,
    betAreaMoney: null,
    successBetAmount: null,
    betActionArray: null,
    betConfirmArray: null,

    getPlayerID: function () {
        return this._playerID;
    },
    getPlayerName: function () {
        return this._playerName;
    },
    getBetMoney: function () {
        return this._betMoney;
    },
    getPlayerAreaBetMoney: function () {
        return this.betAreaMoney;
    },
    getSuccessBetArea: function () {
        return this.successBetAmount;
    },
    getCurrentBetMoney: function () {
        var money = 0;
        for (var i = 0; i < this.betAreaMoney.length; i++)
            money += this.betAreaMoney[i];
        return money;
    },

    ctor: function (id, name, balance) {
        this._playerID = id;
        this._playerName = name;
        this._balance = balance;
        this.betAreaMoney = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
        this.successBetAmount = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
        this.betActionArray = [];
        this.betConfirmArray = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
        this.playerBetDataClear();
    },

    setConfirmBet: function (area, amount) {
        this.betConfirmArray[area - 1] += amount;
    },

    clearConfirmBet: function () {
        this.betConfirmArray = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
        this.betActionArray = [];
    },

    checkIsSameBet: function (new_bet) {
        if (this.betActionArray.length - 1 < 0)
            return;
        var lastBetAct = this.betActionArray[this.betActionArray.length - 1];
        var differentCount = -1;
        for (var i = 0; i < lastBetAct.length; i++) {
            if (lastBetAct[i] == new_bet[i])
                continue;
            differentCount++;
        }
        if (differentCount >= 0)
            return false;
        return true;
    },

    setCancelAction: function () {
        this.betActionArray =[];
    },

    setActionBet: function (betInfo) {
        if (this.checkIsSameBet(betInfo))
            return;
        var curtBet = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
        for (var i = 0; i < curtBet.length; i++)
            curtBet[i] = betInfo[i];

        this.betActionArray.push(curtBet);
    },

    setLastAction: function () {
        if (this.betActionArray.length <= 0)
            return;

        if (this.betActionArray.length <= 1) {
            for (var i = 0; i < this.successBetAmount.length; i++)
                this.successBetAmount[i] = this.betConfirmArray[i];
            this.betActionArray = [];
            this.betAreaMoney = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
            return;
        }

        for (var j = 0; j < this.successBetAmount.length; j++) {
            var lastBetCount = this.successBetAmount[j] - this.betActionArray[this.betActionArray.length - 2][j];
            this.betAreaMoney[j] -= lastBetCount;
            this.successBetAmount[j] = this.betActionArray[this.betActionArray.length - 2][j];
        }

        this.betActionArray.length = this.betActionArray.length - 1;
    },

    updatePlayerData: function (user_id, user_name) {
        this._playerID = user_id;
        this._playerName = user_name;
    },

    setPlayerID: function (id) {
        this._playerID = id;
    },

    setBet: function (areaID, amount) {
        this.successBetAmount[areaID] += amount;
        this.betAreaMoney[areaID] += amount;
        this.setActionBet(this.successBetAmount);
    },

    resetBet: function () {
        for (var i = 0; i < this.successBetAmount.length; i++) {
            this.betAreaMoney[i] += recordBetData[i];
            this.successBetAmount[i] += recordBetData[i];
        }
        this.setActionBet(this.successBetAmount);
    },

    successBet: function (data) {
        this.successBetAmount[data.bet_area - 1] += data.amount;

        this.countTotalBet();
    },

    checkBet: function () {
        for (var i = 0; i < this.successBetAmount.length; i++) {
            this.successBetAmount[i] -= this.betAreaMoney[i];
            this.betAreaMoney[i] = 0;
        }

        if (GameManager.getInstance().Room != null)
            GameManager.getInstance().Room.uiTableArea.showBet();
    },

    clearCurrentBet: function () {
        for (var i = 0; i < this.successBetAmount.length; i++) {
            this.successBetAmount[i] -= this.betAreaMoney[i];
        }

        for (var i = 0; i < this.betAreaMoney.length; i++) {
            this.betAreaMoney[i] = 0;
        }

        if (GameManager.getInstance().Room != null)
            GameManager.getInstance().Room.uiTableArea.showBet();
    },

    playerBetDataClear: function () {
        this._betMoney = 0;
        for (var i = 0; i < this.successBetAmount.length; i++) {
            this.successBetAmount[i] = 0;
        }

        for (var i = 0; i < this.betAreaMoney.length; i++) {
            this.betAreaMoney[i] = 0;
        }

        if (GameManager.getInstance().Room != null)
            GameManager.getInstance().Room.uiTableArea.showBet();
    },

    betFail: function () {
        for (var i = 0; i < this.successBetAmount.length; i++) {
            this.successBetAmount[i] -= this.betAreaMoney[i];
        }

        for (var i = 0; i < this.betAreaMoney.length; i++) {
            this.betAreaMoney[i] = 0;
        }

        if (GameManager.getInstance().Room != null)
            GameManager.getInstance().Room.uiTableArea.showBet();
    },

    isBet: function () {
        this.setRecordData();

        for (var i = 0; i < this.betAreaMoney.length; i++) {
            this.betAreaMoney[i] = 0;
        }

        this.betActionArray = [];
        this.countTotalBet();
    },

    setRecordData: function () {
        var isRecord = false;
        for (var i = 0; i < this.betAreaMoney.length; i++) {
            if (this.betAreaMoney[i] == 0)
                continue;

            isRecord = true;
            break;
        }
        if (isRecord)
            recordBetData = this.betAreaMoney.slice(0);
    },

    countTotalBet: function () {
        var totalBet = 0;
        for (var i = 0; i < this.successBetAmount.length; i++) {
            totalBet += this.successBetAmount[i];
        }
        this._betMoney = totalBet;
    }
});