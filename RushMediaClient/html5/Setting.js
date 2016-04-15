/**
 * Created by matt1201 on 2015/12/17.
 */

var logger = function()
{
    var oldConsoleLog = null;
    var pub = {};

    pub.enableLogger =  function enableLogger()
    {
        if(oldConsoleLog == null)
            return;

        window['console']['log'] = oldConsoleLog;
    };

    pub.disableLogger = function disableLogger()
    {
        oldConsoleLog = console.log;
        window['console']['log'] = function() {};
    };

    pub.swithLogger = function swithLogger(tag_id)
    {
        oldConsoleLog = window['console']['log'];

        window['console']['log'] = function(log)
        {
            log +="</br>";
            document.getElementById(tag_id).innerHTML +=log;
        };
    }

    return pub;
}();