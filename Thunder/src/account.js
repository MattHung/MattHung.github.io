LoginType = function(){}
LoginType.Online = 0;
LoginType.SinglePlay = 1;

accountManager=cc.Class.extend({ 
    _self_user_id:0,
    _saves:null,

    _loginType:0, //0:online 1:single play

    ctor:function(){         
        this._self_user_id = 0,
        this._saves={};
        this._saves[this._self_user_id] = {UserID:0, UserName:"none", FighterType:1, Score:0}; 
    },

    setLoginType:function(type){
        this._loginType =type;
    },

    setSave:function(playerID, save){
        this._self_user_id = playerID;
        this._saves[playerID] = save;
    },

    getLoginType:function(){
        return this._loginType;
    },

    getFighterType:function(user_id){
        if(!user_id)        
            return this._saves[this._self_user_id].FighterType;

        return this._saves[user_id].FighterType;
    },

    getScore:function(user_id){
        if(!user_id)        
            return this._saves[this._self_user_id].Score;

        return this._saves[user_id].Score;
    },

    addScore:function(score){
        this._saves[this._self_user_id].Score += score;
        return this._saves[this._self_user_id].Score;
    },

    getSave:function(user_id){
        if(!user_id)        
            return this._saves[this._self_user_id];

        if(!this._saves[user_id])
            this._saves[user_id] = {UserID:user_id, UserName:"none", FighterType:0, Score:0}; 

        return this._saves[user_id];
    },

    removeSave:function(user_id){
        if(user_id==this._self_user_id)
            return;
        delete this._saves[user_id];
    },

    getRankedInfo:function(){
        var keys = Object.keys(this._saves);

        keys.sort(function(key1, key2){
            return this._saves[key2].Score - this._saves[key1].Score;
        }.bind(this));

        for(var i =keys.length-1; i>=0; i--)
        if((keys[i]==0) || (this._saves[keys[i]].UserName=="none"))
            keys.splice(i, 1);

        return keys;
    }
});

AccountManager = function(){};
AccountManager.reset = function(){
    AccountManager._instance = new accountManager();
};

AccountManager.getInstance=function(){
    if(!AccountManager._instance)
        AccountManager._instance = new accountManager();
    return AccountManager._instance;
};

