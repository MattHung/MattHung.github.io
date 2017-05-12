/**
 * Created by chungyogroup on 15/11/23.
 */

/**
 *
 * @param instanceView
 * @param model
 * @constructor
 */
var BaccaratRoadMapPresenter = function (instanceView, model) {
    var self = this;

    this._isDebugMode = false;
    if (!cc.sys.isNative) this._isDebugMode = true;

    this._instanceView = null;
    this._model = null;

    this._instanceView = instanceView;
    this._model = model;

    this.view1Data = [];
    this.view2Data = [];

    this._playerAskRoadItemArray = [];
    this._bankerAskRoadItemArray = [];
    this._playerAskRoadView = null;
    this._bankerAskRoadView = null;

    this._instanceViewSize = instanceView.getContentSize();

    this._defaultRow = 6;
    this._defaultCol = 14;

    this._isFlickeringType = null;

    this._initUI();
    if (cc.sys.isNative) {
        // debugPrint("addSpriteFrames");
        // cc.spriteFrameCache.removeSpriteFramesFromFile(vt.res.RoadMap.Baccarat.roadmapPlist);
        // cc.spriteFrameCache.addSpriteFrames(vt.res.RoadMap.Baccarat.roadmapPlist, vt.res.RoadMap.Baccarat.roadmapPVR);
    }

    this._model.registerObserver(function (data) {
        self._updateRoadMapView(data)
    });
    this._model.setDataSource(BaccaratRoadItem, BaccaratRoadMapCore, ResultList);
};

/**
 * 更新路紙
 * @param _roadMapStr
 */
BaccaratRoadMapPresenter.prototype.update = function (_roadMapStr) {
    this._isFlickeringType = null;
    BaccaratRoadMapCore.needAskRoadMapItem(true);
    BaccaratRoadMapCore.setDefaultRowAndCol(this._defaultRow, this._defaultCol);
    this._model.update(_roadMapStr);
};
/**
 * 給外部的人，設定莊問路、閒問路的Node
 * @param _playerAskView
 * @param _bankerAskView
 */
BaccaratRoadMapPresenter.prototype.setAskRoadMapView = function (_playerAskView, _bankerAskView) {
    if (_playerAskView) {
        this._playerAskRoadView = new AskRoadMapView();
        this._playerAskRoadView.setContentSize(_playerAskView.getContentSize());
        _playerAskView.addChild(this._playerAskRoadView);
    }

    if (_bankerAskView) {
        this._bankerAskRoadView = new AskRoadMapView();
        this._bankerAskRoadView.setContentSize(_bankerAskView.getContentSize());
        _bankerAskView.addChild(this._bankerAskRoadView);
    }
};
/**
 * 可呼叫顯示莊問路與閒問路的效果
 * @param _type
 */
