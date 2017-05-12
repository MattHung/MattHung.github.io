/**
 * Created by helen_pai on 2017/1/9.
 */

var GamblerRank = cc.Class.extend({
    _rank: 0,
    _userID: 0,
    _userName: null,
    _payOff: 0,
    _dateTime: null,
    _isUpdate: false,
    _isTodayUpdate: false,

    _isPastUpdate: false,
    _count:0,
    _date:null,
    _highestAward:0,

    setTodayUpdate: function (is_update) {
        this._isTodayUpdate = is_update;
    },

    setPastUpdate: function (is_update) {
        this._isPastUpdate = is_update;
    },


    getTodayUpdate: function () {
        return this._isTodayUpdate;
    },

    getPastUpdate: function () {
        return this._isPastUpdate;
    },

    getUserId: function () {
        return this._userID;
    },

    getRankUserName: function () {
        return this._userName;
    },

    getPayOff: function () {
        return this._payOff;
    },

    getDateTime: function () {
        return this._dateTime;
    },

    getCount:function(){
        return this._count;
    },

    getDate:function(){
        return this._date;
    },

    getHighestAward:function(){
        return this._highestAward;
    },

    ctor: function (index, data,which) {
        if(which=="today"){
            this._rank = index;
            this._userID = data.UserID;
            this._userName = data.UserName;
            this._payOff = data.Payoff;
            this._dateTime = data.dateTime;
            this._isTodayUpdate = true;
        }

        if(which=="past"){
            this._count = data.Count;
            this._date = data.Date;
            this._highestAward = data.HighestAward;
            this._isPastUpdate = true;
        }


    }


});