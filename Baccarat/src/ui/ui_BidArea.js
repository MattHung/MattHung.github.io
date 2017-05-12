/**
 * Created by jeff_chien on 2016/12/14.
 */
var ui_BidArea = gameLayer.extend({
    _room: null,
    _bid_node: null,
    _cards_sample: [],
    _card_nodes: {},
    _playerMsgUI: {},
    _clippingNode: [],
    _bidPicGroup: [],
    _displaySprite: [],

    ctor: function (mainNode, room) {
        this._super(mainNode);
        this._bid_node = this.getNode("Big_Show_Poker_Node");
        this._bid_node.addChild(this);
        this._room = room;

        this.initialCardSample();
        this.initialCardDisplayArea();
        this.initialClipPic();
        this.initialClippingNode();
        this.initialUI();

        for (var i = 0; i < this._bidPicGroup.length; i++)
            this.openCard(i, this._clippingNode[i]);

        this._bid_node.setVisible(false);
        cc.director.getScheduler().scheduleUpdate(this);
    },

    update: function () {
        var playerSeatID = this._room.uiMostBrand.getSeatId("Player");
        var bankerSeatID = this._room.uiMostBrand.getSeatId("Banker");

        if (this._room.getStatus() == RoundStatus.CheckResult) {
            if (playerSeatID == null) {
                this._playerMsgUI.playerBG.setVisible(false);
                this._playerMsgUI.playerText.setVisible(false);
            } else {
                this._playerMsgUI.playerText.setString("***" + this._room.getSeatData()[playerSeatID].getPlayerName().slice(3) + language_manager.getInstance().getTextID(17));
            }
            if (bankerSeatID == null) {
                this._playerMsgUI.bankerBG.setVisible(false);
                this._playerMsgUI.bankerText.setVisible(false);
            } else {
                this._playerMsgUI.bankerText.setString("***" + this._room.getSeatData()[bankerSeatID].getPlayerName().slice(3) + language_manager.getInstance().getTextID(18));
            }
        }
    },

    initialCardSample: function () {
        // _cards_sample
        var sample_root_node = this.getNode("Big_Show_Poker_Node/Big_Poker");

        var name = "";
        var point = 0;

        this._cards_sample.push(null);

        for (var i = 1; i <= 52; i++) {

            name = "poker_spades_";

            if (i > 13)
                name = "poker_heart_";

            if (i > 26)
                name = "poker_diamonds_";

            if (i > 39)
                name = "poker_clubs_";

            point = i % 13;
            point = point == 0 ? 13 : point;

            var card_node = this.getNode("Big_Show_Poker_Node/Big_Poker/pic_" + name + point);
            this._cards_sample.push(card_node);
        }

        var btn_up = this.getNode("Big_Show_Poker_Node/Big_Poker/btn_poker_banker_up_1");
        this._cards_sample.push(btn_up);
    },

    initialClipPic: function () {
        for (var i = 0; i < 4; i++) {
            var group = {};
            group._card = cc.Sprite.create(this._cards_sample[1].getTexture());
            group._stencil = cc.Sprite.create(this._cards_sample[52].getTexture());
            group.bg = cc.Sprite.create(this._cards_sample[53].getTexture());

            var posX = this._card_nodes["Card" + (i + 1)].getPosition().x;
            var posY = this._card_nodes["Card" + (i + 1)].getPosition().y;
            group.bg.setPosition(posX, posY);
            group._card.setPosition(posX, posY - group.bg.height);
            group._stencil.setPosition(group.bg.getPosition().x, group.bg.getPosition().y);
            this._bidPicGroup.push(group);
        }
    },

    initialCardDisplayArea: function () {
        for (var i = 1; i <= 4; i++) {
            var name = "";
            var picSprite = cc.Sprite.create(this._cards_sample[53].getTexture());
            switch (i) {
                case 1:
                    name = "Big_Show_Poker_Node/Big_Poker_position/Big_Poker_Player1";
                    break;
                case 2:
                    name = "Big_Show_Poker_Node/Big_Poker_position/Big_Poker_Player2 ";
                    break;
                case 3:
                    name = "Big_Show_Poker_Node/Big_Poker_position/Big_Poker_Banker1";
                    break;
                case 4:
                    name = "Big_Show_Poker_Node/Big_Poker_position/Big_Poker_Banker2";
                    break;
            }

            this._card_nodes["Card" + i] = this.getNode(name);
            picSprite.setPosition(this._card_nodes["Card" + i].getPosition());
            this.addChild(picSprite);
            this._displaySprite.push(picSprite);
            picSprite.setVisible(false);
        }
    },

    initialClippingNode: function () {
        for (var i = 0; i < this._bidPicGroup.length; i++) {
            var _clippingNode = new cc.ClippingNode(this._bidPicGroup[i]._stencil);
            this.addChild(_clippingNode);
            _clippingNode.setInverted(false);

            _clippingNode.addChild(this._bidPicGroup[i].bg);
            _clippingNode.addChild(this._bidPicGroup[i]._card);

            this._clippingNode.push(_clippingNode);
        }
    },

    initialUI: function () {
        this._playerMsgUI.playerText = this.getNode("Big_Show_Poker_Node/txt_playerBid");
        this._playerMsgUI.bankerText = this.getNode("Big_Show_Poker_Node/txt_bankerBid");
        this._playerMsgUI.playerBG = this.getNode("Big_Show_Poker_Node/playerBid");
        this._playerMsgUI.bankerBG = this.getNode("Big_Show_Poker_Node/bankerBid");
    },

    setCards: function (order, card_id, visible) {
        this.showCard(order, card_id, visible);
    },

    showCard: function (order, card_id, visible) {
        if (card_id <= 0)
            return;
        var texture = this._cards_sample[card_id].getTexture();

        if (order <= 4) {
            this._displaySprite[order - 1].setTexture(texture);
            this._displaySprite[order - 1].setVisible(false);
            this._bidPicGroup[order - 1]._card.setTexture(texture);
        }
    },

    openCard: function (no, group) {
        var isClick = false;
        var nodePos = null;
        var clipY = 0;
        var cardY = 0;
        var newPos = 0;
        var oldPos = 0;

        nodePos = this._card_nodes["Card" + (no + 1)].getPosition();
        clipY = this._bidPicGroup[no].bg.getPosition().y;
        cardY = this._card_nodes["Card" + (no + 1)].getPosition().y - this._bidPicGroup[no].bg.height;

        var moveEvent = cc.EventListener.create({
            event: cc.EventListener.MOUSE,

            onMouseDown: function (event) {
                var pos = event.getLocation();
                var target = event.getCurrentTarget();
                oldPos = pos;
                if ((!!cc.rectContainsPoint(target.getBoundingBox(), pos)) == true && this._room.getStatus() == RoundStatus.CheckResult)
                    isClick = true;
                return !!cc.rectContainsPoint(target.getBoundingBox(), pos);
            }.bind(this),

            onMouseMove: function (event) {

                var pos = event.getLocation();
                var target = event.getCurrentTarget();
                if (isClick) {
                    this.cardAction(pos);
                }
                return false;
            },

            onMouseUp: function (event) {
                var pos = event.getLocation();
                var target = event.getCurrentTarget();

                if (isClick) {
                    this._clippingNode[no]._stencil.setPosition(this._card_nodes["Card" + (no + 1)].getPosition());
                    this._bidPicGroup[no]._card.setPosition(nodePos.x, nodePos.y - this._bidPicGroup[no]._card.height);
                    isClick = false;
                }
                return false;
            }.bind(this),

            cardAction: function (pos) {
                newPos = pos;
                var movement = (newPos.y - oldPos.y);

                if (group._stencil.getPosition().y + movement / 2 < this._bidPicGroup[no].bg.getPosition().y) {
                    group._stencil.setPosition(nodePos.x, nodePos.y);
                    this._bidPicGroup[no]._card.setPosition(nodePos.x, nodePos.y - this._bidPicGroup[no]._card.height);
                    return;
                }

                if (group._stencil.getPosition().y > this._bidPicGroup[no].bg.getPosition().y + this._bidPicGroup[no].bg.height / 3 * 2) {
                    group.setVisible(false);
                    this._displaySprite[no].setVisible(true);

                    return;
                }

                group._stencil.setPosition(nodePos.x, clipY + movement / 2);
                this._bidPicGroup[no]._card.setPosition(nodePos.x, cardY + movement);

            }.bind(this)
        });

        cc.eventManager.addListener(moveEvent, group._stencil);
    },

    clear: function () {
        for (var i = 0; i < this._clippingNode.length; i++) {
            this._clippingNode[i].setVisible(true);
            this._clippingNode[i]._stencil.setPosition(this._card_nodes["Card" + (i + 1)].getPosition());
            this._bidPicGroup[i]._card.setPosition(this._card_nodes["Card" + (i + 1)].getPosition().x, this._card_nodes["Card" + (i + 1)].getPosition().y - this._bidPicGroup[i]._card.height);
            this._displaySprite[i].setVisible(false);
        }

        this._playerMsgUI.playerBG.setVisible(true);
        this._playerMsgUI.playerText.setVisible(true);
        this._playerMsgUI.bankerBG.setVisible(true);
        this._playerMsgUI.bankerText.setVisible(true);
    }
});