/**
 * Created by chungyogroup on 15/11/19.
 */
var BACCARATROADMAPTYPE = {
    NOTYPE: 0,
    BIGROAD: 1,
    HYBRIDROAD: 2,
    BIGSMALLROAD: 3,
    CHIPTRAPROAD: 4
};

var BACCARATRESULTCOLOR = {
    NOCOLOR: 0,
    RED: 1,
    BLUE: 2,
    GREEN: 3
};
//  莊閒對
var PAIRRESULT = {
    NOPAIR: 0,
    PLAYERPAIR: 1,
    BANKERPAIR: 2,
    PBPAIR: 3
};
//  大小路
var BIGSMALLRESULT = {
    NORESULT: 0,
    BIG: 1,
    SMALL: 2
};
//  混合路
var HYBRIDTYPE = {
    NORESULT: 3,    //因為關係到演算邏輯，因此DEFAULT預設是3

    BIGEYEROAD: 0,
    SMALLROAD: 1,
    GYROAD: 2
};

var ASKROADMAPTYPE = {
    NOASK: 0,
    BANKERASK: 1,
    PLAYERASK: 2,
    TWICEASK: 3
};

var BaccaratRoadItem = function () {
    this.roadMapType = BACCARATROADMAPTYPE.NOTYPE;
    this.resultType = BACCARATRESULTCOLOR.NOCOLOR;
    this.pairType = PAIRRESULT.NOPAIR;
    this.hybridType = HYBRIDTYPE.NORESULT;
    this.tieNum = 0;
    this.point = 0;
    this.tag = -1;
    this.askRoad = ASKROADMAPTYPE.NOASK;  //在混合路中，如果askRoad = True的話，hibrid又等於3，那就代表莊閒問路同一點。
};