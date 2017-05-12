/**
 * Created by chungyogroup on 15/11/20.
 */

var BaccaratRoadMapCore = {
    default_Row: 6,
    default_Col: 9,
    needAskRoadMap: true,
    _bankerWin: "0",
    _playerWin: "1",
    _tie: "2"
};
/**
 * 設定初始值
 * @param _row
 * @param _col
 */
BaccaratRoadMapCore.setDefaultRowAndCol = function (_row, _col) {
    this.default_Row = _row;
    this.default_Col = _col;
};

BaccaratRoadMapCore.needAskRoadMapItem = function (_need) {
    this.needAskRoadMap = _need;
};

// ＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊ Operation Function ＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊
// ＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊ 大路 ＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊
/**
 * 取得大路路值
 * @param _roadMapArray
 * @param _roadItem
 * @returns {{BigRoad: Array, BigRoadSpecial: Array}}
 */
BaccaratRoadMapCore.getBigRoadMap = function (_roadMapArray, _roadItem, _addAskRoadMap) {

    _addAskRoadMap = _addAskRoadMap ? _addAskRoadMap : false;

    var bigRoadArray = this._getDefaultArray(this.default_Row, this.default_Col);
    var _bigRoadVerticalArray = this._getDefaultArray(this.default_Row, this.default_Col); // For bigRoadVerticalArray operation use.

    var _row = 0;
    var _col = 0;
    var _specialRow = 0;    // For bigRoadVerticalArray operation use.
    var _specialCol = 0;    // For bigRoadVerticalArray operation use.
    var _item = null;
    var _lastItem = null;   //上一局的item
    var _itemIndex = 0;

    var _isVertical = true;

    //創建新的Item
    var getNewRoadItem = function (_roadObject) {
        var _newItem = new _roadItem();
        _newItem.resultType = _roadObject.resultType == 1 ? BACCARATRESULTCOLOR.RED : BACCARATRESULTCOLOR.BLUE;
        _newItem.hybridType = _roadObject.hybridType;
        _newItem.tieNum = 0;
        _newItem.point = _roadObject.point;
        _newItem.tag = _roadObject.index;
        _newItem.askRoad = _roadObject.askRoadMap;

        if (_roadObject.hybridType != HYBRIDTYPE.NORESULT) {
            _newItem.roadMapType = BACCARATROADMAPTYPE.HYBRIDROAD;
        } else {
            _newItem.roadMapType = BACCARATROADMAPTYPE.BIGROAD;
        }
        if (_newItem.askRoad != ASKROADMAPTYPE.NOASK) _newItem.tag = -1;

        return _newItem;
    };

    for (var index = 0; index < _roadMapArray.length; index++) {
        _lastItem = null;
        if (_roadMapArray.hasOwnProperty(index)) {
            //最原始的物件實體
            var _roadObject = _roadMapArray[index];
            if (typeof(_roadObject.result) == "string") {
                if (_roadObject.result.indexOf("莊,") != -1) {
                    _roadObject.resultType = BACCARATRESULTCOLOR.RED; //莊家
                } else if (_roadObject.result.indexOf("閒,") != -1) {
                    _roadObject.resultType = BACCARATRESULTCOLOR.BLUE; //閒家
                } else if (_roadObject.result.indexOf("和,") != -1) {
                    _roadObject.resultType = BACCARATRESULTCOLOR.GREEN; //和局
                }
                // 一般運算大路，這兩個參數都是不重要的。
                _roadObject.hybridType = HYBRIDTYPE.NORESULT;
                _roadObject.askRoadMap = ASKROADMAPTYPE.NOASK;
            } else {
                _roadObject.resultType = _roadObject.result;
            }

            _roadObject.index = _itemIndex;

            // For First Blood.
            if (bigRoadArray[0][0] == null) {
                if (_roadObject.resultType != BACCARATRESULTCOLOR.GREEN) {
                    _item = getNewRoadItem(_roadObject);
                    _item.tieNum = index;
                    _item.tag = _itemIndex;
                    bigRoadArray = this._addColArray(bigRoadArray);
                    bigRoadArray[_row][_col] = _item;
                    _bigRoadVerticalArray[_specialRow][_specialCol] = _item;    // For hybridArray operation use.
                    _row++;
                    _specialRow++; //＊＊＊＊＊
                    _itemIndex++;
                }

                //_item = bigRoadArray[0][0];
                //if (!_item){
                //    _item = getNewRoadItem(_roadObject);
                //    _item.resultType = BACCARATRESULTCOLOR.NOCOLOR;
                //    bigRoadArray[0][0] = _item;
                //    _bigRoadVerticalArray[0][0] = _item;    // For hybridArray operation use.
                //}
                //_item.tieNum = index;
                //_item.tag = _itemIndex;
                //if (_roadObject.resultType != BACCARATRESULTCOLOR.GREEN) {
                //    _row ++;
                //    _specialRow ++; //＊＊＊＊＊
                //    _itemIndex ++;
                //}
                _isVertical = true;
                continue;
            }

            // 如果是垂直，上一個只要減少row，就可以取到，反之如果水平，就要減少col來取得
            if (_isVertical) _lastItem = bigRoadArray[_row - 1][_col];
            else _lastItem = bigRoadArray[_row][_col - 1];

            // 如果是和局，就要以上一局的結果，在和局的欄位上+1
            if (_roadObject.resultType == BACCARATRESULTCOLOR.GREEN) {
                _lastItem.tieNum += 1;
                continue;
            }

            _item = getNewRoadItem(_roadObject);

            // 如果開局的結果與上一局結果相同
            if (_lastItem.resultType == _roadObject.resultType) {
                if (_isVertical && this._checkHitItem(bigRoadArray, _row, _col)) {
                    _row -= 1;
                    _col += 1;
                    //轉為橫向發展
                    _isVertical = false;
                }
            }

            // 如果開局的結果與上一局不同
            if (_lastItem.resultType != _roadObject.resultType) {
                _isVertical = true;
                _row = 0;
                _col = this._getLastColIndex(bigRoadArray, _row);

                _specialRow = 0;    // For bigRoadVerticalArray operation use.
                _specialCol += 1; // For bigRoadVerticalArray operation use.
            }

            if (_col >= bigRoadArray[0].length) {
                bigRoadArray = this._addColArray(bigRoadArray);
                //debugPrint("新增欄位啊" + _col + "aaa = " + _row)
            }
            // 新增RoadItem
            bigRoadArray[_row][_col] = _item;

            // For bigRoadVerticalArray operation use.
            if (_specialRow >= _bigRoadVerticalArray.length) {
                _bigRoadVerticalArray = this._addRowArray(_bigRoadVerticalArray);
            }
            // 新增全直向路紙
            _bigRoadVerticalArray[_specialRow][_specialCol] = _item;

            // 依照垂直或水平增加col;
            (_isVertical) ? _row++ : _col++;

            // 在全直向路紙中，只會增加Row，除非遇到不同的顏色才會換行。
            _specialRow++;
            _itemIndex++;
        }
    }

    /**
     * 重要！！！！目前是為了色碟番攤做的～～如果不要莊問閒問，就要立刻返回。
     */
    if (this.needAskRoadMap == false)
        return {BigRoad: bigRoadArray, BigRoadSpecial: _bigRoadVerticalArray};

    if (_addAskRoadMap) {
        // 2016.03.04 星期一帶修正，在都和局的狀況下，裝閒問路也要有畫線
        if (bigRoadArray[0][0] == null && index != 0) {
            _item = getNewRoadItem(_roadObject);
            _item.tieNum = index;
            bigRoadArray[0][0] = _item;
        }
        bigRoadArray = this._addPlayerAskRoad(bigRoadArray, _roadItem, _row, _col);
        bigRoadArray = this._addBankerAskRoad(bigRoadArray, _roadItem, _row, _col);

        // 垂直的路紙，還需要再增加一條空間給閒問路莊問路使用
        _bigRoadVerticalArray = this._addRowArray(_bigRoadVerticalArray);
        _bigRoadVerticalArray = this._addPlayerAskRoad(_bigRoadVerticalArray, _roadItem, _specialRow, _specialCol);
    } else {
        // 給混合路紙用的
        bigRoadArray = this._addBankerAskRoad(bigRoadArray, _roadItem, _row, _col);
    }

    return {BigRoad: bigRoadArray, BigRoadSpecial: _bigRoadVerticalArray};
};
//＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊ 莊問路閒問路增加方法 ＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊
/**
 * 單純在大路上增加閒問路
 * @param _roadArray
 * @param _roadItem
 * @param _row
 * @param _col
 * @returns {*}
 * @private
 */
