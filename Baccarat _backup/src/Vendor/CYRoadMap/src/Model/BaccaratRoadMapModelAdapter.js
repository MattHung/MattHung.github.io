/**
 * Created by chungyogroup on 2015/12/4.
 */

var BaccaratRoadMapModel = function () {
    this.bigRoadArray = []; // 大路
    this._bigRoadVerticalArray = []; // 專門給混合路運算用
    this.bigSmallArray = []; // 大小路
    this.chipTrapArray = [];
    this.bigEyesArray = [];
    this.smallRoadArray = [];
    this.gyRoadArray = [];
    this.hybridArray = [];

    this.bankerWinNumber = null;
    this.playerWinNumber = null;
    this.tieNumber = null;
    this.roadMapInformation = {};

    this.askPlayerArray = [];
    this.askBankerArray = [];
};

var BaccaratRoadMapModelAdapter = function () {

    this._model = new BaccaratRoadMapModel();
    // this.observerLite = new CYObserverLite(this._model);
    this._itemModel = null;
    this._core = null;
    this._resultList = null;
    this._observePropertyTable = [];
    this._roadMapData = "";

    return this;
};

BaccaratRoadMapModelAdapter.prototype.registerObserver = function (callback) {

    var observerList = this._observePropertyTable;
    observerList.push(callback);
    //debugPrint(this._observePropertyTable)
};

BaccaratRoadMapModelAdapter.prototype.setDataSource = function (_itemModel, _core, _resultList) {
    this._itemModel = _itemModel;
    this._core = _core;
    this._resultList = _resultList;
};

/**
 * 只更新大路與莊閒和的數量
 * @param _roadMapStr
 */
// BaccaratRoadMapModelAdapter.prototype.updateBigRoad = function (_roadMapStr, _forciblyUpdate) {
//     _forciblyUpdate = _forciblyUpdate ? _forciblyUpdate : false;
//
//     //if (_forciblyUpdate == false)
//     //    if (this._roadMapData == _roadMapStr) return;
//
//     // Step 1: 把路紙字串轉成陣列。
//     var step1_Array = (!_roadMapStr || _roadMapStr == "" || _roadMapStr == " ") ? [] : _roadMapStr.split(",");
//     // Step 2: 與ResultList中的字元配對。
//     var step2_Array = this._core._parserRoadArrayWithResultList(step1_Array, this._resultList);
//     // Step 3: 運算大路
//     var bigRoadDic = this._core.getBigRoadMap(step2_Array, this._itemModel, true);
//     var _bigRoad = this._core.spliceArrayByLimitCol(bigRoadDic.BigRoad);
//     this._model.bigRoadArray = this._core.turnTwoDimensionalToOneDimensionalArray(_bigRoad);
//     // Step 4: 取得莊閒和數量
//     var _otherArray = this._core.getOtherRoadMapAndTotalResultInfo(step2_Array, this._itemModel);
//     var _totalResultInfo = _otherArray[2];
//     this.observerLite.set("bankerWinNumber", _totalResultInfo["Banker"]);
//     this.observerLite.set("playerWinNumber", _totalResultInfo["Player"]);
//     this.observerLite.set("tieNumber", _totalResultInfo["Tie"]);
//
//     //if (this._roadMapData != _roadMapStr || _forciblyUpdate == true){
//     //    this._roadMapData = _roadMapStr;
//     //    this._notifyObservers(this._model)
//     //}
//     this._roadMapData = _roadMapStr;
//     this._notifyObservers(this._model)
// };

/**
 * 只更新珠盤路
 * @param _roadMapStr
 */
