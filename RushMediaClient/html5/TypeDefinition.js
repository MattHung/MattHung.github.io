/**
 * Created by matt1201 on 2016/1/21.
 */
function Task(callback, msg, delayTicks) {
    this.executeTick=new Date().getTime() + (delayTicks==undefined ? 0:delayTicks);
    this.callback = callback;
    this.startMessage = msg;
    this.delayTicks=delayTicks;
};

var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
// Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
// At least Safari 3+: "[object HTMLElementConstructor]"
var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
var isIE = /*@cc_on!@*/false || !!document.documentMode; // At least IE6