BaccaratRoadMapCore._addPlayerAskRoad = function (_roadArray, _roadItem, _row, _col) {
    var _newRoadArray = _roadArray;
    var _item = null;

    //創建新的Item
    var getNewRoadItem = function (_roadObject) {
        var _newItem = new _roadItem();
        _newItem.resultType = BACCARATRESULTCOLOR.BLUE;
        _newItem.hybridType = _roadObject.hybridType;
        _newItem.askRoad = ASKROADMAPTYPE.PLAYERASK;

        if (_roadObject.hybridType != HYBRIDTYPE.NORESULT) {
            _newItem.roadMapType = BACCARATROADMAPTYPE.HYBRIDROAD;
        } else {
            _newItem.roadMapType = BACCARATROADMAPTYPE.BIGROAD;
        }
        return _newItem;
    };
    // 如果是第一局，路紙只會畫在這個位置上。
    if (_row == 0 || _row == 0 && _col == 0) {
        _item = getNewRoadItem({"resultType": BACCARATRESULTCOLOR.BLUE, "hybridType": HYBRIDTYPE.NORESULT});
        _item.askRoad = ASKROADMAPTYPE.TWICEASK;
        if (_roadArray[0][0]) {
            _item.tieNum = _roadArray[0][0].tieNum;
        }
        _newRoadArray[_row][_col] = _item;
        return _newRoadArray;
    }

    var _isHit = this._checkHitItem(_roadArray, _row, _col);
    if (_isHit) {
        _row -= 1;
        _col += 1
    }
    //
    if (_col >= _newRoadArray[0].length)
        this._addColArray(_newRoadArray);

    // 這邊要再檢查，_roadArray[_row-1] 需要判斷不等於null的原因
    var _lastItem = (_roadArray[_row - 1] != null && _roadArray[_row - 1][_col] != null) ? _roadArray[_row - 1][_col] : _roadArray[_row][_col - 1];

    _item = getNewRoadItem({"resultType": _lastItem.resultType, "hybridType": _lastItem.hybridType});
    if (_lastItem.resultType == BACCARATRESULTCOLOR.BLUE) {
        _newRoadArray[_row][_col] = _item;
    } else {
        var lastColIndex = this._getLastColIndex(_newRoadArray, 0);
        if (_col <= lastColIndex) this._addColArray(_newRoadArray);
        _newRoadArray[0][lastColIndex] = _item;
    }

    return _newRoadArray;
};
/**
 * 增加莊問路
 * @param _roadArray
 * @param _roadItem
 * @param _row
 * @param _col
 * @returns {*}
 * @private
 */