BaccaratRoadMapPresenter.prototype.flickerAskRoadCell = function (_type) {

    this.stopFlickerAskRoadCell();
    this._isFlickeringType = _type;

    if (_type == ASKROADMAPTYPE.PLAYERASK) {
        for (var i = 0; i < this._playerAskRoadItemArray.length; i++) {
            var _cellA = this._playerAskRoadItemArray[i]["cell"];
            var _cellA_item = this._playerAskRoadItemArray[i]["item"];

            var _imgName = _cellA.itemSprite.getName();
            if (_cellA_item.askRoad == ASKROADMAPTYPE.TWICEASK) {
                if (_cellA_item.resultType == BACCARATRESULTCOLOR.RED) {
                    _imgName = _imgName.replace("blue", "red");
                } else {
                    _imgName = _imgName.replace("red", "blue");
                }
            }
            _cellA.setItemSpriteFrame(_imgName);
            _cellA.flickerItemSprite(0);

            // New for future
            //var newCellA = new RoadMapCell();
            //newCellA.setContentSize(_cellA.getContentSize());
            //newCellA.setPosition(_cellA.getPosition());
            //if (_cellA_item.roadMapType != BACCARATROADMAPTYPE.BIGROAD){
            //    newCellA.x += this._instanceView.getContentSize().width/2;
            //}
            //this._instanceView.addChild(newCellA);
            //
            //newCellA.setItemSpriteFrame(_imgName);
            //newCellA.flickerItemSprite(10);
            //this._playerAskRoadItemArray[i]["newCell"] = newCellA;

        }
    } else if (_type == ASKROADMAPTYPE.BANKERASK) {
        for (var i = 0; i < this._bankerAskRoadItemArray.length; i++) {
            var _cellB = this._bankerAskRoadItemArray[i]["cell"];
            var _cellB_item = this._bankerAskRoadItemArray[i]["item"];

            var _imgName = _cellB.itemSprite.getName();
            if (_cellB_item.askRoad == ASKROADMAPTYPE.TWICEASK) {
                if (_cellB_item.resultType == BACCARATRESULTCOLOR.RED) {
                    _imgName = _imgName.replace("blue", "red");
                } else {
                    _imgName = _imgName.replace("red", "blue");
                }
            }
            _cellB.setItemSpriteFrame(_imgName);
            _cellB.flickerItemSprite(0);

            // New for future
            //var newCellB = new RoadMapCell();
            //newCellB.setContentSize(_cellB.getContentSize());
            //newCellB.setPosition(_cellB.getPosition());
            //if (_cellB_item.roadMapType != BACCARATROADMAPTYPE.BIGROAD){
            //    newCellB.x += this._instanceView.getContentSize().width/2;
            //}
            //this._instanceView.addChild(newCellB);
            //
            //newCellB.setItemSpriteFrame(_imgName);
            //newCellB.flickerItemSprite(10);
            //this._playerAskRoadItemArray[i]["newCell"] = newCellB;
        }
    }

    //for (var i in this._instanceView.view1._cellsUsed){
    //    this._instanceView.view1._cellsUsed[i].itemSprite.setOpacity(0);
    //}
};
/**
 * 停止播放所有莊問路閒問路的動畫
 */
BaccaratRoadMapPresenter.prototype.stopFlickerAskRoadCell = function () {
    // 先關閉所有動畫效果
    this._isFlickeringType = null;

    for (var i = 0; i < this._playerAskRoadItemArray.length; i++) {
        var _cellA = this._playerAskRoadItemArray[i]["cell"];
        _cellA.stopFlickerItemSprite();

        // New for future
        //var _newCellA = this._playerAskRoadItemArray[i]["newCell"];
        //if (_newCellA){
        //    _newCellA.stopFlickerItemSprite();
        //    //_newCellA.removeFromParent(true);
        //}

    }
    for (var i = 0; i < this._bankerAskRoadItemArray.length; i++) {
        var _cellB = this._bankerAskRoadItemArray[i]["cell"];
        _cellB.stopFlickerItemSprite();

        // New for future
        //var _newCellB = this._bankerAskRoadItemArray[i]["newCell"];
        //if (_newCellB){
        //    _newCellB.stopFlickerItemSprite();
        //    //_newCellB.removeFromParent(true);
        //}

    }
};

//＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊
/**
 *
 * @param modalData
 */
BaccaratRoadMapPresenter.prototype._updateRoadMapView = function (modalData) {
    //debugPrint(modalData);
    this._model = modalData;
    var _view1Tag = this._instanceView.view1.getTag();
    var _view2Tag = this._instanceView.view2.getTag();

    modalData = modalData._model;
    if (_view1Tag == BACCARATROADMAPTYPE.BIGROAD)
        this.view1Data = modalData.bigRoadArray;
    else if (_view1Tag == BACCARATROADMAPTYPE.CHIPTRAPROAD)
        this.view1Data = modalData.chipTrapArray;
    else if (_view1Tag == BACCARATROADMAPTYPE.BIGSMALLROAD)
        this.view1Data = modalData.bigSmallArray;
    else if (_view1Tag == BACCARATROADMAPTYPE.HYBRIDROAD)
        this.view1Data = modalData.hybridArray;

    if (_view2Tag == BACCARATROADMAPTYPE.BIGROAD)
        this.view2Data = modalData.bigRoadArray;
    else if (_view2Tag == BACCARATROADMAPTYPE.HYBRIDROAD)
        this.view2Data = modalData.hybridArray;
    else if (_view2Tag == BACCARATROADMAPTYPE.BIGSMALLROAD)
        this.view2Data = modalData.bigSmallArray;
    else if (_view2Tag == BACCARATROADMAPTYPE.CHIPTRAPROAD)
        this.view2Data = modalData.chipTrapArray;

    this._playerAskRoadItemArray = [];
    this._bankerAskRoadItemArray = [];
    if (this._playerAskRoadView) this._playerAskRoadView.resetImgPath();
    if (this._bankerAskRoadView) this._bankerAskRoadView.resetImgPath();

    this._instanceView.view1.reloadData();
    this._instanceView.view2.reloadData();
};
/**
 * 使用TextRender繪圖路紙，暫時不用到(似乎會有效能問題）
 * @param _collection
 * @param _instanceRoad
 * @private
 */
