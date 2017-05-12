/**
 * Created by helen_pai on 2017/1/24.
 */

var GamblerParticipator = cc.Class.extend({
    userName: null,
    gameName: null,
    gameSession: null,
    gameTime: null,
    gameDate: null,

    ctor: function (data) {
        this.gameDate = data.D;
        this.gameTime = data.DT;
        this.gameName = data.F;
        this.userName = data.N;
        this.gameSession = data.R;
    },
});