BaccaratRoadMapCore._addBankerAskRoad = function (_roadArray, _roadItem, _row, _col) {
    var _newArray = _roadArray;

    var _item = null;
    var _lastItem = null;
    var _nextItem = null;

    //創建新的Item
    var getNewRoadItem = function (_roadObject) {
        var _newItem = new _roadItem();
        _newItem.resultType = _roadObject.resultType;
        _newItem.hybridType = _roadObject.hybridType;
        _newItem.askRoad = ASKROADMAPTYPE.BANKERASK;

        if (_roadObject.hybridType != HYBRIDTYPE.NORESULT) {
            _newItem.roadMapType = BACCARATROADMAPTYPE.HYBRIDROAD;
        } else {
            _newItem.roadMapType = BACCARATROADMAPTYPE.BIGROAD;
        }
        return _newItem;
    };

    if (_row == 0 && _col == 0) return _newArray;
    if (_newArray[0][0].askRoad == ASKROADMAPTYPE.TWICEASK) return _newArray;
    if (_newArray[0][0].askRoad == ASKROADMAPTYPE.PLAYERASK) {
        _item = _newArray[0][0];
        _item.askRoad = ASKROADMAPTYPE.TWICEASK;
        _newArray[0][0] = _item;
        return _newArray;
    }

    //Step 1 先檢查第一行，有沒有路紙。
    var _f_row = 0;
    var _f_col = this._getLastColIndex(_newArray, 0);

    var _checkLastAskRoadItem = _newArray[0][_f_col];
    // Step 1 如果最上面並沒有問路，那那一個位置肯定是問路，所以要取左側Item的數值，來判斷是什麼顏色的問路。
    if (_checkLastAskRoadItem == null) {
        _lastItem = _newArray[0][_f_col - 1];
        _item = getNewRoadItem({
            "resultType": (_lastItem.resultType == BACCARATRESULTCOLOR.BLUE) ? BACCARATRESULTCOLOR.RED : BACCARATRESULTCOLOR.BLUE,
            "hybridType": _lastItem.hybridType
        });
        if (_f_col >= _newArray[0].length) this._addColArray(_newArray);
        _newArray[0][_f_col] = _item;
        return _newArray;
    }
    // 2016.2.2 增加，如果閒或莊在第一row的地方一直橫向發展，那這樣閒問路莊問路也會是同一點
    if (_checkLastAskRoadItem.askRoad == ASKROADMAPTYPE.TWICEASK) return _newArray;

    // Step 2 **********************需在檢查此方法的必要性。不應該會有機會跑進這個迴圈
    if (_checkLastAskRoadItem && _checkLastAskRoadItem.askRoad == ASKROADMAPTYPE.NOASK) {
        _lastItem = _checkLastAskRoadItem;
        _item = getNewRoadItem({
            "resultType": (_lastItem.resultType == BACCARATRESULTCOLOR.BLUE) ? BACCARATRESULTCOLOR.RED : BACCARATRESULTCOLOR.BLUE,
            "hybridType": _lastItem.hybridType
        });
        if (_f_col >= _newArray[0].length) this._addColArray(_newArray);
        _newArray[0][_f_col] = _item;
        return _newArray;
    }

    //Step 2 如果第一行的最右邊有問路的Item，那就應該要往左邊那一側去找出他最後一個Item的位置。
    _f_col -= 1;
    for (var _rows = 0; _rows < this.default_Row; _rows++) {
        // 2016.02.01 新增，因應Saiki 常發現這行會出現 291:TypeError: _newArray[(_f_row + 1)] is undefined，因此先增加此判斷
        _f_row = _rows;
        // 2016.02.22 註解，因為會造成第五行有路紙的狀況畫錯
        //if (_rows == (this.default_Row - 1)){
        //    _f_col = this._getLastColIndex(_newArray,_rows-1);
        //    break;
        //}

        _lastItem = _newArray[_rows][_f_col];
        try {
            _nextItem = _newArray[_rows + 1][_f_col];
        } catch (e) {
            //debugPrint("快告訴Lester...你不應該看到這個東西");
            //debugPrint(_rows)
        }

        if (_nextItem == null) {
            _rows += 1;
            _f_row = _rows;
            break;
        }
        // 如果，Row已經到底部，或是下一局與上一局相差不是1，那就要開始轉向了！
        if (_rows == this.default_Row - 1 || (_nextItem.tag - _lastItem.tag) != 1) {
            _f_col = this._getLastColIndex(_newArray, _rows);
            break;
        }
    }
    _item = getNewRoadItem({"resultType": _lastItem.resultType, "hybridType": _lastItem.hybridType});
    if (_f_col >= _newArray[0].length) this._addColArray(_newArray);
    _newArray[_f_row][_f_col] = _item;

    return _newArray;
};

//＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊ 混合路值（大眼路、小路、甲由路 ＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊
/**
 * 整合所有混合路（大眼路、小路、甲由路)
 * @param _bigEyeRoadArray
 * @param _smallRoadArray
 * @param _gyRoadArray
 * @returns {Array}
 * @private
 */
BaccaratRoadMapCore.getHybridRoadMap = function (_bigEyeRoadArray, _smallRoadArray, _gyRoadArray, _customCol) {
    var _colNum = (_customCol) ? _customCol : this.default_Col;

    var hibridArray = this._getDefaultArray(this.default_Row * 2, _colNum * 2);
    var _n_bigEyeRoadArray = this.fillArrayByLimitCol(_bigEyeRoadArray, _colNum * 2);
    var _n_smallRoadArray = this.fillArrayByLimitCol(_smallRoadArray, _colNum);
    var _n_gyRoadArray = this.fillArrayByLimitCol(_gyRoadArray, _colNum);

    _n_bigEyeRoadArray = this.spliceArrayByLimitCol(_n_bigEyeRoadArray, _colNum * 2);
    _n_smallRoadArray = this.spliceArrayByLimitCol(_n_smallRoadArray, _colNum);
    _n_gyRoadArray = this.spliceArrayByLimitCol(_n_gyRoadArray, _colNum);

    for (var _row = 0; _row < this.default_Row * 2; _row++) {
        if (_row < 6) {
            hibridArray[_row] = _n_bigEyeRoadArray[_row];
        } else {
            var a = _n_smallRoadArray[_row - 6];
            var b = _n_gyRoadArray[_row - 6];
            var c = [].concat(a, b);
            hibridArray[_row] = c;
        }
    }

    return hibridArray;
};
/**
 * 依照不同型態，運算混合路紙
 * @param _bigRoadVerticalArray
 * @param _roadItem
 * @param _roadMapType
 * @returns {*}
 */