BaccaratRoadMapPresenter.prototype._redrawRoadMapView = function (_collection, _instanceRoad) {

    if (cc.sys.isNative) {
        var _renderTexture = new cc.RenderTexture(this._instanceView.width / 2, this._instanceView.height);
        _renderTexture.setAutoDraw(true);
        _renderTexture.begin();
        var _cellArray = _(_collection._cellsUsed).clone().reverse();
        for (var _index in _cellArray) {
            if (_cellArray[_index] instanceof cc.Node) {
                _cellArray[_index].visit();
            }
        }
        _renderTexture.end();
        var _newRoadTexture = _renderTexture.getSprite().getTexture();
        _instanceRoad.setTexture(_newRoadTexture);
        _instanceRoad.setTextureRect(cc.rect(0, 0, _newRoadTexture.width, _newRoadTexture.height));
        _instanceRoad.setFlippedY(true);
    }
};
BaccaratRoadMapPresenter.prototype.buttonListener = function (sender, eventType) {

    if (eventType === ccui.Widget.TOUCH_BEGAN) {
    } else if (eventType === ccui.Widget.TOUCH_MOVED) {
    } else if (eventType === ccui.Widget.TOUCH_ENDED) {

        if (!cy.util.pointEqualToPoint(sender.getTouchBeganPosition(), sender.getTouchEndPosition(), 20))return;

        if (sender.getName() == "Btn1") {
            this._changeRoadMapType(this._instanceView.view1);
        } else {
            this._changeRoadMapType(this._instanceView.view2);
        }
    }
};
/**
 * 切換路紙的狀態
 * @param _collection
 * @private
 */
