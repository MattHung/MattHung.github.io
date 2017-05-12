/**
 * Created by lester on 2016/9/2.
 * 自定義路紙模組
 */

var BaccaratCustomRoadMapPresenter = cc.Class.extend({
    ctor: function () {
        cc.assert(typeof BACCARATROADMAPTYPE === "object", "Please check BaccaratRoadItem is live.");

        this.batchImagePath = "";
        this.bigRoadNodeName = "bigRoadNodeTag";
        this.hybridRoadName = "bybridRoadNodeTag";
        this.chipRoadName = "chipRoadNodeTag";
        this.bigSmallRoadName = "bigSmallRoadNodeTag";

        this.playerAskItemArray = [];
        this.bankerAskItemArray = [];

        this._playerAskRoadView = null;
        this._bankerAskRoadView = null;

        this.modelAdapter = new BaccaratRoadMapModelAdapter();
        this.modelAdapter.setDataSource(BaccaratRoadItem, BaccaratRoadMapCore, ResultList);

        // cc.spriteFrameCache.addSpriteFrames(vt.res.RoadMap.Comm.newRoadMapPlist, vt.res.RoadMap.Comm.newRoadMapPng);
    },
    cleanup: function () {
        this.playerAskItemArray.forEach(function (cell) {
            cell.release();
        });
        this.bankerAskItemArray.forEach(function (cell) {
            cell.release();
        });
    }
});
/**
 * 設置BatchNodeImagePath路競
 * 非常重要的方法，要是沒有調用效能會很差。
 * @param _imagePath
 */
BaccaratCustomRoadMapPresenter.prototype.setBatchNodeImagePath = function (_imagePath) {
    this.batchImagePath = _imagePath;
};
/**
 * 更新RoadMap資料
 * @param _roadMapStr
 * @param _roadMapCol
 */
BaccaratCustomRoadMapPresenter.prototype.updateDataSource = function (_roadMapStr, _roadMapCol) {

    this.modelAdapter.updateCustomRoadMap(_roadMapStr, _roadMapCol);
};
/**
 * 依照指定樣式繪製路紙上去
 * @param _drawLayer
 * @param _roadMapType = [BACCARATROADMAPTYPE]
 * @param specialCol
 */
BaccaratCustomRoadMapPresenter.prototype.drawRoadMapByType = function (_drawLayer, _roadMapType, specialCol) {

    if (_drawLayer.getChildByName(this.bigRoadNodeName) instanceof cc.Node) {
        _drawLayer.getChildByName(this.bigRoadNodeName).removeFromParent();

    } else if (_drawLayer.getChildByName(this.hybridRoadName) instanceof cc.Node) {
        _drawLayer.getChildByName(this.hybridRoadName).removeFromParent();

    } else if (_drawLayer.getChildByName(this.chipRoadName) instanceof cc.Node) {
        _drawLayer.getChildByName(this.chipRoadName).removeFromParent();

    } else if (_drawLayer.getChildByName(this.bigSmallRoadName) instanceof cc.Node) {
        _drawLayer.getChildByName(this.bigSmallRoadName).removeFromParent();
    }

    var batchNode = null;
    if (_roadMapType == BACCARATROADMAPTYPE.BIGROAD)            batchNode = this._drawBigRoadMap(_drawLayer, specialCol);
    else if (_roadMapType == BACCARATROADMAPTYPE.HYBRIDROAD)    batchNode = this._drawHibridRoadMap(_drawLayer, specialCol);
    else if (_roadMapType == BACCARATROADMAPTYPE.BIGSMALLROAD)  batchNode = this._drawBigSmallRoadMap(_drawLayer, specialCol);
    else if (_roadMapType == BACCARATROADMAPTYPE.CHIPTRAPROAD)  batchNode = this._drawChiptrapRoadMap(_drawLayer, specialCol);
    else batchNode = this._drawBigRoadMap(_drawLayer, specialCol);

    _drawLayer.addChild(batchNode);
};

/**
 * 給外部的人，設定莊問路、閒問路的Node
 * @param _playerAskView
 * @param _bankerAskView
 */
BaccaratCustomRoadMapPresenter.prototype.setAskRoadMapView = function (_playerAskView, _bankerAskView) {

    _playerAskView.removeAllChildren();
    _bankerAskView.removeAllChildren();

    this._playerAskRoadView = _playerAskView;
    this._bankerAskRoadView = _bankerAskView;
};
/**
 * 重新整理問路的圖案
 */
