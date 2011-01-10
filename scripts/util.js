/***
 * Some util functions that would clutter 'unhosted.js'
 */


/**
 * Try different constructors for an XMLHttpRequest
 */
function createXMLHTTPObject() {
    var XMLHttpFactories = [
        function() { return new XMLHttpRequest() },
        function() { return new ActiveXObject("Msxml2.XMLHTTP") },
        function() { return new ActiveXObject("Msxml3.XMLHTTP") },
        function() { return new ActiveXObject("Microsoft.XMLHTTP") }
    ];
    var xmlhttp = null;
    for (var i=0; i < XMLHttpFactories.length ;i++) {
        try {
            xmlhttp = XMLHttpFactories[i]();
        } catch (e) {
            continue;
        }
        break;
    }
    return xmlhttp;
}

var util = {
    /**
     * POST data to a unhosted node.
     *
     * @param {String} address The hostname/ip of the node.
     * @param {String} uri The POST URI
     * @param {Object} obj The JSON object to be POST'ed
     * @param {Function} callback This function will be called once the POST
     * request completes with the parameters (err, status, data).
     */
    sendPost: function sendPost(address, uri, obj, callback) {
        // XMLHttpRequest ready states
        var UNSET = 0;
        var OPENED = 1;
        var HEADERS_RECEIVED = 2;
        var LOADING = 3;
        var DONE = 4;

        var xmlHTTP = createXMLHTTPObject();
        var URI = document.location.protocol
            + '://' + address + uri;

        xmlHTTP.onreadystatechange = function(){
            var state = xmlHTTP.readyState;

            if(state === OPENED) {
                var contentType = 'application/json';
                xmlHTTP.setRequestHeader('Content-type', contentType);
                xmlHTTP.send(JSON.stringify(obj));
            }

            if(state === DONE) {
                callback && callback(null
                                     , xmlHTTP.status
                                     , xmlHTTP.responseText);
            }
        }

        try {
            xmlHTTP.open("POST", URI, true);
        } catch (e) {
            callback && callback(err);
        }
    },

    /**
     * Copy all properties of obj2 into obj1. This overwrites already existing properties.
     */
    merge: function merge(obj1, obj2){
        for(var prop in obj2) {
            if(obj2.hasOwnProperty(prop)) {
                obj1[prop] = obj2[prop];
            }
        }
    }
};

define(util);