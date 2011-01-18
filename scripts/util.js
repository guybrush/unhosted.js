/*
 * The Unhosted.js library
 * Copyright (C) 2011  Daniel Gröber <darklord ät darkboxed.org>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
define(function(){
    // XMLHttpRequest ready states
    var UNSET = 0;
    var OPENED = 1;
    var HEADERS_RECEIVED = 2;
    var LOADING = 3;
    var DONE = 4;

    function HTTP(method, url, headers, body, callback){
        var xmlHTTP = createXMLHTTPObject();

        xmlHTTP.onreadystatechange = function(){
            var state = xmlHTTP.readyState;

            if(state === OPENED) {
                for(var h in headers) {
                    if(headers.hasOwnProperty(h)) {
                        xmlHTTP.setRequestHeader(h, headers[h]);
                    }
                }
                xmlHTTP.send(body);
            }

            if(state === DONE) {
                callback(null, xmlHTTP.status, xmlHTTP.responseText);
            }
        }

        try {
            xmlHTTP.open("POST", url, true);
        } catch (e) {
            callback(err);
        }
    }

    /**
     * Send a HTTP(s) POST request to a server.
     *
     * @param {String} url Uniform Resource Locator including host, path, query
     * and segment.
     * @param {String} query A query string to be appended to the URL with a '&'
     * symbol.
     */
    function POST(url, contentType, body, callback){
        HTTP('POST', url, { 'Content-type': contentType }, body, callback);
    }

    function GET(url, callback){
        HTTP('GET', url, null, null, callback);
    }

    function handlePostError(status, data, err_callback, ok_callback){
        if(typeof ok_callback === 'undefined') {
            ok_callback = err_callback;
        }

        if(status == 200) {
            try {
                ok_callback(null);
            } catch(e) {
                err_callback(e);
            }
        } else {
            try {
                var res = JSON.parse(data);
                var err = new Error(res.message);
                err.number = status;
                err_callback(err);
            } catch(e) {
                err_callback(e);
            }
        }
    }


    /**
     * UJJP specific utilities
     */
    var UJJP = {
        /**
         * POST data to a UJJP server.
         *
         * @param {String} address The hostname/ip of the server.
         * @param {String} uri The POST URI
         * @param {Object} obj The JSON object to be POST'ed
         * @param {Function} callback This function will be called once the POST
         * request completes with the parameters (err, status, data).
         */
        sendPost: function sendPost(address, uri, obj, callback) {
            var url = document.location.protocol
                + '//' + address + uri;

            POST(url, 'application/json', JSON.stringify(obj), callback);
        },

        handlePostError: function handlePostError(status
                                                  , data
                                                  , err_callback
                                                  , ok_callback)
        {
            if(typeof ok_callback === 'undefined') {
                ok_callback = err_callback;
            }

            if(status == 200) {
                try {
                    ok_callback(null);
                } catch(e) {
                    err_callback(e);
                }
            } else {
                try {
                    var res = JSON.parse(data);
                    var err = new Error(res.message);
                    err.number = status;
                    err_callback(err);
                } catch(e) {
                    err_callback(e);
                }
            }
        }
    };

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


    return {
        createXMLHTTPObject: createXMLHTTPObject,

        HTTP: HTTP,
        POST: POST,
        GET: GET,

        UJJP: UJJP
    }
});