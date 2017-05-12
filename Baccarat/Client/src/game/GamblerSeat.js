/**
 * Created by helen_pai on 2017/1/5.
 */

var GamblerSeat = BaccaratSeat.extend({
    _seatChip: 0,
    

    getSeatChip: function () {
        return this._seatChip;
    },

    getSeatUserId: function () {
        return this._playerID;
    },

    ctor: function (i) {
        this._super(i);
    },

    updateSeatChip: function (chips) {
        this._seatChip = chips;
    },

    updateSeatsInfo:function (user_id) {
        this._playerID = user_id;
    },
});