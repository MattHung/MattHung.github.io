/**
 * Created by Matt Hung on 2016/12/6.
 */


ui_GameResult = gameLayer.extend({
    _scorll_view: null,

    _labels: null,

    _bg_mid_node: null,
    _bg_footer_node: null,

    _btn_confirm: null,
    _countdown_secs: 10,

    _rank_node_1: null,
    _rank_node_2: null,
    _rank_node_3: null,
    _rank_node_medium: null,

    _rank_node_below: null,

    ctor: function (rootNode) {
        this._super(rootNode);
        this.root_node.addChild(this);

        this._labels = {};
        this._labels.title = this.getNode("Language_Node/txt_ResultTitle");
        this._labels.session_type = this.getNode("Language_Node/txt_GameType");
        this._labels.session_num = this.getNode("Language_Node/txt_Session");
        this._labels.row_title_rank = this.getNode("Language_Node/txt_Rank");
        this._labels.row_title_account = this.getNode("Language_Node/txt_UserID");
        this._labels.row_title_bonus = this.getNode("Language_Node/txt_Prize");

        this._labels.row_title_rank.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this._labels.row_title_account.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this._labels.row_title_bonus.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);

        this._labels.txt_session_type = this.getNode("Language_Node/GameType");
        this._labels.txt_session_id = this.getNode("Language_Node/Session");

        this._scorll_view = this.getNode("Rank_Scroll");
        var top_offset = 240 - this._scorll_view.getContentSize().height;
        this._scorll_view.setContentSize(this._scorll_view.getContentSize().width, this._scorll_view.getContentSize().height + top_offset);
        this._scorll_view.setPositionY(this._scorll_view.getPositionY() - top_offset);
        this._scorll_view.setLocalZOrder(10);

        this.getNode("Prize_Node").setLocalZOrder(10);

        this._rank_node_1 = this.getNode("Rank_Scroll/No1_Node");
        this._rank_node_2 = this.getNode("Rank_Scroll/No2_Node");
        this._rank_node_3 = this.getNode("Rank_Scroll/No3_Node");
        this._rank_node_medium = this.getNode("Rank_Scroll/No4_Node");
        this._rank_node_medium.setVisible(false);

        this._bg_mid_node = this.getNode("BG_Mid_Node");
        this._bg_mid_node.setVisible(false);

        this._bg_footer_node = this.getNode("BG_footer_Node");
        this._bg_footer_node.setVisible(false);

        this._rank_node_below = [];

        this._btn_confirm = this.getNode("Btn_Confirm");
        this._btn_confirm.text = this.getNode("Btn_Confirm/txt_Confirm");
        this._btn_confirm.text.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this._btn_confirm.text.setLocalZOrder(10);
        this._btn_confirm.img_hover = this.getNode("Btn_Confirm/Pic_Btn_over");
        this._btn_confirm.img_hover.setAnchorPoint(cc.p(0, 0));
        this._btn_confirm.img_hover.setPosition(0, 0);
        this._btn_confirm.img_hover.setVisible(false);

        this.registerMouseEvent(this._btn_confirm, null,
            function (node, mouseHitPoint) {
                this.requestLeaveRoom();
                this._btn_confirm.img_hover.setVisible(false);
                this.root_node.setVisible(false);
            },
            function (node, mouseHitPoint) {
                this._btn_confirm.img_hover.setVisible(true);
            }, function (node, mouseHitPoint) {
                this._btn_confirm.img_hover.setVisible(false);
            });

        this.registerMouseEvent(this.getNode("black_alpha_70"),
            function (node, mouseHitPoint) {

            });

        this.root_node.setLocalZOrder(10);
        this.root_node.setVisible(false);
    },

    requestLeaveRoom: function () {
        if (GameManager.getInstance().Room)
            baccaratPeer.getInstance().sendMessage("LeaveRoom", {RoomID: GameManager.getInstance().Room.getRoomID()});
    },

    update: function (dt) {
        this._countdown_secs -= dt;

        if (!this.root_node.visible)
            return;

        if (this._countdown_secs < 0)
            if (this.root_node.visible) {
                this.requestLeaveRoom();
                this.root_node.setVisible(false);
                this._countdown_secs = 0;
            }

        this._labels.title.setString(language_manager.getInstance().getTextID(87));
        this._labels.session_type.setString(language_manager.getInstance().getTextID(88));
        this._labels.session_num.setString(language_manager.getInstance().getTextID(75));

        this._labels.row_title_rank.setString(language_manager.getInstance().getTextID(89));
        this._labels.row_title_account.setString(language_manager.getInstance().getTextID(164));
        this._labels.row_title_bonus.setString(language_manager.getInstance().getTextID(83));

        var btn_txt = String.format("{0}", language_manager.getInstance().getTextID(90));
        if (this._countdown_secs >= 0)
            btn_txt += String.format("({0})", Math.ceil(this._countdown_secs));

        this._btn_confirm.text.setString(btn_txt);
    },

    showRank: function (session_name, sessoin_id, data) {
        var personalName = AccountCenter.getInstance().getUserName();
        this.root_node.setVisible(true);
        this._countdown_secs = 10;

        this._labels.txt_session_type.setString(session_name);
        this._labels.txt_session_id.setString(sessoin_id);

        var height = 0;

        var highRank_node_height = 40;
        var normalRank_node_height = 30;

        for (var index in data) {
            var rankInfo = data[index];
            var rank = rankInfo.Rank;

            if (rank <= 3) {
                height += highRank_node_height;
            }
            else {
                height += normalRank_node_height;
            }
        }

        height = height < 120 ? 120 : height;

        this._scorll_view.setInnerContainerSize(cc.size(this._scorll_view.getContentSize().width, height));

        var top = this._scorll_view.getInnerContainerSize().height;
        var top_bg = this._bg_mid_node.getPositionY();

        top -= 15;

        for (var index in data) {
            var rankInfo = data[index];
            var rank = rankInfo.Rank;
            var user_name = rankInfo.UserName;
            var bunus = rankInfo.Bonus;

            var rank_node;
            var bg_sprite;
            var node_obj = {};

            if (rank <= 3) {
                rank_node = this["_rank_node_" + rank.toString()];
                rank_node.setPositionY(top);
                top -= highRank_node_height;
            }
            else {
                rank_node = CocosWidget.cloneNode(this._rank_node_medium);
                rank_node.setPositionY(top);

                if (rank <= 7) {
                    bg_sprite = CocosWidget.cloneNode(this._bg_mid_node);
                    bg_sprite.setVisible(true);
                    bg_sprite.setPositionY(top_bg);
                    this.root_node.addChild(bg_sprite);
                    top_bg -= normalRank_node_height;
                }

                var textNode_No = CocosWidget.getNode(rank_node, "No");
                var textNode_UserID = CocosWidget.getNode(rank_node, "UserID");
                var textNode_Prize = CocosWidget.getNode(rank_node, "Prize");

                textNode_No.setPositionX(-156);
                textNode_UserID.setPositionX(-30);
                textNode_Prize.setPositionX(148);

                this._scorll_view.addChild(rank_node);
                top -= normalRank_node_height;
            }

            rank_node.setVisible(true);

            this.connectNode(rank_node, node_obj);
            node_obj.No.setString(rank);

            var name = user_name;
            if (personalName != name)
                name = "***" + name.substr(name.length - 3);

            node_obj.UserID.setString(name);
            node_obj.Prize.setString(bunus);
            node_obj.UserID.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            node_obj.Prize.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);

            if (personalName == name) {
                node_obj.UserID.setColor(new cc.Color(225, 225, 0));
                node_obj.Prize.setColor(new cc.Color(225, 225, 0));
            }

            if (personalName != name) {
                node_obj.UserID.setColor(new cc.Color(225, 225, 225));
                node_obj.Prize.setColor(new cc.Color(225, 225, 225));
            }
        }

        this._bg_footer_node.setPositionY(top_bg);
        this._bg_footer_node.setVisible(true);
    }
});