BaccaratRoadMapPresenter.prototype._changeRoadMapType = function (_collection) {

    var _view1Tag = this._instanceView.view1.getTag();
    var _view2Tag = this._instanceView.view2.getTag();
    // Aivi規則
    if (_collection.getName() == "view1") {
        this._instanceView.view1BG.setTexture(vt.res.RoadMap.Baccarat.routeBG14);
        if (_view1Tag == BACCARATROADMAPTYPE.BIGROAD) {
            _view1Tag = BACCARATROADMAPTYPE.CHIPTRAPROAD;
        } else if (_view1Tag == BACCARATROADMAPTYPE.CHIPTRAPROAD) {
            _view1Tag = BACCARATROADMAPTYPE.HYBRIDROAD;
            this._instanceView.view1BG.setTexture(vt.res.RoadMap.Baccarat.routeBG28);
        } else
            _view1Tag = BACCARATROADMAPTYPE.BIGROAD;

        _collection.setTag(_view1Tag);

        if (_view1Tag == _view2Tag) {
            this._instanceView.view2BG.setTexture(vt.res.RoadMap.Baccarat.routeBG14);
            if (_view1Tag == BACCARATROADMAPTYPE.BIGROAD) {
                _view2Tag = BACCARATROADMAPTYPE.HYBRIDROAD;
                this._instanceView.view2BG.setTexture(vt.res.RoadMap.Baccarat.routeBG28);
            } else if (_view1Tag == BACCARATROADMAPTYPE.CHIPTRAPROAD) {
                _view2Tag = BACCARATROADMAPTYPE.HYBRIDROAD;
                this._instanceView.view2BG.setTexture(vt.res.RoadMap.Baccarat.routeBG28);
            } else if (_view1Tag == BACCARATROADMAPTYPE.HYBRIDROAD)
                _view2Tag = BACCARATROADMAPTYPE.CHIPTRAPROAD;

            this._instanceView.view2.setTag(_view2Tag);
        }
    } else {
        this._instanceView.view2BG.setTexture(vt.res.RoadMap.Baccarat.routeBG14);
        switch (_view1Tag) {
            case BACCARATROADMAPTYPE.BIGROAD:
                if (_view2Tag == BACCARATROADMAPTYPE.HYBRIDROAD) {
                    _view2Tag = BACCARATROADMAPTYPE.CHIPTRAPROAD;
                } else if (_view2Tag == BACCARATROADMAPTYPE.CHIPTRAPROAD) {
                    _view2Tag = BACCARATROADMAPTYPE.BIGSMALLROAD;
                } else {
                    _view2Tag = BACCARATROADMAPTYPE.HYBRIDROAD;
                    this._instanceView.view2BG.setTexture(vt.res.RoadMap.Baccarat.routeBG28);
                }

                break;
            case BACCARATROADMAPTYPE.CHIPTRAPROAD:
                if (_view2Tag == BACCARATROADMAPTYPE.HYBRIDROAD) {
                    _view2Tag = BACCARATROADMAPTYPE.BIGSMALLROAD;
                } else if (_view2Tag == BACCARATROADMAPTYPE.BIGSMALLROAD) {
                    _view2Tag = BACCARATROADMAPTYPE.BIGROAD;
                } else {
                    _view2Tag = BACCARATROADMAPTYPE.HYBRIDROAD;
                    this._instanceView.view2BG.setTexture(vt.res.RoadMap.Baccarat.routeBG28);
                }

                break;
            case BACCARATROADMAPTYPE.HYBRIDROAD:
                if (_view2Tag == BACCARATROADMAPTYPE.CHIPTRAPROAD) {
                    _view2Tag = BACCARATROADMAPTYPE.BIGROAD;
                } else if (_view2Tag == BACCARATROADMAPTYPE.BIGROAD) {
                    _view2Tag = BACCARATROADMAPTYPE.BIGSMALLROAD;
                } else
                    _view2Tag = BACCARATROADMAPTYPE.CHIPTRAPROAD;
                break;
        }

        _collection.setTag(_view2Tag);
    }
    switch (this._instanceView.view1.getTag()) {
        case BACCARATROADMAPTYPE.BIGROAD:
            this.view1Data = this._model._model.bigRoadArray;
            break;
        case BACCARATROADMAPTYPE.HYBRIDROAD:
            this.view1Data = this._model._model.hybridArray;
            break;
        case BACCARATROADMAPTYPE.CHIPTRAPROAD:
            this.view1Data = this._model._model.chipTrapArray;
            break;
        case BACCARATROADMAPTYPE.BIGSMALLROAD:
            this.view1Data = this._model._model.bigSmallArray;
            break;
    }
    switch (this._instanceView.view2.getTag()) {
        case BACCARATROADMAPTYPE.BIGROAD:
            this.view2Data = this._model._model.bigRoadArray;
            break;
        case BACCARATROADMAPTYPE.HYBRIDROAD:
            this.view2Data = this._model._model.hybridArray;
            break;
        case BACCARATROADMAPTYPE.CHIPTRAPROAD:
            this.view2Data = this._model._model.chipTrapArray;
            break;
        case BACCARATROADMAPTYPE.BIGSMALLROAD:
            this.view2Data = this._model._model.bigSmallArray;
            break;
    }

    this._playerAskRoadItemArray = [];
    this._bankerAskRoadItemArray = [];

    this._instanceView.view1.reloadData();
    this._instanceView.view2.reloadData();
};
/**
 * 設定CollectionView的資料源
 * @private
 */
