/**
 * Created by Matt Hung on 2016/12/6.
 */

ui_SeatSelector = cc.Class.extend({
    _room: null,
    _seatData: [],

    ctor: function (room) {
        this._room = room;
      
    },

    update: function () {
        if (this._seatData.length > 0)
            this.checkSeats(this._seatData);
    },

    updateSeats: function (seats) {
        this._seatData = seats;
    },

    checkSeats: function (seats) {
        for (var i = 0; i < MAX_SEAT; i++) {

            if (this._room._id == 0)
                return;

            if (parseInt(seats[i].UserID) <= 0) {
                // baccaratPeer.getInstance().sendMessage("TakeSeat", {
                //     RoomID: this._room._id,
                //     SeatID: i + 1
                // });

                
                return;
            }
        }
        // cc.log("seats are full");
    }
});