BaccaratRoadMapCore.operationHybridRoadMap = function (_bigRoadVerticalArray, _roadItem, _roadMapType) {
    var _roadArray = [];
    var _pendingNum = 0;
    var _row = 0;
    var _col = 0;
    var _index = 0;

    switch (_roadMapType) {
        case HYBRIDTYPE.BIGEYEROAD:
            _pendingNum = 1;
            break;
        case HYBRIDTYPE.SMALLROAD:
            _pendingNum = 2;
            break;
        case HYBRIDTYPE.GYROAD:
            _pendingNum = 3;
            break;
    }

    // 如果在這兩個位置，都是Null的話，代表這條路還畫不出來，因此要直接返回空陣列，若不是的話給予初始座標。
    if (_bigRoadVerticalArray[1][_col + _pendingNum] != null) {
        _row = 1;
        _col += _pendingNum;
    } else if (_bigRoadVerticalArray[0][_col + _pendingNum + 1] != null) {
        _row = 0;
        _col += _pendingNum + 1;
    } else {
        var newArray = this.getBigRoadMap(_roadArray, _roadItem);
        return [newArray["BigRoad"], null];
    }
    //debugPrint("Hybrid Type = " + _roadMapType +" Current Row = " + _row +" Current Col = " + _col);
    var _askPlayerItem = null;

    for (_col; _col < _bigRoadVerticalArray[0].length; _col++) {
        for (_row; _row < _bigRoadVerticalArray.length; _row++) {
            if (_bigRoadVerticalArray[_row][_col] == null) continue;
            var _copy_BGVArray = _(_bigRoadVerticalArray[_row][_col]).clone();

            var _resultType = this._getSpecialRoadMapRowColor(_bigRoadVerticalArray, _row, _col, _roadMapType);
            var _askRoadMap = _copy_BGVArray.askRoad;
            var _roadObject = {
                "result": _resultType,
                "point": 0,
                "row": _row,
                "col": _col,
                "hybridType": _roadMapType,
                "askRoadMap": _askRoadMap
            };
            _roadArray[_index] = _roadObject;

            // 如果是閒問路，要把該結果撈出來。
            if (_askRoadMap == ASKROADMAPTYPE.PLAYERASK || _askRoadMap == ASKROADMAPTYPE.TWICEASK) {
                _askPlayerItem = _copy_BGVArray;
                _askPlayerItem.hybridType = _roadMapType;
                _askPlayerItem.roadMapType = BACCARATROADMAPTYPE.HYBRIDROAD;
                _askPlayerItem.resultType = _resultType;
            }
            _index++;
        }
        _row = 0;
    }
    var newArray = this.getBigRoadMap(_roadArray, _roadItem)["BigRoad"];
    return [newArray, _askPlayerItem];
};