BaccaratRoadMapModelAdapter.prototype.updateChipTrap = function (_roadMapStr, _forciblyUpdate) {
    _forciblyUpdate = _forciblyUpdate ? _forciblyUpdate : false;

    // Step 1: 把路紙字串轉成陣列。
    var step1_Array = (!_roadMapStr || _roadMapStr == "" || _roadMapStr == " ") ? [] : _roadMapStr.split(",");
    // Step 2: 與ResultList中的字元配對。
    var step2_Array = this._core._parserRoadArrayWithResultList(step1_Array, this._resultList);
    // Step 3: 運算珠盤路
    var _otherArray = this._core.getOtherRoadMapAndTotalResultInfo(step2_Array, this._itemModel);
    this._model.bigSmallArray = this._core.spliceArrayByLimitCol(_otherArray[0]);
    this._model.chipTrapArray = this._core.spliceArrayByLimitCol(_otherArray[1]);

    this._roadMapData = _roadMapStr;
    this._notifyObservers(this._model)
};

/**
 * 完整更新所有路紙
 * @param _roadMapStr
 */
// BaccaratRoadMapModelAdapter.prototype.update = function (_roadMapStr) {
//
//     //if (this._roadMapData == _roadMapStr && _roadMapStr != "") return;
//
//     // Step 1: 把路紙字串轉成陣列。
//     var step1_Array = (_roadMapStr == "" || _roadMapStr == " ") ? [] : _roadMapStr.split(",");
//     // Step 2: 與ResultList中的字元配對。
//     var step2_Array = this._core._parserRoadArrayWithResultList(step1_Array, this._resultList);
//
//     var bigRoadDic = this._core.getBigRoadMap(step2_Array, this._itemModel, true);
//     var _bigRoad = this._core.spliceArrayByLimitCol(bigRoadDic.BigRoad);
//     this._model.bigRoadArray = this._core.turnTwoDimensionalToOneDimensionalArray(_bigRoad);
//     this._model._bigRoadVerticalArray = bigRoadDic.BigRoadSpecial;
//
//     var _otherArray = this._core.getOtherRoadMapAndTotalResultInfo(step2_Array, this._itemModel);
//     var bigSmallArray = this._core._addItemToMax(_otherArray[0]);
//     var chipTrapArray = this._core._addItemToMax(_otherArray[1]);
//     this._model.bigSmallArray = this._core.spliceArrayByLimitCol(bigSmallArray);
//     this._model.chipTrapArray = this._core.spliceArrayByLimitCol(chipTrapArray);
//
//     var _totalResultInfo = _otherArray[2];
//     this.observerLite.set("bankerWinNumber", "" + _totalResultInfo["Banker"]);
//     this.observerLite.set("playerWinNumber", "" + _totalResultInfo["Player"]);
//     this.observerLite.set("tieNumber", "" + _totalResultInfo["Tie"]);
//
//     var _bigEyesRoadDataArray = this._core.operationHybridRoadMap(this._model._bigRoadVerticalArray, this._itemModel, HYBRIDTYPE.BIGEYEROAD);
//     var _smallRoadDataArray = this._core.operationHybridRoadMap(this._model._bigRoadVerticalArray, this._itemModel, HYBRIDTYPE.SMALLROAD);
//     var _gyRoadDataArray = this._core.operationHybridRoadMap(this._model._bigRoadVerticalArray, this._itemModel, HYBRIDTYPE.GYROAD);
//
//     this._model.askPlayerArray = [_bigEyesRoadDataArray[1], _smallRoadDataArray[1], _gyRoadDataArray[1]];
//     this._model.askBankerArray = this._getBankerAskRoadMapArray(this._model.askPlayerArray);
//
//     this._model.bigEyesArray = _bigEyesRoadDataArray[0];
//     this._model.smallRoadArray = _smallRoadDataArray[0];
//     this._model.gyRoadArray = _gyRoadDataArray[0];
//
//     this._model.hybridArray = this._core.getHybridRoadMap(this._model.bigEyesArray, this._model.smallRoadArray, this._model.gyRoadArray);
//
//     //if (!this._roadMapData)
//     //    this._roadMapData = _roadMapStr;
//     this._model.hybridArray = this._core.turnTwoDimensionalToOneDimensionalArray(this._model.hybridArray);
//     //if (this._roadMapData != _roadMapStr || _roadMapStr == ""){
//     //    this._roadMapData = _roadMapStr;
//     //    this._notifyObservers(this._model)
//     //}
//     this._roadMapData = _roadMapStr;
//     this._notifyObservers(this);
//     //debugPrint(this._model.gyRoadArray)
// };