BaccaratRoadMapPresenter.prototype._setCollectonViewDataSource = function () {
    //this._instanceView.view1.setVisible(false);
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
            if (collection.getTag() == BACCARATROADMAPTYPE.HYBRIDROAD)
                _specialSize1 = cc.size(this._cellSize.width / 2, this._cellSize.height / 2);

            cell1.setContentSize(_specialSize1);
            //cell1.bgSprite.setContentSize(cc.size(_specialSize1.width,_specialSize1.height));

            cell = cell1;
            _item = this.view1Data[idx];
        } else {
            var cell2 = collection.dequeueCell();
            if (!cell2) {
                cell2 = new RoadMapCell("route_1.png");
                CYCollectionViewCell.plugin(cell2);
            }
            var _specialSize2 = cc.size(this._cellSize.width, this._cellSize.height);
            if (collection.getTag() == BACCARATROADMAPTYPE.HYBRIDROAD)
                _specialSize2 = cc.size(this._cellSize.width / 2, this._cellSize.height / 2);

            cell2.setContentSize(_specialSize2);
            //cell2.bgSprite.setContentSize(cc.size(_specialSize2.width,_specialSize2.height));

            cell = cell2;
            _item = this.view2Data[idx];
        }

        if (_item != null) {
            cell.itemSprite.setOpacity(255);
            this._setRoadMapItemData(cell, _item);

            if (_item.askRoad == ASKROADMAPTYPE.PLAYERASK) {
                cell.itemSprite.setOpacity(0);
                this._playerAskRoadItemArray.push({"cell": cell, "item": _item});
            } else if (_item.askRoad == ASKROADMAPTYPE.BANKERASK) {
                cell.itemSprite.setOpacity(0);
                this._bankerAskRoadItemArray.push({"cell": cell, "item": _item});
            } else if (_item.askRoad == ASKROADMAPTYPE.TWICEASK) {
                cell.itemSprite.setOpacity(0);
                this._playerAskRoadItemArray.push({"cell": cell, "item": _item});
                // 由於莊問路閒問路同時在一點，因此要做一個轉換。
                var _b_item = _(_item).clone();
                var _b_result = (_item.resultType == BACCARATRESULTCOLOR.RED) ? BACCARATRESULTCOLOR.BLUE : BACCARATRESULTCOLOR.RED;
                _b_item.resultType = _b_result;
                this._bankerAskRoadItemArray.push({"cell": cell, "item": _b_item});
            }
            else {
                cell.itemSprite.setOpacity(255);
            }
        } else {
            cell.itemSprite.setOpacity(0);
            cell.labelText.setString("");
        }

        return cell;
    };

    this.collectionFinishReloadData = function (collection) {
        if (collection.getName() == "view2") {
            var _setAskRoadImg = function (_items, _node) {
                if (!_node || !_items) return;
                var _imgColor = (_items.resultType == BACCARATRESULTCOLOR.BLUE) ? "blue" : "red";
                switch (_items.hybridType) {
                    case HYBRIDTYPE.BIGEYEROAD:
                        var _img1 = "circle_" + _imgColor + "_1.png";
                        _node.setImgPath(_node.bigEyesSprite, _img1);
                        break;
                    case HYBRIDTYPE.SMALLROAD:
                        var _img2 = "circle_" + _imgColor + ".png";
                        _node.setImgPath(_node.smallSprite, _img2);
                        break;
                    case HYBRIDTYPE.GYROAD:
                        if (_imgColor == "blue") _imgColor = "b";
                        if (_imgColor == "red") _imgColor = "r";
                        var _img3 = "line_" + _imgColor + ".png";
                        _node.setImgPath(_node.gySprite, _img3);
                        break;
                    case HYBRIDTYPE.TWICEASK:

                        break;
                }
            };
            for (var i = 0; i < this._model._model.askPlayerArray.length; i++) {
                var _itemA = this._model._model.askPlayerArray[i];
                _setAskRoadImg(_itemA, this._playerAskRoadView);
            }
            for (var i = 0; i < this._model._model.askBankerArray.length; i++) {
                var _itemB = this._model._model.askBankerArray[i];
                _setAskRoadImg(_itemB, this._bankerAskRoadView);
            }
            // New for future
            //this._redrawRoadMapView(collection, this._instanceView.view2Road);
        } else {
            // New for future
            //this._redrawRoadMapView(collection, this._instanceView.view1Road);
        }
        if (this._isFlickeringType)
            this.flickerAskRoadCell(this._isFlickeringType);


    };

    this.numberOfCellsInCollection = function (collection) {
        if (collection.getName() == "view1") {
            var _length = this.view1Data.length;
            return _length;
        } else {
            var _length = this.view2Data.length;
            return _length;
        }
    };

    this.collectionCellTouched = function (collection, cell) {
        //console.log("Touch" + cell.getIdx());

    };

    this.collectionCellSizeForIndex = function (collection, idx) {
        if (collection.getTag() == BACCARATROADMAPTYPE.HYBRIDROAD)
            return cc.size(this._cellSize.width / 2, this._cellSize.height / 2);
        else
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
        //console.log("high Light"+ collectionView.getName());
        //cell.setBackGroundColor(cc.color(0, 88, 78));
        //this._changeRoadMapType(collectionView);
    };

    this.collectionCellUnhighlight = function (collectionView, cell) {
        //console.log("un high Light");
        //cell.setBackGroundColor(cc.color(100, 100, 50));
    };
};
/**
 * 主要給CollcetionView的方法使用，設定這個Cell要顯示的圖片。
 * @param _cell
 * @param _item
 * @returns {*}
 * @private
 */