BaccaratCustomRoadMapPresenter.prototype.reloadAskRoadMapImage = function () {

    if (this._playerAskRoadView == null || this._bankerAskRoadView == null) return;

    this._playerAskRoadView.removeAllChildren();
    this._bankerAskRoadView.removeAllChildren();

    var _setAskRoadImg = function (_items, _node) {
        if (!_node || !_items) return;
        var c_size = _node.getContentSize();
        var itemSize = cc.size(c_size.width / 3, c_size.height);
        var roadImg = "";

        if (_items.hybridType == HYBRIDTYPE.BIGEYEROAD) {
            roadImg = "circle_blue_1";
            if (_items.resultType == BACCARATRESULTCOLOR.RED) roadImg = "circle_red_1";

        } else if (_items.hybridType == HYBRIDTYPE.SMALLROAD) {
            roadImg = "circle_b_solid";
            if (_items.resultType == BACCARATRESULTCOLOR.RED) roadImg = "circle_r_solid";

        } else if (_items.hybridType == HYBRIDTYPE.GYROAD) {
            roadImg = "line_b";
            if (_items.resultType == BACCARATRESULTCOLOR.RED) roadImg = "line_r";
        }
        roadImg = roadImg + ".png";

        var cell = new NewRoadMapCell(roadImg, _items);
        cell.setAnchorPoint(cc.p(0.5, 0.5));
        cell.setScale(0.45);
        cell.setPosition(cc.p((_items.hybridType + 1) * itemSize.width / 2 + _items.hybridType * itemSize.width / 2, itemSize.height / 2));
        _node.addChild(cell);
    };

    for (var val in this.modelAdapter._model.askPlayerArray) {
        var _itemA = this.modelAdapter._model.askPlayerArray[val];
        _setAskRoadImg(_itemA, this._playerAskRoadView);
    }

    for (var val in this.modelAdapter._model.askBankerArray) {
        var _itemB = this.modelAdapter._model.askBankerArray[val];
        _setAskRoadImg(_itemB, this._bankerAskRoadView);
    }
};
/**
 * 開始閃問路的結果
 * @param _isPlayer
 */
BaccaratCustomRoadMapPresenter.prototype.showAskRoadMapCell = function (_isPlayer) {
    var mergeArray = _.union(this.playerAskItemArray, this.bankerAskItemArray);
    for (var _key in mergeArray) {
        var cell = mergeArray[_key];
        cell.stopFlicker();
    }
    var flickerArray = (_isPlayer) ? this.playerAskItemArray : this.bankerAskItemArray;

    for (var _key in flickerArray) {
        var cell = flickerArray[_key];
        cell.flicker(0);
    }
};
/**
 *
 */
BaccaratCustomRoadMapPresenter.prototype.resetAskRoadMapCell = function () {
    var mergeArray = _.union(this.playerAskItemArray, this.bankerAskItemArray);
    for (var _key in mergeArray) {
        var cell = mergeArray[_key];
        cell.stopFlicker();
        cell.release();
    }
    this.playerAskItemArray = [];
    this.bankerAskItemArray = [];
};
/**
 *
 * @param cell
 * @private
 */
BaccaratCustomRoadMapPresenter.prototype._getAnotherTwiceCell = function (cell) {
    var _imgName = (cell.spriteImageName.indexOf("blue") !== -1) ? cell.spriteImageName.replace("blue", "red") : cell.spriteImageName.replace("red", "blue");
    var anotherCell = new NewRoadMapCell(_imgName, cell.itemModel);
    anotherCell.setAnchorPoint(cell.getAnchorPoint());
    anotherCell.setPosition(cell.getPosition());
    anotherCell.setScale(cell.getScale());
    anotherCell.setOpacity(cell.getOpacity());
    anotherCell.retain();
    return anotherCell;
};

/**
 * 傳回路紙盤面資訊
 * 目前支援莊贏、閒贏、和局、莊對、閒對
 * Key:Value = {Banker:bankerWinNumber, Player: playerWinNumber, Tie: tieNumber, BankerPair:bankerPair, PlayerPair:playerPair}
 */
BaccaratCustomRoadMapPresenter.prototype.getRoadMapInformation = function () {
    return this.modelAdapter._model.roadMapInformation;
};


/**
 * 私有方法，繪製大路
 * @param _drawLayer
 * @param _customCol
 * @returns {cc.SpriteBatchNode}
 * @private
 */
