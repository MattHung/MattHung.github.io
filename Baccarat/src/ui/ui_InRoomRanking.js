/**
 * Created by Matt Hung on 2016/12/6.
 */

ui_InRoomRanking = gameLayer.extend({
    _rank_info: null,
    _previously_rank_info: null,
    _ui_panel: null,
    _sprite_ranking_up: null,
    _sprite_ranking_down: null,
    _namePos: null,
    _scorePos: null,
    _isFirst: true,
    _animateStatus: {
        reduce: 0,
        enlarge: 1
    },

    ctor: function (rootNode) {
        this._super(rootNode);

        this._rank_info = [];
        this._previously_rank_info = {};
        this._isFirst = true;

        for (var i = 0; i <MAX_SEAT; i++)
            this._rank_info.push({seat_id:i+1, user_id:0, user_name:"", chips:0});

        this._ui_panel = {};
        this.connectNode(this.getNode("Gambler_MainMsg_Node/Ranking_Node"), this._ui_panel);

        this.initial();
        // this.updateUI();
    },

	getCount:function(){
		var result = 0;
		for(var i = 0; i < this._rank_info.length; i++)
		if(this._rank_info[i].user_id > 0)
			result ++;

		return result;
	},

    initial: function () {
        this._sprite_ranking_up = this._ui_panel.pic_rank_up;
        this._sprite_ranking_down = this._ui_panel.pic_rank_down;

        this._namePos = [];
        this._scorePos = [];

        this._sprite_ranking_up.setVisible(false);
        this._sprite_ranking_down.setVisible(false);


        for (var i = 0; i < this._rank_info.length; i++) {
            var seat_id = i + 1;
            var x = this._ui_panel["txt_Award" + seat_id.toString()].getPosition().x;
            var y = this._ui_panel["txt_Award" + seat_id.toString()].getPosition().y;
            this._ui_panel["txt_Award" + seat_id.toString()].setString("");
            var sprite_up = new cc.Sprite(this._sprite_ranking_up.getTexture());
            var sprite_down = new cc.Sprite(this._sprite_ranking_down.getTexture());
            this._scorePos.push(cc.p(x, y));
            x += 20;
            y += 3;

			sprite_up.setPosition(cc.p(x, y));
			sprite_down.setPosition(cc.p(x, y));

			sprite_up.setName("icon_up" + seat_id.toString());
			sprite_down.setName("icon_down" + seat_id.toString());

			sprite_up.setVisible(false);
			sprite_down.setVisible(false);

			var parentNode = this.getNode("Gambler_MainMsg_Node/Ranking_Node");

			parentNode.addChild(sprite_up);
			parentNode.addChild(sprite_down);
		}

		this.connectNode(this.getNode("Gambler_MainMsg_Node/Ranking_Node"), this._ui_panel);

		var profile_icon = this.getNode("Table_Node/bet_area_set_icon");

        for (var i = 0; i < MAX_SEAT; i++) {
            var seat_id = (i + 1);
            var pos = this._ui_panel["txt_userID" + seat_id.toString()].getPosition();
            this._ui_panel["txt_userID" + seat_id.toString()].setString("");
            this._namePos.push(cc.p(pos.x, pos.y));
            pos.x -= 10;

            this._ui_panel["txt_userID" + seat_id.toString()].profile_icon = new cc.Sprite(profile_icon.getTexture());
            this._ui_panel["txt_userID" + seat_id.toString()].profile_icon.setPosition(pos.x, pos.y);
            this._ui_panel["txt_userID" + seat_id.toString()].profile_icon.setVisible(false);

            this.root_node.addChild(this._ui_panel["txt_userID" + seat_id.toString()].profile_icon);
        }

        for (var i = 0; i < 7; i++) {
            var seat_id = (i + 1);
            this._ui_panel["txt_Ranking" + seat_id.toString()];
        }

        for (var i = 0; i < 7; i++) {
            var seat_id = (i + 1);
            this._ui_panel["pic_rank_frame_" + seat_id.toString()];
        }
    },

	getIndex:function(seat_id){
		for(var i=0; i < this._rank_info.length; i++)
		if(this._rank_info[i].seat_id==seat_id)
			return i;

		return -1;
	},

	updateInfo:function(seat_id, user_id, user_name, chips){
		var index = this.getIndex(seat_id);

		if(index<0)
			return;

        this._rank_info[index].user_id = user_id;
        this._rank_info[index].user_name = user_name;
        this._rank_info[index].chips = chips;
        this._rank_info.sort(function (info_a, info_b) {
            return info_b.chips - info_a.chips;
        });
    },

	clear:function(seat_id){
		var index = this.getIndex(seat_id);

        this._rank_info[index].user_name = "";
        this._rank_info[index].chips = "";
    },

	clearAll:function(){
		this._previously_rank_info = {};

		for(var i=0; i < this._rank_info.length; i++)
			this.clear(this._rank_info[i].seat_id);
	},

    recordPreviouslyRank: function () {
        this._previously_rank_info = {};
        for (var i = 0; i < this._rank_info.length; i++) {
            var user_id = this._rank_info[i].user_id;
            this._previously_rank_info[user_id] = this._rank_info[i].chips;
        }
    },

    updateUI: function () {
        var cloneData = [];
        for (var i = 0; i < this._rank_info.length; i++) {
            var ref_data = this._rank_info[i];
            cloneData.push({user_id: ref_data.user_id, user_name: ref_data.user_name, chips: ref_data.chips});
        }

        this.scaleInfo(0.1, this._rank_info.length, 0, 1, 0, cloneData);
        this.scaleInfo(0.1, this._rank_info.length, 0.4, 1, 1, cloneData);
    },

    scaleInfo: function (interval, repeat, delay, scaleX, scaleY, data) {
        var count = -1;
        if (scaleY == this._animateStatus.enlarge)
            this._rank_info.sort(function (info_a, info_b) {
                return info_b.chips - info_a.chips;
            });

        cc.director.getScheduler().schedule(function () {
            ++count;
            if (count > data.length - 1)return;
            var rank_index = count + 1;
            var user_id = data[count].user_id;
            var txt_user_name = data[count].user_name;
            var txt_chips = data[count].chips;
            var duration = 0.3;

            var action_1 = cc.scaleTo(duration, scaleX, scaleY);
            this._ui_panel["txt_Ranking" + rank_index.toString()].runAction(action_1);
            if (scaleY == this._animateStatus.enlarge)
                this._ui_panel["txt_Ranking" + rank_index.toString()].setVisible(true);

            var action_2 = cc.scaleTo(duration, scaleX, scaleY);
            this._ui_panel["txt_userID" + rank_index.toString()].runAction(action_2);
            this._ui_panel["txt_userID" + rank_index.toString()].setVisible(true);
            if (scaleY == this._animateStatus.enlarge && user_id != AccountCenter.getInstance().getUserID())
                this._ui_panel["txt_userID" + rank_index.toString()].setString(txt_user_name);

            var action_3 = cc.scaleTo(duration, scaleX, scaleY);
            this._ui_panel["txt_Award" + rank_index.toString()].runAction(action_3);
            if (scaleY == this._animateStatus.enlarge)
                this._ui_panel["txt_Award" + rank_index.toString()].setString(txt_chips);

            var action_4 = cc.scaleTo(duration, scaleX, scaleY);
            this._ui_panel["pic_rank_frame_" + rank_index.toString()].runAction(action_4);

            var chips = data[count].chips;

            this._ui_panel["icon_up" + rank_index.toString()].setVisible(false);
            this._ui_panel["icon_down" + rank_index.toString()].setVisible(false);

            if (scaleY == this._animateStatus.enlarge)
                if (user_id == AccountCenter.getInstance().getUserID()) {
                    this._ui_panel["txt_Award" + rank_index.toString()].setColor(new cc.Color(255, 255, 0));
                    this._ui_panel["txt_userID" + rank_index.toString()].setVisible(false);
                    this._ui_panel["txt_userID" + rank_index.toString()].profile_icon.setVisible(true);
                }
                else {
                    this._ui_panel["txt_Award" + rank_index.toString()].setColor(new cc.Color(255, 255, 255));
                    this._ui_panel["txt_userID" + rank_index.toString()].setVisible(true);
                    this._ui_panel["txt_userID" + rank_index.toString()].profile_icon.setVisible(false);
                }

            var action_5 = cc.scaleTo(duration, scaleX, scaleY);
            this._ui_panel["txt_userID" + rank_index.toString()].profile_icon.runAction(action_5);

            if (scaleY == this._animateStatus.enlarge)
                if (chips > this._previously_rank_info[user_id]) {
                    this._ui_panel["icon_up" + rank_index.toString()].setVisible(true);
                }
            if (scaleY == this._animateStatus.enlarge)
                if (chips < this._previously_rank_info[user_id]) {
                    this._ui_panel["icon_down" + rank_index.toString()].setVisible(true);
                }

            var action_6 = cc.scaleTo(duration, scaleX, scaleY);
            this._ui_panel["icon_up" + rank_index.toString()].runAction(action_6);
            var action_7 = cc.scaleTo(duration, scaleX, scaleY);
            this._ui_panel["icon_down" + rank_index.toString()].runAction(action_7);

            if (scaleY == this._animateStatus.enlarge && count == data.length - 1) {
                this.recordPreviouslyRank();
            }

            if (user_id <= 0) {
                this._ui_panel["txt_userID" + rank_index.toString()].setString("");
                this._ui_panel["txt_Award" + rank_index.toString()].setString("");
                this._ui_panel["txt_Ranking" + rank_index].setVisible(false);
                this._ui_panel["icon_up" + rank_index.toString()].setVisible(false);
                this._ui_panel["icon_down" + rank_index.toString()].setVisible(false);
                return;
            }

        }.bind(this), this, interval, repeat, delay, false, "");
    },

    gameOver: function () {
        this._rank_info.sort(function (info_a, info_b) {
            return info_b.chips - info_a.chips;
        });

        for (var i = 0; i < this._rank_info.length; i++) {
            var rank_index = i + 1;
            var seatID = this._rank_info[i].seat_id;

            this._ui_panel["txt_userID" + seatID.toString()].setString("");
            this._ui_panel["txt_Award" + seatID.toString()].setString("");
            this._ui_panel["txt_Ranking" + rank_index].setVisible(true);
            this._ui_panel["icon_up" + rank_index.toString()].setVisible(false);
            this._ui_panel["icon_down" + rank_index.toString()].setVisible(false);
            this._ui_panel["txt_userID" + rank_index.toString()].profile_icon.setVisible(false);

        }
    }
});