/**
 * Created by nora_wang on 2016/11/30.
 */

var language_manager = cc.Class.extend({
    _dict_en: null,
    _dict_cn:null,
    _dict_tw:null,
    _language: null,

    Choose_Language: {
        lan_English: 0,
        lan_simCh: 1,
        lan_tradCh: 2
    },

    Cookie_lang:["en","zh-cn","zh-tw"],
    BetHistory_lang:["us","cn", "tw"],

    ctor: function () {
        this.setLanguage(this.Choose_Language.lan_tradCh);
        this._dict_en = cc.loader.getRes(res.Language_en_json);
        this._dict_cn = cc.loader.getRes(res.Language_cn_json);
        this._dict_tw = cc.loader.getRes(res.Language_tw_json);
    },


    getCookieLang:function(lang){
       for(var i=0;i<this.Cookie_lang.length;i++){
           if(lang == this.Cookie_lang[i]){
               this.setLanguage(i);
               return;
           }
           else(this.setLanguage(this.Choose_Language.lan_English));
       }
        if(lang ==""){
            this.setLanguage(this.Choose_Language.lan_tradCh);
        }
    },

    getBetHistoryLang:function(){
        return this.BetHistory_lang[this._language];
    },

    setLanguage:function(value){
        this._language = value;
    },

    getLanguage:function(){
        return this._language;
    },

    nextLanguage:function(){
        var next = this._language+1;
        if(next>2)
            next =0;

        this.setLanguage(next);
    },

    getTextID: function (ID) {
        var ChangeLang = this._language;

         switch (ChangeLang) {
            case this.Choose_Language.lan_English:
                return this._dict_en["Language"][ID];
                break;
            case this.Choose_Language.lan_simCh:
                return this._dict_cn["Language"][ID];
                break;
            case this.Choose_Language.lan_tradCh:
                return this._dict_tw["Language"][ID];
                break;
        }
    }

});

language_manager._instance=null;

language_manager.getInstance = function(){

    if(language_manager._instance==null)
        language_manager._instance = new language_manager();

    return language_manager._instance;
};