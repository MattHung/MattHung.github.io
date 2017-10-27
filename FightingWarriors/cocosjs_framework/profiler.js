/**
 * Created by matt1201 on 2016/3/24.
 */

CocosWidget.Profiler = cc.Class.extend({
    _profile_datas:[],
    
    ctor:function(){
        this._profile_datas = [];        
    },

    getTick:function(){
        return new Date().getTime();
    },

    startProfile:function(name){

        if(!this._profile_datas[name]){
            this._profile_datas[name]={};            
            this._profile_datas[name]["count"] = 0;
            this._profile_datas[name]["time"] = 0;
            this._profile_datas[name]["avg"] = 0;
        }

        this._profile_datas[name]["lastTick"] = this.getTick();
    },

    stopProfile:function(name){
        this._profile_datas[name]["count"]++;
        this._profile_datas[name]["time"] += (this.getTick() - this._profile_datas[name]["lastTick"]);
        this._profile_datas[name]["avg"] = this._profile_datas[name]["time"] / this._profile_datas[name]["count"];

        return this._profile_datas[name];
    }
});