BaccaratCustomRoadMapPresenter.prototype._drawBigRoadMap = function (_drawLayer, _customCol) {
    var batchNode = new cc.SpriteBatchNode(this.batchImagePath);
    batchNode.setCascadeOpacityEnabled(true);
    batchNode.setName(this.bigRoadNodeName);

    var _c_size = _drawLayer.getContentSize();
    var _c_col = (_customCol) ? _customCol : this.modelAdapter._core.default_Col;
    var itemSize = cc.size(_c_size.width / _c_col, _c_size.height / 6);
    var _c_row = 6, _c_col = 0;

    var bigRoadArray = this.modelAdapter._core.turnTwoDimensionalToOneDimensionalArray(this.modelAdapter._core.spliceArrayByLimitCol(this.modelAdapter._model.bigRoadArray, _customCol));

    for (var _index in bigRoadArray) {
        var roadItem = bigRoadArray[_index];

        if (_c_row <= 0) {
            _c_row = 5;
            _c_col++;
        } else {
            _c_row--;
        }

        if (roadItem == null) continue;

        var roadImg = "circle_blue_";
        if (roadItem.resultType == BACCARATRESULTCOLOR.RED) roadImg = "circle_red_";

        roadImg = roadImg + ((roadItem.tieNum >= 12) ? 13 : roadItem.tieNum + 1) + ".png";

        var cell = new NewRoadMapCell(roadImg);
        cell.setAnchorPoint(cc.p(0.5, 0.5));
        cell.setPosition(cc.p(_c_col * itemSize.width / 2 + (_c_col + 1) * itemSize.width / 2, _c_row * itemSize.height / 2 + (_c_row + 1) * itemSize.height / 2));
        cell.setScale(0.45);
        cell.setOpacity((roadItem.askRoad == ASKROADMAPTYPE.NOASK) ? 255 : 0);

        if (roadItem.askRoad == ASKROADMAPTYPE.BANKERASK) {
            cell.retain();
            this.bankerAskItemArray.push(cell);
        } else if (roadItem.askRoad == ASKROADMAPTYPE.PLAYERASK) {
            cell.retain();
            this.playerAskItemArray.push(cell);
        } else if (roadItem.askRoad == ASKROADMAPTYPE.TWICEASK) {
            cell.retain();
            this.playerAskItemArray.push(cell);
            var anotherCell = this._getAnotherTwiceCell(cell);
            this.bankerAskItemArray.push(anotherCell);
            batchNode.addChild(anotherCell);
        }
        batchNode.addChild(cell);
    }
    batchNode.setCascadeOpacityEnabled(true);
    return batchNode;
};

BaccaratCustomRoadMapPresenter.prototype._drawHibridRoadMap = function (_drawLayer, _customCol) {
    var batchNode = new cc.SpriteBatchNode(this.batchImagePath);
    batchNode.setCascadeOpacityEnabled(true);
    batchNode.setName(this.hybridRoadName);

    var _c_size = _drawLayer.getContentSize();
    var _c_col = (_customCol) ? _customCol : this.modelAdapter._core.default_Col;
    var itemSize = cc.size(_c_size.width / (_c_col * 2), _c_size.height / 12);
    var _c_row = 12, _c_col = 0;
    var newHybridArray = this.modelAdapter._core.turnTwoDimensionalToOneDimensionalArray(
        this.modelAdapter._core.getHybridRoadMap(
            this.modelAdapter._model.bigEyesArray,
            this.modelAdapter._model.smallRoadArray,
            this.modelAdapter._model.gyRoadArray,
            _customCol)
    );

    for (var _index in newHybridArray) {
        var roadItem = newHybridArray[_index];

        if (_c_row <= 0) {
            _c_row = 11;
            _c_col++;
        } else {
            _c_row--;
        }

        if (roadItem == null) continue;
        var roadImg = "";
        if (roadItem.hybridType == HYBRIDTYPE.BIGEYEROAD) {
            roadImg = "circle_blue_1";
            if (roadItem.resultType == BACCARATRESULTCOLOR.RED) roadImg = "circle_red_1";

        } else if (roadItem.hybridType == HYBRIDTYPE.SMALLROAD) {
            roadImg = "circle_b_solid";
            if (roadItem.resultType == BACCARATRESULTCOLOR.RED) roadImg = "circle_r_solid";

        } else if (roadItem.hybridType == HYBRIDTYPE.GYROAD) {
            roadImg = "line_b";
            if (roadItem.resultType == BACCARATRESULTCOLOR.RED) roadImg = "line_r";

        }
        roadImg = roadImg + ".png";

        var cell = new NewRoadMapCell(roadImg);
        cell.setAnchorPoint(cc.p(0.5, 0.5));
        cell.setPosition(cc.p(_c_col * itemSize.width / 2 + (_c_col + 1) * itemSize.width / 2, _c_row * itemSize.height / 2 + (_c_row + 1) * itemSize.height / 2));
        cell.setScale(0.22);
        cell.setOpacity((roadItem.askRoad == ASKROADMAPTYPE.NOASK) ? 255 : 0);

        if (roadItem.askRoad == ASKROADMAPTYPE.BANKERASK) {
            cell.retain();
            this.bankerAskItemArray.push(cell);
        } else if (roadItem.askRoad == ASKROADMAPTYPE.PLAYERASK) {
            cell.retain();
            this.playerAskItemArray.push(cell);
        } else if (roadItem.askRoad == ASKROADMAPTYPE.TWICEASK) {
            cell.retain();
            this.playerAskItemArray.push(cell);
            var anotherCell = this._getAnotherTwiceCell(cell);
            this.bankerAskItemArray.push(anotherCell);
            batchNode.addChild(anotherCell);
        }

        batchNode.addChild(cell);
    }
    batchNode.setCascadeOpacityEnabled(true);
    return batchNode;
};

