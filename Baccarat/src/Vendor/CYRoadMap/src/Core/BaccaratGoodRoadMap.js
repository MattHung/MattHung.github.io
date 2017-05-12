/**
 * Created by Alan on 16/8/19.
 */

var BaccaratGoodRoadMapHelper = {};

//===================//
//       Public      //
//===================//
BaccaratGoodRoadMapHelper.getGoodRoadMap = function (roadMapStr, resultMappingList, config) {

    var self = this;

    if (typeof roadMapStr !== "string" || !config || !resultMappingList) {
        cc.error("[BaccaratGoodRoadMapHelper] you did not set config and resultMappingList!");
        return;
    }

    var matchedGoodRoadMap = null;
    var roadMapArr = roadMapStr.split(",");
    var resultRoadMapArr = self._parserRoadArrayWithResultList(roadMapArr, resultMappingList);
    var formattedRoadMapStr = "";
    resultRoadMapArr.forEach(function (rItem) {
        if (!rItem.result)
            return;
        if (rItem.result.indexOf("莊") == 0) {
            formattedRoadMapStr += "0";
            formattedRoadMapStr += " ";
        } else if (rItem.result.indexOf("閒") == 0) {
            formattedRoadMapStr += "1";
            formattedRoadMapStr += " ";
        } else if (rItem.result.indexOf("和") == 0) {
            //formattedRoadMapStr += "2";
            // pass here, form Aivi
        }
    });

    formattedRoadMapStr = formattedRoadMapStr.substring(0, formattedRoadMapStr.length - 1); //去除空白

    Object.keys(config).forEach(function (key) {

        if (matchedGoodRoadMap != null)
            return;

        var modifiedFormattedRoadMapStr = formattedRoadMapStr.substring(formattedRoadMapStr.length - key.length, formattedRoadMapStr.length); //只取後面

        matchedGoodRoadMap = config[key]; // set as default
        for (var i = key.length; i >= 0; i--) {
            if (key[i] != modifiedFormattedRoadMapStr[i]) {
                matchedGoodRoadMap = null; //not matched
            }
        }
    });

    return matchedGoodRoadMap;
};

//===================//
//       Private     //
//===================//

BaccaratGoodRoadMapHelper._parserRoadArrayWithResultList = function (_roadArray, _resultList) {

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