BaccaratRoadMapPresenter.prototype._setRoadMapItemData = function (_cell, _item) {
    switch (_item.roadMapType) {
        case BACCARATROADMAPTYPE.BIGROAD:
            if (_item.resultType == BACCARATRESULTCOLOR.BLUE) {
                _cell.setItemSpriteFrame("circle_blue_" + (_item.tieNum + 1) + ".png");
            }
            else if (_item.resultType == BACCARATRESULTCOLOR.RED) {
                _cell.setItemSpriteFrame("circle_red_" + (_item.tieNum + 1) + ".png");
            }
            if (this._isDebugMode) _cell.labelText.setString((_item == null) ? "" : _item.tag);
            break;
        case BACCARATROADMAPTYPE.HYBRIDROAD:
            switch (_item.hybridType) {
                case HYBRIDTYPE.BIGEYEROAD:
                    if (_item.resultType == BACCARATRESULTCOLOR.BLUE) {
                        _cell.setItemSpriteFrame("circle_blue_1.png");
                    }
                    else if (_item.resultType == BACCARATRESULTCOLOR.RED) {
                        _cell.setItemSpriteFrame("circle_red_1.png");
                    }
                    break;
                case HYBRIDTYPE.SMALLROAD:
                    if (_item.resultType == BACCARATRESULTCOLOR.BLUE) {
                        _cell.setItemSpriteFrame("circle_blue.png");
                    }
                    else if (_item.resultType == BACCARATRESULTCOLOR.RED) {
                        _cell.setItemSpriteFrame("circle_red.png");
                    }
                    break;
                case HYBRIDTYPE.GYROAD:
                    if (_item.resultType == BACCARATRESULTCOLOR.BLUE) {
                        _cell.setItemSpriteFrame("line_b.png");
                    }
                    else if (_item.resultType == BACCARATRESULTCOLOR.RED) {
                        _cell.setItemSpriteFrame("line_r.png");
                    }
                    break;
                default:
                    break;
            }
            if (this._isDebugMode) _cell.labelText.setString((_item == null) ? "" : _item.tag);

            break;
        case BACCARATROADMAPTYPE.BIGSMALLROAD:

            var _language = cy.util.getCurrentLanguage();
            if (_item.resultType == BACCARATRESULTCOLOR.BLUE) {
                _cell.setItemSpriteFrame("blue_small_" + _language + ".png");
            }
            else if (_item.resultType == BACCARATRESULTCOLOR.RED) {
                _cell.setItemSpriteFrame("red_big_" + _language + ".png");

            } else if (_item.resultType == BACCARATRESULTCOLOR.GREEN) {
                _cell.setItemSpriteFrame("green_t_" + _language + ".png");
            }
            if (this._isDebugMode) _cell.labelText.setString((_item == null) ? "" : _item.tag);
            break;
        case BACCARATROADMAPTYPE.CHIPTRAPROAD:
            var _chip_color = "";
            var _chip_pair_color = "";

            if (_item.resultType == BACCARATRESULTCOLOR.BLUE) _chip_color = "blue";
            if (_item.resultType == BACCARATRESULTCOLOR.RED) _chip_color = "red";
            if (_item.resultType == BACCARATRESULTCOLOR.GREEN) _chip_color = "green";

            if (_item.pairType != PAIRRESULT.NOPAIR) _chip_pair_color = "_";
            if (_item.pairType == PAIRRESULT.BANKERPAIR) _chip_pair_color = _chip_pair_color + "r";
            if (_item.pairType == PAIRRESULT.PLAYERPAIR) _chip_pair_color = _chip_pair_color + "g";
            if (_item.pairType == PAIRRESULT.PBPAIR) _chip_pair_color = _chip_pair_color + "rg";

            var _chipImgPath = _chip_color + _chip_pair_color + "_" + _item.point + ".png";
            _cell.setItemSpriteFrame(_chipImgPath);

            if (this._isDebugMode) _cell.labelText.setString((_item == null) ? "" : _item.tag);
            break;
        default:
    }
    return _cell;
};
/**
 * 初始化畫面UI
 * @private
 */
