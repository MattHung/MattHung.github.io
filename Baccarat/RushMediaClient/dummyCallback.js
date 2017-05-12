/**
 * Created by matt1201 on 2015/12/16.
 */



self.onmessage = function(event) {
    self.postMessage(null);
    setTimeout("self.callback()", 1, event);
};

self.callback = function()
{
    self.onmessage(null);
};
