/**
 * Created by matt1201 on 2015/12/17.
 */

var logger = function()
{
    var oldConsoleLog = null;
    var pub = {};
    var enabled = true;

    pub.enableLogger =  function enableLogger()
    {
        if(oldConsoleLog == null)
            return;

        window['console']['log'] = oldConsoleLog;
        enabled = true;
    };

    pub.disableLogger = function disableLogger()
    {
        oldConsoleLog = console.log;
        window['console']['log'] = function() {};
        enabled= false;
    };

    pub.swithLogger = function swithLogger(tag_id)
    {
        oldConsoleLog = window['console']['log'];

        window['console']['log'] = function(log)
        {
            log +="</br>";
            document.getElementById(tag_id).innerHTML +=log;
        };
    };

    pub.log = function(log)
    {
        if(enabled) {
            window['console']['log'](log);
            return;
        }

        this.enableLogger();
        window['console']['log'](log);
        this.disableLogger();
    };

    return pub;
}();