BaccaratCustomRoadMapPresenter.prototype._drawBigSmallRoadMap = function (_drawLayer, _roadCol) {
    var batchNode = new cc.SpriteBatchNode(this.batchImagePath);
    batchNode.setCascadeOpacityEnabled(true);
    batchNode.setName(this.bigSmallRoadName);

    this.modelAdapter._core.setDefaultRowAndCol(6, _roadCol);

    var c_size = _drawLayer.getContentSize();
    var itemSize = cc.size(c_size.width / _roadCol, c_size.height / 6);
    var _c_row = 6, _c_col = 0;
    var bigSmallRoad = this.modelAdapter._core.spliceArrayByLimitCol(this.modelAdapter._model.bigSmallArray, _roadCol);

    for (var _index in bigSmallRoad) {
        var roadItem = bigSmallRoad[_index];

        if (_c_row <= 0) {
            _c_row = 5;
            _c_col++;
        } else {
            _c_row--;
        }

        if (roadItem == null) continue;

        var roadImg = "red_big_";
        if (roadItem.resultType == BACCARATRESULTCOLOR.BLUE) roadImg = "blue_small_";

        roadImg = roadImg + this._getCurrentLanguage() + ".png";

        var cell = new NewRoadMapCell(roadImg);
        cell.setAnchorPoint(cc.p(0.5, 0.5));
        cell.setPosition(cc.p(_c_col * itemSize.width / 2 + (_c_col + 1) * itemSize.width / 2, _c_row * itemSize.height / 2 + (_c_row + 1) * itemSize.height / 2));
        cell.setScale(0.45);

        batchNode.addChild(cell);
    }
    batchNode.setCascadeOpacityEnabled(true);
    return batchNode;
};

BaccaratCustomRoadMapPresenter.prototype._drawChiptrapRoadMap = function (_drawLayer, _roadCol) {
    var batchNode = new cc.SpriteBatchNode(this.batchImagePath);
    batchNode.setCascadeOpacityEnabled(true);
    batchNode.setName(this.chipRoadName);

    this.modelAdapter._core.setDefaultRowAndCol(6, _roadCol);

    var c_size = _drawLayer.getContentSize();
    var itemSize = cc.size(c_size.width / _roadCol, c_size.height / 6);
    var _c_row = 6, _c_col = 0;
    var chiptrapRoad = this.modelAdapter._core.spliceArrayByLimitCol(this.modelAdapter._model.chipTrapArray, _roadCol);

    for (var _index in chiptrapRoad) {
        var roadItem = chiptrapRoad[_index];

        if (_c_row <= 0) {
            _c_row = 5;
            _c_col++;
        } else {
            _c_row--;
        }

        if (roadItem == null) continue;

        var roadImg = "blue_";
        if (roadItem.resultType == BACCARATRESULTCOLOR.RED) roadImg = "red_";
        if (roadItem.resultType == BACCARATRESULTCOLOR.GREEN) roadImg = "green_";

        if (roadItem.pairType == PAIRRESULT.BANKERPAIR) roadImg = roadImg + "r_";
        if (roadItem.pairType == PAIRRESULT.PLAYERPAIR) roadImg = roadImg + "g_";
        if (roadItem.pairType == PAIRRESULT.PBPAIR)     roadImg = roadImg + "rg_";

        roadImg = roadImg + roadItem.point + ".png";
        var cell = new NewRoadMapCell(roadImg);
        batchNode.addChild(cell);
        cell.setAnchorPoint(cc.p(0.5, 0.5));
        cell.setPosition(cc.p(_c_col * itemSize.width / 2 + (_c_col + 1) * itemSize.width / 2, _c_row * itemSize.height / 2 + (_c_row + 1) * itemSize.height / 2));
        cell.setScale(0.45);
    }
    batchNode.setCascadeOpacityEnabled(true);
    return batchNode;
};

/**
 * 取得語系
 * @returns {*}
 * @private
 */
BaccaratCustomRoadMapPresenter.prototype._getCurrentLanguage = function(){
    if (cc.sys.isNative) {
        // var lang = CYPluginManager.AppCtrlUtils.getLanguage();
        // if (lang == "us" || lang == "tw" || lang == "cn")
        //     return lang;
        // else
        //     return "us";
        return 'lang';
    }
    else {
        var lang = window.navigator.userLanguage || window.navigator.language;
        lang = lang.toLowerCase();
        switch (lang) {
            case 'zh-cn':
                return 'cn';
            case 'zh-tw':
                return 'tw';
            default :
                return 'us';
        }
    }
};
