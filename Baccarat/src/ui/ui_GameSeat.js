/**
 * Created by helen_pai on 2016/12/9.
 */

var ui_GameSeat = gameLayer.extend({
    FRONT_NAME: 3,
    NO_SEAT: 4,
    CORRECT_PERSONAL_X: 5,
    _mainNodes: null,
    _room: null,
    _seatChipNode: null,
    _isTakeSeat: -1,

    imgPersonal: null,
    Setting_over: null,

    _bet_area_sets: null,

    ctor: function (main_nodes, room) {
        this._super(main_nodes);
        this._mainNodes = main_nodes;
        this._room = room;
        this.initialControls();
        this.initVariable();
    },

    initialControls: function () {
        this.imgPersonal = this.getNode("Table_Node/bet_area_set_icon");
        this.Setting_over = this.getNode("Other_Node/Setting_over");

        this._bet_area_sets = {};

        for (var i = 0; i < MAX_SEAT; i++) {
            var clientSeatID = i + 1;
            if (clientSeatID >= this.NO_SEAT)
                clientSeatID += 1;

            this._bet_area_sets[clientSeatID] = {};
            this._bet_area_sets[clientSeatID].bg = this.getNode("Table_Node/Player_Set_Node/bet_area_set_" + clientSeatID);
            this._bet_area_sets[clientSeatID].bg_texture = this._bet_area_sets[clientSeatID].bg.getTexture();
            this._bet_area_sets[clientSeatID].hide_texture = this.getNode("Other_Node/PassAndBlind_Node/Seat/Blind/bet_area_set_" + clientSeatID).getTexture();
            this._bet_area_sets[clientSeatID].pass_texture = this.getNode("Other_Node/PassAndBlind_Node/Seat/Pass/bet_area_set_" + clientSeatID).getTexture();

            this._bet_area_sets[clientSeatID].txt_user_name = CocosWidget.getNode(this._bet_area_sets[clientSeatID].bg, "userID");
            this._bet_area_sets[clientSeatID].txt_chip = CocosWidget.getNode(this._bet_area_sets[clientSeatID].bg, "txt_chip");
        }
    },

    initVariable: function () {
        this._seatChipNode = null;
        this._isTakeSeat = -1;
    },

    convertToUISeatID: function (seat_id) {
        var clientSeat = seat_id;
        if (clientSeat >= this.NO_SEAT)
            clientSeat += 1;

        return clientSeat;
    },

    updateSeats: function () {
        if (CURRENT_SCENE == SceneEnum.NULL)
            return;

        var seatData = GameManager.getInstance().Room.getSeatData();
        this._isTakeSeat = -1;

        for (var i = 0; i < seatData.length; i++) {
            var clientSeatID = i + 1;
            if (clientSeatID >= this.NO_SEAT)
                clientSeatID += 1;

            var seatLabel = this._bet_area_sets[clientSeatID].txt_user_name;
            seatLabel.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);

            if (seatData[i].getSeatUserId() == 0) {
                seatLabel.setString("");
                continue;
            }
            if (seatData[i].getSeatUserId() == AccountCenter.getInstance().getUserID()) {
                this._isTakeSeat = seatData[i].getSeatID();
                seatLabel.setString("");
                continue;
            }
            var seatName = GameManager.getInstance().getUserName(seatData[i].getSeatUserId());
            seatLabel.setString(seatName);
        }

        if (this._isTakeSeat == -1) {
            this.imgPersonal.setPosition(this.Setting_over.getPosition());
            return;
        }

        var clientSeat = this._isTakeSeat + 1;
        if (clientSeat >= this.NO_SEAT)
            clientSeat += 1;
        var tableSeatPos = this._bet_area_sets[clientSeat].bg.convertToWorldSpace(new cc.Point(0, 0));
        var tableSeat = this._bet_area_sets[clientSeat].bg;
        this.imgPersonal.setPosition(tableSeatPos.x + tableSeat.width / 2 * tableSeat.getScaleX(), tableSeatPos.y + tableSeat.height / 2 * tableSeat.getScaleY());
    },

    updateSeatChipArea: function () {
        if (CURRENT_SCENE == SceneEnum.NULL)
            return;

        var seatData = GameManager.getInstance().Room.getSeatData();

        for (var i = 0; i < seatData.length; i++) {
            var nameCount = i + 1;
            if (nameCount >= this.NO_SEAT)
                nameCount += 1;
            var clientSeatID = nameCount;
            this._seatChipNode = this._bet_area_sets[clientSeatID].txt_chip;
            if (seatData[i].getSeatChip() == 0) {
                this._seatChipNode.setString("");
                continue;
            }
            var chipCount = seatData[i].getSeatChip().toString();
            this._seatChipNode.setString(chipCount);
            this._seatChipNode.setColor(new cc.Color(255, 255, 0));
            this._seatChipNode.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        }
    },

    update: function (dt) {
        this.updateSeatChipArea();
        this.updateSeats();
    },

    showBetAction: function (user_id, seat_id, hide, pass) {
        if (user_id == 0)
            return;
        var clientSeatID = this.convertToUISeatID(seat_id);

        if (hide)
            this._bet_area_sets[clientSeatID].bg.setTexture(this._bet_area_sets[clientSeatID].hide_texture);
        if (pass)
            this._bet_area_sets[clientSeatID].bg.setTexture(this._bet_area_sets[clientSeatID].pass_texture);
    },

    onRoundOver: function () {
        var seatData = GameManager.getInstance().Room.getSeatData();

        for (var i = 0; i < seatData.length; i++) {

            var clientSeatID = i + 1;
            if (clientSeatID >= this.NO_SEAT)
                clientSeatID += 1;

            this._bet_area_sets[clientSeatID].bg.setTexture(this._bet_area_sets[clientSeatID].bg_texture);
        }
    }

});