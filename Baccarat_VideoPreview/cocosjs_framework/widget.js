/**
 * Created by matt1201 on 2016/3/21.
 */

//InvokeFunction("Namespace.functionName", arguments);
//InvokeFunction("Namespace.functionName", object, arguments);
function InvokeFunction(functionName, context /*, args */) {
    var args = [].slice.call(arguments).splice(2);
    var namespaces = functionName.split(".");
    var func = namespaces.pop();
    for(var i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]];
    }

    if(!context[func])
        return;
    return context[func].apply(context, args);
};

function getURLParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

//var link = String.format('<a href="{0}/{1}/{2}" title="{3}">{3}</a>',url, year, titleEncoded, title);
String.format = function() {
    // The string containing the format items (e.g. "{0}")
    // will and always has to be the first argument.
    var theString = arguments[0];

    // start with the second argument (i = 1)
    for (var i = 1; i < arguments.length; i++) {
        // "gm" = RegEx options for Global search (more than one instance)
        // and for Multiline search
        var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
        theString = theString.replace(regEx, arguments[i]);
    }

    return theString;
};

// parent/second_layer/child_node
CocosWidget.getNode =function(parent_node, path){
    var path_names = path.split("/");
    var result_node=null;

    for(var i =0; i<path_names.length; i++)
    {
        if(path_names[i]=="")
            continue;
        var node = ccui.helper.seekWidgetByName(parent_node, path_names[i]);
        if(node) {
            parent_node = node;

            if(i==path_names.length-1)
                result_node = parent_node;
        }
    }

    return result_node;
};

//connect children of node to object
CocosWidget.connectNode =function(node, object){
    var children =node.getChildren();
    for(var i =0; i<children.length; i++)
    {
        var name =children[i].getName();
        object[name] = children[i];

        CocosWidget.connectNode(children[i], object[name]);
    }
};
