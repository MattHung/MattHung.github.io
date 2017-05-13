/**
 * Created by Matt Hung on 2016/12/22.
 */

// test server
 var VIDEO_SOURCE_URL = "ws://video.godofgb.com:50480";

//production server
 // var VIDEO_SOURCE_URL = "ws://vdstr.godofgb.com";

 function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

var ui_Login = gameLayer.extend({    
    _btn_login:null,
    _field_account:null,
    _field_password:null,
    _UserLang:"",

    _devLogin:false,

    ctor: function (){
        this._super(scene_json.LoginPanel_json);

        CocosWidget.eventRegister.getInstance().setRootNode(this.root_node);

        this.setVisible(false);
	// this.login("", "", 0);
        this.devLogin();
    },

    devLogin:function(){
        this._devLogin = true;
        this.setVisible(true);

        this._field_account = this.getNode("account_Node/input_account");
        this._field_password = this.getNode("password_Node/input_password");

        this._field_account.setString("Guest");
        this._field_password.setString("0000");

        this._btn_login = this.getNode("Btn_done");
        setCookie("SESSION_ID", "");

        this.registerMouseEvent(this._btn_login, function(node, mouseHitPoint){
            var account = this._field_account.getString();
            var password = this._field_password.getString();

            this.login(account, password);
            // this.getSession(account, password);
        }.bind(this));
    },
    getWShost:function(){
        if(this._devLogin)
            return "ws://220.134.243.106:61230";

        if (!cc.sys.isNative) {
            if((window.location.protocol=="http") || (window.location.protocol=="http:"))
                return "ws://" + window.location.hostname +"/goglive";
            else
                return "wss://" + window.location.hostname +"/goglive";
        }
    },


    login:function(account, password, user_id){

        var sessionID = "";
        
        sessionID = getCookie("SESSION_ID");
	    this.getLang();

        if(!sessionID){
            sessionID = "robot";
            user_id = password;
        }

        AccountCenter.getInstance().setSessionID(sessionID);

        var host = this.getWShost();

        baccaratPeer.getInstance().connect(host,
                function()
                {
                    // gameID, sessionID, platform, hallID, userName, userID, browser, osType
                    baccaratPeer.getInstance().requestLogin("35101", sessionID, 0, 0, account, user_id, "", "");  

                }.bind(this),
                function(res, error){                    
                    if (res == 1) {
                        GameManager.getInstance().changeScene(SceneEnum.RoomList, true);
                        cc.log("LoginSuccess");
                        return;
                    }

                    ui_MessageBox.getInstance().showPureText(error);
                    cc.log("LoginError");

                }.bind(this));
    },

    getSession:function(account, password){
        var url = String.format("http://bm.vir999.com/app/WebService/view/display.php/MobileLogin?username={0}&password={1}&platform={2}&domaincode={3}&ip='{4}'",
                            account, password, 0, "esb", "127.0.0.1");

        this.httpRequest(url, function(text){
            var json_res = JSON.parse(text);
            if(json_res.result){
                setCookie("SESSION_ID", json_res.data.session_token);
                setCookie("lang","");
                this.login(account, password, json_res.data.UserID);
                return;
            }

            ui_MessageBox.getInstance().showText("", json_res.data.Message);
        }.bind(this));
    },


    getLang:function(){
        if(this._UserLang == "" || null){
            this.getUserLanguage();
      
        }

        this._UserLang  = getCookie("lang");
        language_manager.getInstance().getCookieLang(this._UserLang);
    },

    getUserLanguage:function(){
        this._UserLang = (window.navigator.language).toLowerCase();
        return this._UserLang;
    },

    httpRequest : function(url, callback){
        var request = cc.loader.getXMLHttpRequest();
        request.timeout = 3000;
        request.open("GET", url, true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                if(callback != null){
                    callback(request.responseText);
                }
            }
        };
        request.send();
    }
});

