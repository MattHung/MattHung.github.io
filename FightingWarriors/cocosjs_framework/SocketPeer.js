/**
 * Created by Matt Hung on 2016/4/3.
 */

CocosWidget.SocketPeer = cc.Class.extend({
    ws:null,
    _callback_onOpen:null,
    _callback_onClose:null,
    _callback_onError:null,
    _callback_onMessage:null,

    connect:function(ws_url){
        this.ws = new WebSocket(ws_url);
        this.ws.binaryType = "arraybuffer";

        this.ws.onopen =function(){
            if(this._callback_onOpen)this._callback_onOpen();
        }.bind(this);
        this.ws.onclose =function(){
            if(this._callback_onClose)this._callback_onClose();
        }.bind(this);
        this.ws.onerror =function(){
            if(this._callback_onError)this._callback_onError();
        }.bind(this);
        this.ws.onmessage =function(evt){
            if(this._callback_onMessage)this._callback_onMessage(evt);
        }.bind(this);
    },

    close:function(){
        if(this.ws)
            this.ws.close();
    },

    setCallback_onOpen:function(callback_fun){this._callback_onOpen = callback_fun;},
    setCallback_onClose:function(callback_fun){this._callback_onClose = callback_fun;},
    setCallback_onError:function(callback_fun){this._callback_onError = callback_fun;},
    setCallback_onMessage:function(callback_fun){this._callback_onMessage = callback_fun;},

    sendBinary:function(memoryStream){
        this.ws.send(memoryStream.getData());
    }
});