/**
 * 不分割RoadMap
 * @param _roadMapStr
 */
BaccaratRoadMapModelAdapter.prototype.updateCustomRoadMap = function (_roadMapStr, _roadCol) {
    // 先更新預設幾行路紙
    this._core.setDefaultRowAndCol(6, _roadCol);

    // Step 1: 把路紙字串轉成陣列。
    var step1_Array = (_roadMapStr == "" || _roadMapStr == " ") ? [] : _roadMapStr.split(",");
    // Step 2: 與ResultList中的字元配對。
    var step2_Array = this._core._parserRoadArrayWithResultList(step1_Array, this._resultList);

    // 大路
    var bigRoadDic = this._core.getBigRoadMap(step2_Array, this._itemModel, true);
    this._model.bigRoadArray = bigRoadDic.BigRoad;
    this._model._bigRoadVerticalArray = bigRoadDic.BigRoadSpecial;

    // 混合路
    var _bigEyesRoadDataArray = this._core.operationHybridRoadMap(this._model._bigRoadVerticalArray, this._itemModel, HYBRIDTYPE.BIGEYEROAD);
    var _smallRoadDataArray = this._core.operationHybridRoadMap(this._model._bigRoadVerticalArray, this._itemModel, HYBRIDTYPE.SMALLROAD);
    var _gyRoadDataArray = this._core.operationHybridRoadMap(this._model._bigRoadVerticalArray, this._itemModel, HYBRIDTYPE.GYROAD);

    this._model.askPlayerArray = [_bigEyesRoadDataArray[1], _smallRoadDataArray[1], _gyRoadDataArray[1]];
    this._model.askBankerArray = this._getBankerAskRoadMapArray(this._model.askPlayerArray);

    this._model.bigEyesArray = _bigEyesRoadDataArray[0];
    this._model.smallRoadArray = _smallRoadDataArray[0];
    this._model.gyRoadArray = _gyRoadDataArray[0];

    //特殊路（大小路、朱盤路）
    var _otherArray = this._core.getOtherRoadMapAndTotalResultInfo(step2_Array, this._itemModel);
    this._model.bigSmallArray = _otherArray[0];
    this._model.chipTrapArray = _otherArray[1];
    this._model.roadMapInformation = _otherArray[2];
};

BaccaratRoadMapModelAdapter.prototype._notifyObservers = function (modalData) {
    var observerList = this._observePropertyTable;
    for (var i in observerList) {
        var observer = observerList[i];
        observer(modalData);
    }
};

BaccaratRoadMapModelAdapter.prototype._getBankerAskRoadMapArray = function (_playerAskArray) {
    var self = this;
    var _copy_playerAskArray = _playerAskArray.slice();
    var _bigEyes = _copy_playerAskArray[0];
    var _small = _copy_playerAskArray[1];
    var _gy = _copy_playerAskArray[2];

    var _notPlayerAskItemToBankerAsk = function (_playerItem) {
        if (_playerItem) {
            var _bankerItem = new self._itemModel();
            _bankerItem.resultType = (_playerItem.resultType == BACCARATRESULTCOLOR.RED) ? BACCARATRESULTCOLOR.BLUE : BACCARATRESULTCOLOR.RED;
            _bankerItem.askRoad = ASKROADMAPTYPE.BANKERASK;
            _bankerItem.tag = -1;
            _bankerItem.roadMapType = _playerItem.roadMapType;
            _bankerItem.hybridType = _playerItem.hybridType;
            return _bankerItem;
        } else
            return null;
    };
    return [_notPlayerAskItemToBankerAsk(_bigEyes), _notPlayerAskItemToBankerAsk(_small), _notPlayerAskItemToBankerAsk(_gy)];
};