BaccaratRoadMapPresenter.prototype._initUI = function () {
    BaccaratRoadMapCore.setDefaultRowAndCol(this._defaultRow, this._defaultCol);
    this._cellSize = cc.size(this._instanceViewSize.width / 2 / this._defaultCol, this._instanceViewSize.height / this._defaultRow);

    this._instanceView.view1BG = new cc.Sprite(vt.res.RoadMap.Baccarat.routeBG14);
    this._instanceView.view1BG.setPosition(cc.p(0, 0));
    this._instanceView.view1BG.setAnchorPoint(cc.p(0, 0));
    this._instanceView.addChild(this._instanceView.view1BG);

    this._instanceView.view2BG = new cc.Sprite(vt.res.RoadMap.Baccarat.routeBG28);
    this._instanceView.view2BG.setPosition(cc.p(this._instanceViewSize.width / 2, 0));
    this._instanceView.view2BG.setAnchorPoint(cc.p(0, 0));
    this._instanceView.addChild(this._instanceView.view2BG);

    this._instanceView.view1Road = new cc.Sprite();
    this._instanceView.view1Road.setPosition(cc.p(0, 0));
    this._instanceView.view1Road.setAnchorPoint(cc.p(0, 0));
    this._instanceView.addChild(this._instanceView.view1Road);

    this._instanceView.view1 = cy.CollectionView.create(cc.size(this._instanceViewSize.width / 2, this._instanceViewSize.height));
    this._instanceView.view1.setPosition(cc.p(0, 0));
    this._instanceView.view1.setName("view1");

    this._instanceView.view2Road = new cc.Sprite();
    this._instanceView.view2Road.setPosition(cc.p(this._instanceViewSize.width / 2, 0));
    this._instanceView.view2Road.setAnchorPoint(cc.p(0, 0));
    this._instanceView.addChild(this._instanceView.view2Road);

    this._instanceView.view2 = cy.CollectionView.create(cc.size(this._instanceViewSize.width / 2, this._instanceViewSize.height));
    this._instanceView.view2.setPosition(cc.p(this._instanceViewSize.width / 2, 0));
    this._instanceView.view2.setName("view2");

    this._instanceView.addChild(this._instanceView.view1);
    this._instanceView.addChild(this._instanceView.view2);

    this._leftRoadMapBtn = new ccui.Button();
    this._leftRoadMapBtn.setScale9Enabled(true);
    this._leftRoadMapBtn.setAnchorPoint(cc.p(0, 0));
    this._leftRoadMapBtn.setContentSize(cc.size(this._instanceViewSize.width / 2, this._instanceViewSize.height));
    this._leftRoadMapBtn.setCapInsets(cc.rect(0, 0, this._instanceViewSize.width / 2, this._instanceViewSize.height));
    this._leftRoadMapBtn.setName("Btn1");
    this._leftRoadMapBtn.addTouchEventListener(this.buttonListener, this);
    this._instanceView.addChild(this._leftRoadMapBtn, 10000);

    this._rightRoadMapBtn = new ccui.Button();
    this._rightRoadMapBtn.setAnchorPoint(cc.p(0, 0));
    this._rightRoadMapBtn.setPosition(cc.p(this._instanceViewSize.width / 2, 0));
    this._rightRoadMapBtn.setScale9Enabled(true);
    this._rightRoadMapBtn.setContentSize(cc.size(this._instanceViewSize.width / 2, this._instanceViewSize.height));
    this._rightRoadMapBtn.setCapInsets(cc.rect(this._instanceViewSize.width / 2, 0, this._instanceViewSize.width / 2, this._instanceViewSize.height));
    this._rightRoadMapBtn.setName("Btn2");
    this._rightRoadMapBtn.addTouchEventListener(this.buttonListener, this);
    this._instanceView.addChild(this._rightRoadMapBtn, 10000);


    this._setCollectonViewDataSource();
    this._instanceView.view1.setDataSource(this);
    this._instanceView.view1.setCollectionViewDelegate(this);
    this._instanceView.view1.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
    this._instanceView.view1.setTag(BACCARATROADMAPTYPE.BIGROAD);
    this._instanceView.view1.setScrollerEnabled(false);
    this._instanceView.view1.reloadData();

    this._instanceView.view2.setDataSource(this);
    this._instanceView.view2.setCollectionViewDelegate(this);
    this._instanceView.view2.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
    this._instanceView.view2.setTag(BACCARATROADMAPTYPE.HYBRIDROAD);
    this._instanceView.view2.setScrollerEnabled(false);
    this._instanceView.view2.reloadData();
};