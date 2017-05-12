/**
 * Created by Matt Hung on 2016/12/6.
 */


BaccaratSeat = BaccaratViewer.extend({
    _seatID: 0,

    getSeatID: function () {
        return this._seatID;
    },

    ctor: function (id) {
        this._super();
        this._seatID = id;
    }
});