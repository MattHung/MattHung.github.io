/**
 * Created by chungyogroup on 2016/2/17.
 * 16 row contentSize = w : 802 h : 298
 * 20 row contentSize = w : 1002 h : 298
 */
var BaccaratRoadMapHallPresenter = function (instanceView, model) {
    var self = this;

    this._isDebugMode = false;
    if (!cc.sys.isNative) this._isDebugMode = true;

    this._instanceView = undefined;
    this._model = undefined;

    this._instanceView = instanceView;
    this._model = model;

    this.view1Data = [];

    var _instanceViewSize = this._instanceView.getContentSize();

    this._defaultRow = 6;
    this._defaultCol = 20;

    BaccaratRoadMapCore.setDefaultRowAndCol(this._defaultRow, this._defaultCol);
    this._cellSize = cc.size(_instanceViewSize.width / this._defaultCol, _instanceViewSize.height / this._defaultRow);

    this._instanceView.view1BG = new cc.Sprite(vt.res.RoadMap.Baccarat.roadmapDefaultBG_20);
    this._instanceView.view1BG.setPosition(cc.p(0, 0));
    this._instanceView.view1BG.setAnchorPoint(cc.p(0, 0));
    instanceView.addChild(this._instanceView.view1BG);

    //this._instanceView.view1Road = new cc.Sprite(vt.res.RoadMap.Baccarat.roadmapDefaultBG_20);
    //this._instanceView.view1Road.setPosition(cc.p(0,0));
    //this._instanceView.view1Road.setAnchorPoint(cc.p(0,0));
    //instanceView.addChild(this._instanceView.view1Road);

    this._instanceView.view1 = cy.CollectionView.create(cc.size(_instanceViewSize.width, _instanceViewSize.height));
    this._instanceView.view1.setPosition(cc.p(0, 0));
    this._instanceView.view1.setName("view1");
    this._instanceView.view1.setTouchEnabled(false);
    instanceView.addChild(this._instanceView.view1);

    this._model.registerObserver(function (data) {
        self._updateRoadMapView(data)
    });

    this._model.setDataSource(BaccaratRoadItem, BaccaratRoadMapCore, ResultList);

    this._setCollectonViewDataSource();
    //this._instanceView.view1.setVisible(!cc.sys.isNative);
    this._instanceView.view1.setDataSource(this);
    this._instanceView.view1.setCollectionViewDelegate(this);
    this._instanceView.view1.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
    this._instanceView.view1.setTag(BACCARATROADMAPTYPE.BIGROAD);
    this._instanceView.view1.setScrollerEnabled(false);
    this._instanceView.view1.reloadData();
};

BaccaratRoadMapHallPresenter.prototype.setRoadMapColumn = function (_column) {
    _column = _column ? _column : this._defaultCol;
    this._defaultCol = _column;

    //依照數量更換背景圖片
    if (this._defaultCol <= 16) this._instanceView.view1BG.setTexture(vt.res.RoadMap.Baccarat.roadmapDefaultBG_16);
    else this._instanceView.view1BG.setTexture(vt.res.RoadMap.Baccarat.roadmapDefaultBG_20);

    BaccaratRoadMapCore.setDefaultRowAndCol(this._defaultRow, this._defaultCol);
    this._cellSize = cc.size(this._instanceView.width / this._defaultCol, this._instanceView.height / this._defaultRow);
    this._model.updateBigRoad(this._model._roadMapData, true);
};

/**
 * 更新路紙
 * @param _roadMapStr
 */
BaccaratRoadMapHallPresenter.prototype.update = function (_roadMapStr) {
    BaccaratRoadMapCore.needAskRoadMapItem(true);
    BaccaratRoadMapCore.setDefaultRowAndCol(this._defaultRow, this._defaultCol);
    this._model.updateBigRoad(_roadMapStr);
};

//＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊
/**
 *
 * @param modalData
 */
BaccaratRoadMapHallPresenter.prototype._updateRoadMapView = function (modalData) {
    //debugPrint(modalData);
    var _view1Tag = this._instanceView.view1.getTag();
    this.view1Data = modalData.bigRoadArray;
    //debugPrint("this.view1Data = " ,this.view1Data);
    this._instanceView.view1.reloadData();
};

