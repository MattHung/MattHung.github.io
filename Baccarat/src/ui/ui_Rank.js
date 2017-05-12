/**
 * Created by helen_pai on 2016/12/22.
 */

var TodayElement = {
    UserName: 0,
    txt_Bouns: 1,
    Bg: 2,
    Crown: 3,
    Portrait: 4,
    Number: 5
};

var FormerlyElement = {
    Date: 0,
    TotalAmount: 1,
    MostMoney: 2,
    TableLine: 3
};


var RankClassify = {
    Today: "TodayGamblers_Node",
    Formerly: "FormerlyGamblers_Node"
};

var RankIndex = {
    Today: 0,
    Formerly: 1
};

var Participate = {
    Today: "TodayParticipants_Node",
    Total: "TotalParticipants_Node"
};


var ui_Rank = gameLayer.extend({
    BUTTON_CLASSIFY: 4,
    TOP_THREE: 3,
    CLONE_ITEM: 2,
    CUT_NAME: 3,
    TODAY_LEAST_LIST: 9,
    TODAY_MAX_LIST: 20,
    signRoom: null,
    rankInfoArray: [],
    participateArray: [],
    rankNode: null,
    numInfo: {},
    listBox: {},
    updateList: null,
    _rankMask: null,
    _LanguageTitle: {},
    _userName: "",
    _enterRank: {},

    ctor: function (god_main_node, sign_room) {
        this._super(god_main_node);
        this.signRoom = sign_room;
        this.rankNode = this.getNode("Ranking_Node");
        this.initVariable();
        this.initRank();
        this.initPeopleCount();
        this.initLoadUI();
        this.initMouse();
        this.eventBuild();
    },

    initMouse: function () {
        this._enterRank = {};
        this._enterRank.enter_today = false;
        this._enterRank.enter_formerly = false;

        var todayEvent = cc.EventListener.create({
            event: cc.EventListener.MOUSE,

            onMouseDown: function (event) {
                if (this.signRoom._msgOpen)
                    return false;
                if (this._enterRank.enter_today) {
                    if (eventInTransparentMask(this.rankInfoArray[RankIndex.Today]._btnClassify, event.getLocation())) {
                        if (this.rankInfoArray[RankIndex.Today]._btnClassify._onPressStateChangedToNormal)
                            this.rankInfoArray[RankIndex.Today]._btnClassify._onPressStateChangedToNormal();

                    }
                }
            }.bind(this),

            onMouseMove: function (event) {
                if (this.signRoom._msgOpen)
                    return;
                var pos = event.getLocation();

                if (this._enterRank.enter_today) {
                    var hover = true;
                    if (!eventInTransparentMask(this.rankInfoArray[RankIndex.Today]._btnClassify, pos)) {
                        hover = false;
                    }
                    this.rankInfoArray[RankIndex.Today]._hoverImage.setVisible(!hover);
                    this.rankInfoArray[RankIndex.Formerly]._hoverImage.setVisible(hover);
                }

                if (this._enterRank.enter_formerly) {
                    var hover_formerly = true;
                    if (eventInTransparentMask(this.rankInfoArray[RankIndex.Formerly]._btnClassify, pos))
                        hover_formerly = false;
                    this.rankInfoArray[RankIndex.Formerly]._hoverImage.setVisible(hover_formerly);
                }
                return false;
            }.bind(this),

            onMouseUp: function (event) {
                if (this.signRoom._msgOpen)
                    return;
                if (this._enterRank.enter_today) {
                    var select_btn = null;
                    select_btn = this.rankInfoArray[RankIndex.Today]._btnClassify;
                    if (eventInTransparentMask(this.rankInfoArray[RankIndex.Today]._btnClassify, event.getLocation())) {
                        select_btn = this.rankInfoArray[RankIndex.Formerly]._btnClassify;
                    }
                    this.getCurrentRankList(select_btn);
                }
            }.bind(this)
        });

        cc.eventManager.addListener(todayEvent, this.rankInfoArray[RankIndex.Formerly]._btnClassify);
        cc.eventManager.addListener(todayEvent, this.rankInfoArray[RankIndex.Today]._btnClassify);
    },

    updatePeopleCount: function (today_count, past_count) {
        this.participateArray[RankIndex.Today]._txtNode.setString(today_count);
        this.participateArray[RankIndex.Formerly]._txtNode.setString(past_count);
    },

    showComingSoon: function (data) {
        if (data.length <= 0) {
            this._rankMask.setVisible(true);
            this.rankInfoArray[RankIndex.Today]._rankList.setTouchEnabled(false);
            return;
        }
        this._rankMask.setVisible(false);
        this.rankInfoArray[RankIndex.Today]._rankList.setTouchEnabled(true);
    },

    updateRankUI: function (data, which_node) {
        switch (which_node) {
            case RankClassify.Today:
                this.updateList = this.rankInfoArray[RankIndex.Today]._rankList;
                this.updateList.removeAllChildren();
                this.showComingSoon(data);
                var originTodayModel = this.rankInfoArray[RankIndex.Today]._rankModel;
                var virtualLength = 0;
                if (data.length == 0)
                    virtualLength = this.TODAY_LEAST_LIST;
                if (data.length != 0)
                    virtualLength = data.length;

                for (var i = 0; i < virtualLength; i++) {
                    if (i >= this.TODAY_MAX_LIST)
                        continue;
                    var todayClone = originTodayModel.clone();
                    todayClone.setName("Panel_" + (i + 1).toString());
                    for (var todayIndex in TodayElement) {
                        var element = null;
                        if (TodayElement[todayIndex] == TodayElement.Number) {
                            element = originTodayModel.children[TodayElement.Number].getChildByName("txt_Num").clone();
                            element.setString((i + 1));
                            element.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
                        }
                        if (TodayElement[todayIndex] < this.CLONE_ITEM)
                            continue;
                        if (TodayElement[todayIndex] == TodayElement.Crown)
                            continue;
                        if (TodayElement[todayIndex] == TodayElement.Portrait)
                            continue;
                        if (i < this.TOP_THREE && TodayElement[todayIndex] == TodayElement.Bg)
                            element = new cc.Sprite.create(this.getNode("OtherObject_Node/Ranking_Bg_Node/No" + (i + 1).toString()).getTexture().url);
                        if (i >= this.TOP_THREE && TodayElement[todayIndex] == TodayElement.Bg)
                            element = new cc.Sprite.create(this.getNode("OtherObject_Node/Ranking_Bg_Node/No4").getTexture().url);
                        if (element == null)
                            element = new cc.Sprite.create(originTodayModel.children[TodayElement[todayIndex]].getTexture().url);
                        TodayElement[todayIndex] == TodayElement.Bg ? todayClone.addChild(element, -1) : todayClone.addChild(element, 0);
                        element.setPosition(cc.p(originTodayModel.children[TodayElement[todayIndex]].getPositionX(), originTodayModel.children[TodayElement[todayIndex]].getPositionY()));
                        element.setName(originTodayModel.children[TodayElement[todayIndex]].getName());
                    }
                    if (data.length == 0) {
                        todayClone.children[TodayElement.UserName].setString(" ");
                        todayClone.children[TodayElement.txt_Bouns].setString(" ");
                    }
                    if (data.length != 0) {
                        var userName = data[i].getRankUserName();
                        if (userName != this._userName)
                            userName = "***" + userName.substr(userName.length - this.CUT_NAME);
                        todayClone.children[TodayElement.UserName].setString(userName);
                        todayClone.children[TodayElement.txt_Bouns].setString(data[i].getPayOff());
                        todayClone.children[TodayElement.UserName].setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
                        todayClone.children[TodayElement.txt_Bouns].setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
                        data[i].setTodayUpdate(false);
                    }

                    this.updateList.insertCustomItem(todayClone, i);
                    this.rankInfoArray[RankIndex.Today]._rankList.forceDoLayout();
                    this.rankInfoArray[RankIndex.Today]._rankList.refreshView();

                }
                break;

            case RankClassify.Formerly:
                this.updateList = this.rankInfoArray[RankIndex.Formerly]._rankList;
                var originFormerlyModel = this.rankInfoArray[RankIndex.Formerly]._rankModel;
                this.updateList.removeAllChildren();
                for (var j = 0; j < data.length; j++) {
                    var formerlyClone = originFormerlyModel.clone();
                    formerlyClone.children[FormerlyElement.Date].setString(data[j].getDate().split(" ")[0]);
                    formerlyClone.children[FormerlyElement.TotalAmount].setString(data[j].getCount());
                    formerlyClone.children[FormerlyElement.MostMoney].setString(data[j].getHighestAward());
                    formerlyClone.children[FormerlyElement.TotalAmount].setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
                    formerlyClone.children[FormerlyElement.MostMoney].setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
                    if (j != data.length - 1) {
                        var tableLine = new cc.Sprite.create(originFormerlyModel.children[FormerlyElement.TableLine].getTexture().url);
                        formerlyClone.addChild(tableLine);
                        tableLine.setPosition(cc.p(originFormerlyModel.children[FormerlyElement.TableLine].getPositionX(), originFormerlyModel.children[FormerlyElement.TableLine].getPositionY()));
                    }
                    formerlyClone.setName("Panel_" + (j + 1).toString());
                    this.updateList.insertCustomItem(formerlyClone, j);
                    this.rankInfoArray[RankIndex.Formerly]._rankList.forceDoLayout();
                    this.rankInfoArray[RankIndex.Formerly]._rankList.refreshView();
                    data[j].setPastUpdate(false);
                }
                break;
        }

        for (var k = 0; k < this.rankInfoArray.length; k++) {
            if (k == RankIndex.Formerly)
                continue;
            if (which_node == RankClassify.Formerly)
                continue;
            if (data.length <= 0) {
                this.rankInfoArray[k]._barNode.setVisible(false);
                continue;
            }
            this.rankInfoArray[k]._listLength = this.rankInfoArray[k]._rankList.getInnerContainerSize().height - this.rankInfoArray[k]._rankList.getContentSize().height;
            if (this.rankInfoArray[k]._listLength <= 0) {
                this.rankInfoArray[k]._barNode.setVisible(false);
                continue;
            }
            this.rankInfoArray[k]._barNode.setVisible(true);
        }
    },

    getCurrentRankList: function (sender) {
        for (var i = 0; i < this.rankInfoArray.length; i++) {
            if (sender.getName().substr(this.BUTTON_CLASSIFY) == this.rankInfoArray[i]._classify) {
                this.rankInfoArray[i]._clickedImage.setVisible(true);
                this.rankInfoArray[i]._node.setVisible(true);
                continue;
            }
            this.rankInfoArray[i]._clickedImage.setVisible(false);
            this.rankInfoArray[i]._node.setVisible(false);
            if (this.rankInfoArray[i]._btnClassify._onPressStateChangedToNormal)
                this.rankInfoArray[i]._btnClassify._onPressStateChangedToNormal();
        }
    },

    openJoinInfo: function (sender) {
        var which = sender.getName().split("_")[1];
        this.signRoom.uiAccumulated.setCurrentList(which);
        this.listBox.setVisible(true);
    },

    eventBuild: function () {
        for (var i = 0; i < this.rankInfoArray.length; i++) {
            this.registerMouseEvent(this.rankInfoArray[i]._btnClassify, null,
                function (node, mouseHitPoint) {
                    if (!eventInTransparentMask(node, mouseHitPoint))
                        this.getCurrentRankList(node);
                }.bind(this),
                function (node, mouseHitPoint) {
                    if (this.signRoom._msgOpen)
                        return;
                    node.children[0].setVisible(true);
                    if (this.rankInfoArray[RankIndex.Formerly]._btnClassify == node)
                        this._enterRank.enter_formerly = true;

                    if (this.rankInfoArray[RankIndex.Today]._btnClassify == node)
                        this._enterRank.enter_today = true;
                }.bind(this),
                function (node) {
                    if (node._onPressStateChangedToNormal)
                        node._onPressStateChangedToNormal();
                    this.rankInfoArray[RankIndex.Today]._hoverImage.setVisible(false);
                    this.rankInfoArray[RankIndex.Formerly]._hoverImage.setVisible(false);
                    this._enterRank.enter_today = false;
                    this._enterRank.enter_formerly = false;
                }.bind(this));
        }
        for (var i = 0; i < this.participateArray.length; i++) {
            this.registerMouseEvent(this.participateArray[i]._btn,
                function (node) {
                    node.children[0].setVisible(false)
                }.bind(false), this.openJoinInfo.bind(this),
                function (node) {
                    node.children[0].setVisible(true)
                }.bind(this),
                function (node) {
                    node.children[0].setVisible(false)
                }.bind(false));
        }

    },

    noHover: function () {
        this.rankInfoArray[RankIndex.Today]._hoverImage.setVisible(false);
        this.rankInfoArray[RankIndex.Formerly]._hoverImage.setVisible(false);
    },

    onHover: function () {
        var hoverVisible = true;
        if (this.rankInfoArray[RankIndex.Today]._clickedImage.isVisible())
            hoverVisible = false;
        this.rankInfoArray[RankIndex.Today]._hoverImage.setVisible(hoverVisible);
        this.rankInfoArray[RankIndex.Formerly]._hoverImage.setVisible(!hoverVisible);
    },


    initPeopleCount: function () {
        for (var item in Participate) {
            var joinInfo = {};
            joinInfo._classify = item;
            joinInfo._numNode = this.getNode("Participants_Node/" + Participate[item]);
            joinInfo._txtNode = this.getNode("Participants_Node/Num_Node/txt_" + item.toString());
            joinInfo._btn = this.getNode("Participants_Node/Btn_Participants_Node/Btn_" + item.toString());
            joinInfo._picHover = this.getNode("Participants_Node/Btn_Participants_Node/Btn_" + item.toString() + "_over");
            this.participateArray.push(joinInfo);
            joinInfo._txtNode.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);
            joinInfo._picHover.setVisible(false);
        }

        this.listBox = this.getNode("Accumlated_Node");
        this.listBox.txtTitle = this.getNode("Ranking_Node/Title_Node/ParticipantsNum");
        this.listBox.txtTitle.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);

        this.numInfo._imageUrl = this.getNode("Number_Node/ScoreNumber").getTexture().url;
        this.numInfo._eachWidth = 23;
        this.numInfo._eachHeight = 33;
        this.numInfo._intervalX = 18;
        this.numInfo._commaY = -10;
        this.numInfo._commaIndex = 10;

    },

    initRank: function () {
        this._rankMask = this.getNode("Ranking_Node/TodayGamblers_Node/HideRank_Node");
        for (var classify in RankClassify) {
            var rankInfo = {};
            rankInfo._classify = classify;
            rankInfo._nodeName = RankClassify[classify];
            rankInfo._node = this.getNode("Ranking_Node/" + RankClassify[classify]);
            rankInfo._btnClassify = this.getNode("Ranking_Node/Btn_Today_Formerly_Node/Btn_" + classify.toString());
            rankInfo._clickedImage = this.getNode("Ranking_Node/Btn_Today_Formerly_Node/" + classify.toString() + "Gambler");
            rankInfo._hoverImage = this.getNode("Ranking_Node/Btn_Today_Formerly_Node/Btn_" + classify.toString() + "_over");
            rankInfo._rankList = this.getNode("Ranking_Node/" + RankClassify[classify] + "/" + classify.toString() + "_List");
            rankInfo._rankModel = this.getNode("OtherObject_Node/Ranking_Model_Node/" + classify.toString() + "/Panel");
            rankInfo._barNode = this.getNode("Ranking_Node/" + RankClassify[classify] + "/Bar_Node");
            rankInfo._rankSlider = this.getNode("Ranking_Node/" + RankClassify[classify] + "/Bar_Node/" + classify.toString() + "Bar");
            rankInfo._listLength = rankInfo._rankList.getContentSize().height;
            this.rankInfoArray.push(rankInfo);

            rankInfo._rankSlider.setPercent(0);
            rankInfo._rankList.setScrollBarEnabled(false);
            rankInfo._hoverImage.setVisible(false);

            if (rankInfo._nodeName == RankClassify.Today) {
                rankInfo._clickedImage.setVisible(true);
                rankInfo._node.setVisible(true);
                continue;
            }
            rankInfo._node.setVisible(false);
            rankInfo._clickedImage.setVisible(false);
            rankInfo._barNode.setVisible(false);
        }

        var initArray = [];
        this.updateRankUI(initArray, RankClassify.Today);
        this.updateRankUI(initArray, RankClassify.Formerly);
        baccaratPeer.getInstance().sendMessage("Billboard", {});
    },

    initVariable: function () {
        this.rankInfoArray = [];
        this.participateArray = [];
        this._LanguageTitle = {};
        this.numInfo = {};
        this.updateList = null;
        this._userName = AccountCenter.getInstance().getUserName();
    },

    moveSliderByList: function () {
        for (var i = 0; i < this.rankInfoArray.length; i++) {
            if (!this.rankInfoArray[i]._node.isVisible() || !this.rankInfoArray[i]._barNode.isVisible())
                continue;
            if (this.rankInfoArray[i]._rankSlider.isHighlighted())
                continue;
            this.rankInfoArray[i]._barNode.setVisible(true);
            var curtPos = Math.abs(this.rankInfoArray[i]._rankList.getInnerContainerPosition().y);
            var movePercent = 100 - (curtPos / this.rankInfoArray[i]._listLength ) * 100;
            if (this.rankInfoArray[i]._rankSlider.getPercent() == movePercent)
                continue;
            this.rankInfoArray[i]._rankSlider.setPercent(movePercent);
        }
    },

    moveListBySlider: function () {
        for (var i = 0; i < this.rankInfoArray.length; i++) {
            if (!this.rankInfoArray[i]._node.isVisible() || !this.rankInfoArray[i]._barNode.isVisible())
                continue;
            if (!this.rankInfoArray[i]._rankSlider.isHighlighted())
                continue;
            var curtPercent = this.rankInfoArray[i]._rankSlider.getPercent();
            this.rankInfoArray[i]._rankList.jumpToPercentVertical(curtPercent);
        }
    },

    update: function (dt) {
        if (this.updateList != null)
            if (this.updateList.innerHeight < this.updateList.height)
                this.updateList.setInnerContainerSize(cc.size(this.updateList.width, this.updateList.height));
        if (this.updateList != null && !this.rankNode.isVisible())
            this.rankNode.setVisible(true);
        this.updateLanguage();
        this.moveSliderByList();
        this.moveListBySlider();
    },

    initLoadUI: function () {
        this._LanguageTitle.Today = this.getNode("Ranking_Node/Title_Node/Today");
        this._LanguageTitle.Formerly = this.getNode("Ranking_Node/Title_Node/Formerly");
        this._LanguageTitle.ParticipantsNum = this.getNode("Ranking_Node/Title_Node/ParticipantsNum");
        this._LanguageTitle.TodayNum = this.getNode("Ranking_Node/Title_Node/TodayNum");
        this._LanguageTitle.Participants = this.getNode("Ranking_Node/Title_Node/Participants");
        this._LanguageTitle.txt_Coming = this.getNode("Ranking_Node/TodayGamblers_Node/HideRank_Node/txt_Coming");
        this._LanguageTitle.txt_Gambler = this.getNode("Ranking_Node/TodayGamblers_Node/HideRank_Node/txt_Gambler");

        this._LanguageTitle.Date = this.getNode("Ranking_Node/FormerlyGamblers_Node/Table/Date");
        this._LanguageTitle.Players = this.getNode("Ranking_Node/FormerlyGamblers_Node/Table/Players");
        this._LanguageTitle.MaxPrize = this.getNode("Ranking_Node/FormerlyGamblers_Node/Table/MaxPrize");
    },

    updateLanguage: function () {
        this._LanguageTitle.Today.setString(language_manager.getInstance().getTextID(62));
        this._LanguageTitle.Formerly.setString(language_manager.getInstance().getTextID(63));
        this._LanguageTitle.ParticipantsNum.setString(language_manager.getInstance().getTextID(64));
        this._LanguageTitle.TodayNum.setString(language_manager.getInstance().getTextID(65));
        this._LanguageTitle.Participants.setString(language_manager.getInstance().getTextID(66));
        this._LanguageTitle.txt_Coming.setString(language_manager.getInstance().getTextID(71));
        this._LanguageTitle.txt_Gambler.setString(language_manager.getInstance().getTextID(72));
        this._LanguageTitle.txt_Coming.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this._LanguageTitle.txt_Gambler.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);

        this._LanguageTitle.Date.setString(language_manager.getInstance().getTextID(67));
        this._LanguageTitle.Players.setString(language_manager.getInstance().getTextID(68));
        this._LanguageTitle.MaxPrize.setString(language_manager.getInstance().getTextID(69));

        this._LanguageTitle.Today.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this._LanguageTitle.Formerly.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this._LanguageTitle.Date.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this._LanguageTitle.Players.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this._LanguageTitle.MaxPrize.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);


        if (language_manager.getInstance().getLanguage() == 0) {
            this._LanguageTitle.Today.setFontSize(14);
            this._LanguageTitle.Formerly.setFontSize(14);
            this._LanguageTitle.Participants.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
        }
        else {
            this._LanguageTitle.Today.setFontSize(15);
            this._LanguageTitle.Formerly.setFontSize(15);
            this._LanguageTitle.Participants.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
        }


    }


});