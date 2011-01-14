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

define({
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
    },

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

        var xmlHTTP = this.createXMLHTTPObject();
        var URI = document.location.protocol
            + '//' + address + uri;

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

    handlePostError: function handlePostError(status, data, err_callback, ok_callback){
        if(typeof ok_callback === 'undefined') {
            ok_callback = err_callback;
        }

        if(status == 200) {
            ok_callback(null);
        } else {
            var res = JSON.parse(data);
            var err = new Error(res.message);
            // err.number = status;
            err_callback(err);
        }
    }
});