/**
 *
 * @param _bigRoadVerticalArray
 * @param _row
 * @param _col
 * @param _roadMapType
 * @returns {number}
 * @private
 */
BaccaratRoadMapCore._getSpecialRoadMapRowColor = function (_bigRoadVerticalArray, _row, _col, _roadMapType) {
    if (_row == 0) {
        var _lastRowLength = this._getRowItemLength(_bigRoadVerticalArray, _col - 1);
        var _lastLastRowLength = this._getRowItemLength(_bigRoadVerticalArray, _col - 2 - _roadMapType);
        // 相同長度代表有起腳，就要回傳藍色
        //debugPrint("row = " + _row + " col = " + _col + " last = " + _lastRowLength + " last last = " + _lastLastRowLength)
        if (_lastRowLength == _lastLastRowLength)
            return BACCARATRESULTCOLOR.RED;
        else
            return BACCARATRESULTCOLOR.BLUE;
    } else {
        // 先檢查左側有沒有路，有路的話就回傳紅色
        if (_bigRoadVerticalArray[_row][_col - 1 - _roadMapType] != null)
            return BACCARATRESULTCOLOR.RED;
        else {
            // 如果沒有路，就檢查左邊上面那個有沒有路，有路的話就回傳藍色
            var test = _bigRoadVerticalArray[_row - 1][_col - 1 - _roadMapType];
            if (_bigRoadVerticalArray[_row - 1][_col - 1 - _roadMapType] != null)
                return BACCARATRESULTCOLOR.BLUE;
            else
                return BACCARATRESULTCOLOR.RED;
        }
    }
};

/**
 * 取得這一行有值的高度
 * @param _bigRoadVerticalArray
 * @param _col
 * @returns {number}
 * @private
 */
BaccaratRoadMapCore._getRowItemLength = function (_bigRoadVerticalArray, _col) {
    var _rowLength = 0;
    for (_rowLength; _rowLength <= _bigRoadVerticalArray.length; _rowLength++) {
        if (_bigRoadVerticalArray[_rowLength] == undefined || _bigRoadVerticalArray[_rowLength][_col] == null)
            return _rowLength;
    }
    return _rowLength;
};

//＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊ 大小路、珠盤路、莊閒和數量 ＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊
/**
 * 取得大小路、珠盤路、莊閒和
 * @param _roadMapArray
 * @param _roadItem
 * @returns {*[]}
 * @private
 */
