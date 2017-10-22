/**
 * Created by helen_pai on 2016/12/14.
 */
var ConfirmArea = {
    Player: 2,
    Banker: 3
};

var BrandIndex = {
    brandBanker: 0,
    brandPlayer: 1
};

var ui_MostBrand = gameLayer.extend({
    NO_SEAT: 4,
    VELOCITY: 5,
    NAME_INDEX: 5,
    brand: [],
    betInfo: [],
    PlayerInfo: {},
    BankerInfo: {},
    SeatId: {},


    ctor: function (mainNode) {
        this._super(mainNode);
        this.initVariable();
        this.initBrand();
        this.initSeatId();
    },

    getSeatId: function (whichName) {
        var index = this.SeatId[whichName];
        if (!index > 0)
            return null;
        index = index - 1;
        return index;
    },

    showBrand: function (whichInfo) {
        if (whichInfo.mostBetIndex <= 0)
            whichInfo._objNode.setVisible(false);
        if (whichInfo.mostBetIndex == -1) {
            whichInfo.mostBetIndex = 0;
            whichInfo.finPos = whichInfo._originPos;
            whichInfo._objNode.setVisible(false);
            return;
        }
        if (whichInfo.mostBetIndex > 0)
            whichInfo._objNode.setVisible(true);
        var seat_id = whichInfo.mostBetIndex;
        if (seat_id >= this.NO_SEAT)
            seat_id += 1;
        whichInfo.finPos = this.getNode("Table_Node/" + whichInfo._nodeName + "Node/" + whichInfo._nodeName + "_" + seat_id).getPosition();
    },

    moveBrand: function (dt, whichInfo) {
        whichInfo._objNode.setPosition(whichInfo.currentPos);
        whichInfo.currentPos.x -= (whichInfo.currentPos.x - whichInfo.finPos.x) * dt * this.VELOCITY;
        whichInfo.currentPos.y -= (whichInfo.currentPos.y - whichInfo.finPos.y) * dt * this.VELOCITY;
    },

    updateBetInfo: function (Info) {

        this.betInfo.push(Info);

        switch (Info.bet_area) {
            case ConfirmArea.Player:
                this.brand[BrandIndex.brandPlayer].HashMap[Info.seat_id] += Info.amount;
                this.updateMostBetIndex(this.brand[BrandIndex.brandPlayer]);
                break;
            case ConfirmArea.Banker:
                this.brand[BrandIndex.brandBanker].HashMap[Info.seat_id] += Info.amount;
                this.updateMostBetIndex(this.brand[BrandIndex.brandBanker]);
                break;
        }
    },

    updateMostBetIndex: function (whichInfo) {
        for (var i = 0; i < Object.keys(whichInfo.HashMap).length; i++) {
            if (whichInfo.HashMap[i] < 0)continue;
            if (whichInfo.HashMap[i] == 0)continue;
            if (whichInfo.mostBetIndex == i)continue;
            if (whichInfo.HashMap[whichInfo.mostBetIndex] - whichInfo.HashMap[i] < 0) {
                whichInfo.mostBetIndex = i;
                // this.SeatId[whichInfo._nodeName.substr(this.NAME_INDEX)] = whichInfo.mostBetIndex;
                continue;
            }
            if (whichInfo.HashMap[whichInfo.mostBetIndex] - whichInfo.HashMap[i] == 0) {
                whichInfo.mostBetIndex = -1;
                // this.SeatId[whichInfo._nodeName.substr(this.NAME_INDEX)] = whichInfo.mostBetIndex;
            }
        }
    },

    updateRoundStatus: function (state) {
        if (state == RoundStatus.RoundOver) {
            this.betInfo = [];
            for (var i = 0; i < this.brand.length; i++) {
                this.initHashMap(this.brand[i]);
                this.brand[i].mostBetIndex = -1;
            }
        }
    },

    initSeatId: function () {
        this.SeatId["Banker"] = this.brand[BrandIndex.brandBanker].mostBetIndex;
        this.SeatId["Player"] = this.brand[BrandIndex.brandPlayer].mostBetIndex;
    },

    initBrand: function () {
        this.BankerInfo._nodeName = "BrandBanker";
        this.PlayerInfo._nodeName = "BrandPlayer";
        this.BankerInfo._objNode = this.getNode("MoreBet_Node/banker_BetMore");
        this.PlayerInfo._objNode = this.getNode("MoreBet_Node/player_BetMore");
        this.brand.push(this.BankerInfo);
        this.brand.push(this.PlayerInfo);

        for (var i = 0; i < this.brand.length; i++) {
            this.brand[i]._originPos = this.brand[i]._objNode.getPosition();
            this.brand[i].currentPos = this.brand[i]._originPos;
            this.brand[i].mostBetIndex = 0;
            this.brand[i].HashMap = {};
            this.initHashMap(this.brand[i]);
        }
    },

    initHashMap: function (whichInfo) {
        var seats = this.getNode("Table_Node/" + whichInfo._nodeName + "Node").children;
        for (var i = 0; i < seats.length; i++) {
            if (i == 0) {
                whichInfo.HashMap[i] = -1;
                continue;
            }
            whichInfo.HashMap[i] = 0;
        }
    },

    initVariable: function () {
        this.brand = [];
        this.betInfo = [];
        this.PlayerInfo = {};
        this.BankerInfo = {};
        this.SeatId = {};
    },

    update: function (dt) {
        for (var i = 0; i < this.brand.length; i++) {
            this.showBrand(this.brand[i]);
            this.SeatId[this.brand[i]._nodeName.substr(this.NAME_INDEX)] = this.brand[i].mostBetIndex;
            this.moveBrand(dt, this.brand[i]);
        }
    }
});