/**
 * 設定CollectionView的資料源
 * @private
 */
BaccaratRoadMapHallPresenter.prototype._setCollectonViewDataSource = function () {
    var self = this;
    this.collectionCellAtIndex = function (collection, idx) {
        //var cell = collection.dequeueCell();
        var cell;
        var _item;

        if (collection.getName() == "view1") {
            var cell1 = collection.dequeueCell();
            if (!cell1) {
                cell1 = new RoadMapCell("route_1.png");
                CYCollectionViewCell.plugin(cell1);
            }
            var _specialSize1 = cc.size(this._cellSize.width, this._cellSize.height);
            cell1.setContentSize(_specialSize1);
            //cell1.bgSprite.cySetSize(cc.size(_specialSize1.width,_specialSize1.height));

            cell = cell1;
            _item = this.view1Data[idx];
        }

        if (_item != null) {
            cell.itemSprite.setOpacity(255);

            this._setRoadMapItemData(cell, _item);

            if (_item.askRoad != ASKROADMAPTYPE.NOASK) {
                cell.itemSprite.setOpacity(0);
            } else
                cell.itemSprite.setOpacity(255);
        } else {
            cell.itemSprite.setOpacity(0);
            cell.labelText.setString("");
        }

        return cell;
    };

    this.collectionFinishReloadData = function (collection) {
        //if (cc.sys.isNative){
        //    var _renderTexture = new cc.RenderTexture(self._instanceView.width, self._instanceView.height);
        //    _renderTexture.setAutoDraw(true);
        //    _renderTexture.beginWithClear(255,255,255,0,0,0);
        //
        //    var _cellArray = _(this._instanceView.view1._cellsUsed).clone().reverse();
        //    for (var _index in _cellArray){
        //        if (_cellArray[_index] instanceof cc.Node){
        //            _cellArray[_index].visit();
        //        }
        //    }
        //    _renderTexture.end();
        //    var _newRoadTexture = _renderTexture.getSprite().getTexture();
        //    self._instanceView.view1Road.setTexture(_newRoadTexture);
        //    self._instanceView.view1Road.setTextureRect(cc.rect(0,0,_newRoadTexture.width,_newRoadTexture.height));
        //    self._instanceView.view1Road.setFlippedY(true);
        //}
    };

    this.numberOfCellsInCollection = function (collection) {
        var _length = this.view1Data.length;
        return _length;
    };

    this.collectionCellTouched = function (collection, cell) {
        //console.log("Touch" + cell.getIdx());

    };

    this.collectionCellSizeForIndex = function (collection, idx) {
        return this._cellSize;
    };

    this.leftSideSpaceForCollection = function (collection) {
        return 0;
    };

    this.upSideSpaceForCollection = function (collection) {
        return 0;
    };

    this.scrollViewDidScroll = function (collection) {

    };

    this.collectionCellWillRecycle = function () {

    };

    this.collectionCellHighlight = function (collectionView, cell) {
        //console.log("un high Light");
    };

    this.collectionCellUnhighlight = function (collectionView, cell) {

    };
};

/**
 * 主要給CollcetionView的方法使用，設定這個Cell要顯示的圖片。
 * @param _cell
 * @param _item
 * @returns {*}
 * @private
 */
BaccaratRoadMapHallPresenter.prototype._setRoadMapItemData = function (_cell, _item) {
    if (_item.resultType == BACCARATRESULTCOLOR.BLUE) {
        _cell.setItemSpriteFrame("circle_blue_" + (_item.tieNum + 1) + ".png");
    }
    else if (_item.resultType == BACCARATRESULTCOLOR.RED) {
        _cell.setItemSpriteFrame("circle_red_" + (_item.tieNum + 1) + ".png");
    }
    if (this._isDebugMode) _cell.labelText.setString((_item == null) ? "" : _item.tag);

    return _cell;
};

/**
 * 拿取好路資訊
 * @param _roadMapStr
 */
BaccaratRoadMapHallPresenter.prototype.getRoadStatus = function (_roadMapStr) {
    BaccaratRoadMapTrend.getRoadStatus(_roadMapStr);

};