BaccaratRoadMapCore.getOtherRoadMapAndTotalResultInfo = function (_roadMapArray, _roadItem) {
    var bigSmallArray = [];
    var chipTrapArray = [];
    var bankerWinNumber = 0;
    var playerWinNumber = 0;
    var tieNumber = 0;
    var bankerPair = 0;
    var playerPair = 0;

    for (var index in _roadMapArray) {
        if (_roadMapArray.hasOwnProperty(index)) {
            var roadItem = _roadMapArray[index];

            var bigSmallItem = new _roadItem();
            var chipTrapItem = new _roadItem();
            bigSmallItem.point = roadItem.point;
            bigSmallItem.roadMapType = BACCARATROADMAPTYPE.BIGSMALLROAD;
            chipTrapItem.point = roadItem.point;
            chipTrapItem.roadMapType = BACCARATROADMAPTYPE.CHIPTRAPROAD;

            //＊＊＊＊＊＊＊＊＊＊有BUG，先給預設值方便開發＊＊＊＊＊＊＊＊＊＊
            // roadItem.result = roadItem.result ? roadItem.result : "莊,";
            //＊＊＊＊＊＊＊＊＊＊有BUG，先給預設值方便開發＊＊＊＊＊＊＊＊＊＊

            // 大小路運算
            if (roadItem.result.indexOf("大,") != -1) {
                bigSmallItem.resultType = BACCARATRESULTCOLOR.RED;
            } else if (roadItem.result.indexOf("小,") != -1) {
                bigSmallItem.resultType = BACCARATRESULTCOLOR.BLUE;
            }
            // 珠盤路與總點數和運算
            if (roadItem.result.indexOf("莊,") != -1) {
                chipTrapItem.resultType = BACCARATRESULTCOLOR.RED;
                bankerWinNumber += 1;

            } else if (roadItem.result.indexOf("閒,") != -1) {
                chipTrapItem.resultType = BACCARATRESULTCOLOR.BLUE;
                playerWinNumber += 1;

            } else if (roadItem.result.indexOf("和,") != -1) {
                chipTrapItem.resultType = BACCARATRESULTCOLOR.GREEN;
                tieNumber += 1;

            } else debugPrint("＊＊＊＊＊＊＊＊＊＊＊＊ ！！！有問題啊！！！ ＊＊＊＊＊＊＊＊＊＊＊＊");

            if (roadItem.result.indexOf("莊閒對,") != -1) {
                chipTrapItem.pairType = PAIRRESULT.PBPAIR;
                playerPair += 1;
                bankerPair += 1;
            } else if (roadItem.result.indexOf("莊對,") != -1) {
                chipTrapItem.pairType = PAIRRESULT.BANKERPAIR;
                bankerPair += 1;

            } else if (roadItem.result.indexOf("閒對,") != -1) {
                chipTrapItem.pairType = PAIRRESULT.PLAYERPAIR;
                playerPair += 1;

            }

            bigSmallItem.tag = index;
            chipTrapItem.tag = index;

            bigSmallArray[index] = bigSmallItem;
            chipTrapArray[index] = chipTrapItem;
        }
    }

    return [bigSmallArray, chipTrapArray, {
        Banker: bankerWinNumber,
        Player: playerWinNumber,
        Tie: tieNumber,
        BankerPair: bankerPair,
        PlayerPair: playerPair
    }];
};

// ＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊ 二維陣列相關 Function ＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊
/**
 * 取得空的二維陣列
 * @param _row
 * @param _col
 * @returns {Array}
 * @private
 */
BaccaratRoadMapCore._getDefaultArray = function (_row, _col) {
    var defaultArray = [];
    for (var row = 0; row < _row; row++) {
        defaultArray[row] = [];
        for (var col = 0; col < _col; col++) {
            defaultArray[row][col] = null;
        }
    }
    //debugPrint(defaultArray);
    return defaultArray;
};
/**
 * 新增一列欄位
 * @param _array
 * @returns {*}
 * @private
 */
BaccaratRoadMapCore._addColArray = function (_array) {
    for (var i = 0; i < this.default_Row; i++) {
        _array[i][_array[i].length] = null;
    }
    return _array;
};
BaccaratRoadMapCore._addRowArray = function (_array) {
    var _index = _array.length;
    _array[_index] = [];
    for (var i = 0; i < this.default_Col; i++) {
        _array[_index][i] = null;
    }

    return _array;
};
BaccaratRoadMapCore._addItemToMax = function (_array) {

    if (_array.length < this.default_Col * this.default_Row) {
        for (var i = _array.length; i < this.default_Col * this.default_Row; i++) {
            _array.push(null);
        }
    } else {
        var amountOfColumnsNeeded = _array.length % this.default_Row;
        if (amountOfColumnsNeeded != 0) {
            for (var i = amountOfColumnsNeeded; i < this.default_Row; i++) {
                _array.push(null);
            }
        }
    }


    return _array;
};
/**
 * 檢查二維陣列並返回上一個位置
 * @param _array
 * @return [row,col]
 * @private
 */
