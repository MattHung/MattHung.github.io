/**
 * Created by Matt Hung on 2016/12/6.
 */


AccountCenter = cc.Class.extend({
    _accountSave: null,
    _session_id: "",
    seatNo: 0,
    chip_select: {},
    select_name: null,

    getUserID: function () {
        return this._accountSave.UserID;
    },

    getHallID: function () {
        return this._accountSave.HallID;
    },

    getUserName: function () {
        return this._accountSave.UserName;
    },
    getPayWay: function () {
        return this._accountSave.PayWay;
    },

    getCurrency: function () {
        return this._accountSave.Currency;
    },

    getBalance: function () {
        return this._accountSave.Balance;
    },

    setSessionID: function (value) {
        this._session_id = value;
    },

    getSessionID: function () {
        return this._session_id;
    },
    setSeatNo: function (no) {
        this.seatNo = no;
    },
    getSeatNo: function () {
        return this.seatNo;
    },

    getSelectName: function () {
        return this.select_name;
    },

    setSelectName: function (chip_name) {
        this.select_name = chip_name;
    },

    setChipSelect: function (data) {
        if (data.Setting == "") {
            this.chip_select = {};
            this.chip_select.viewer = {};
            this.chip_select.contestant = {};
            return;
        }

        var json_data = JSON.parse(data.Setting);
        var json_viewer = json_data.viewer;
        var json_contestant = json_data.contestant;
        this.chip_select.viewer = json_viewer;
        this.chip_select.contestant = json_contestant;
    },

    getContestantChoose: function () {
        if (this.chip_select.contestant)
            return this.chip_select.contestant;
        return {};
    },

    getViewerChoose: function () {
        if (this.chip_select.viewer)
            return this.chip_select.viewer;
        return {};
    },

    setContestantChoose: function (index, val) {
        this.chip_select.contestant[index] = val;
    },

    setViewerChoose: function (index, val) {
        this.chip_select.viewer[index] = val;
    },

});


AccountCenter._instance = null;

AccountCenter.getInstance = function () {

    if (AccountCenter._instance == null)
        AccountCenter._instance = new AccountCenter();

    return AccountCenter._instance;
};