BaccaratRoadMapCore._getLastColIndex = function (_array, _row) {
    var _lastColIndex = 0;
    for (var i = _array[_row].length - 1; i >= 0; i--) {
        if (_array[_row][i] != null && _array[_row][i].askRoad == ASKROADMAPTYPE.NOASK) {
            _lastColIndex = i + 1;
            return _lastColIndex;
        }
    }
    return _array[_row].length;
};
/**
 * 檢查是否有碰撞（只會用在垂直狀況）
 * @param _array
 * @param _row
 * @param _col
 * @returns {boolean}
 * @private
 */
BaccaratRoadMapCore._checkHitItem = function (_array, _row, _col) {
    if (_row >= this.default_Row) return true;
    if (_array[_row][_col] != null) return true;

    return false;
};

// ＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊ Other Function ＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊
/**
 *
 * @param _roadArray
 * @param _resultList
 * @returns {Array}
 * @private
 */
BaccaratRoadMapCore._parserRoadArrayWithResultList = function (_roadArray, _resultList) {

    var resultList = _resultList;
    var newArray = [];

    for (var index in _roadArray) {
        if (_roadArray.hasOwnProperty(index)) {
            var array = _roadArray[index].split("-");
            var resultNum = array[0];
            newArray[index] = new ResultItem((_(resultList).isFunction()) ? _resultList(resultNum) : resultList[resultNum], array[1]);
        }
    }
    return newArray;
};

/**
 * 轉換二維陣列，變成一維陣列
 * @param _twoDimensional
 * @returns {Array}
 */
BaccaratRoadMapCore.turnTwoDimensionalToOneDimensionalArray = function (_twoDimensional) {
    var _oneDimensional = [];

    if (!_twoDimensional || _twoDimensional.length == 0) return _oneDimensional;

    for (var _col = 0; _col < _twoDimensional[0].length; _col++) {
        for (var _row = 0; _row < _twoDimensional.length; _row++) {
            _oneDimensional.push(_twoDimensional[_row][_col]);
        }
    }

    return _oneDimensional;
};
/**
 * 結果的物件
 * @param result
 * @param point
 * @constructor
 */
var ResultItem = function (result, point) {
    this.result = result;
    this.point = point;
};

/**
 * 填滿Array
 * @param _array
 * @param _limitCol
 */
BaccaratRoadMapCore.fillArrayByLimitCol = function (_array, _limitCol) {
    var newArray = this._clone(_array);

    if (newArray[0].length < _limitCol) {
        for (var _needCol = _limitCol - newArray[0].length; _needCol > 0; _needCol--) {
            newArray = this._addColArray(newArray);
        }
    }
    return newArray;
};

/**
 * 依照限制的數量，移除Array中的元素
 * @param _array
 * @param _limitCol
 * @returns {*}
 */
BaccaratRoadMapCore.spliceArrayByLimitCol = function (_array, _limitCol) {
    _limitCol = _limitCol ? _limitCol : this.default_Col;

    var newArray = this._clone(_array);

    // 一維陣列用
    if (!cc.isArray(newArray[0])) {
        if (newArray.length > (_limitCol * this.default_Row)) {
            var _maxNum = Math.abs(newArray.length - (_limitCol * this.default_Row));
            for (var _row = 0; _row < _maxNum; _row++) {
                newArray.splice(0, 1);
            }
        }

        return newArray;
    }
    // 二維陣列刪除用
    if (newArray[0].length > _limitCol) {
        for (var _overFlowCol = (newArray[0].length - _limitCol); _overFlowCol > 0; _overFlowCol--) {
            for (var _row = 0; _row < newArray.length; _row++) {
                newArray[_row].splice(0, 1);
            }
        }
    }

    return newArray;
};
/**
 * Deep Clone 方法
 * @param obj
 * @returns {*}
 */
BaccaratRoadMapCore._clone = function (obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = BaccaratRoadMapCore._clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = BaccaratRoadMapCore._clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
};