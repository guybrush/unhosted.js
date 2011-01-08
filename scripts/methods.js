/**
 * This is the prototype of the class 'Unhosted' defined in unhosted.js
 */

function handleError(status, data, callback){
    if(status == 200) {
        callback && callback(null);
    } else {
        var res = JSON.parse(data);
        var err = new Error(res.message);
        err.number = res.code;
        callback && callback(err);
    }
}

define(['./util.js', './crypto'], function(util, crypto){
    var sendPost = util.sendPost;

    return {
        /**
         * Send a SET command to the storage node.
         *
         * @param {String} keyPath The key path to set.
         * @param {String} value The value to set.
         * @param {Function} callback A function that will be called with the
         * argument (err) once the request completes.
         */
        _set: function _set(keyPath, value, callback){
            var cmd = JSON.stringify({
                method: 'SET'
                , user: this.user.id
                , keyPath: keyPath
                , value: crypto.AES.encryptCBC(value, ..);
            });

            sendPost(this.address, this.postURI, {
                protocol: this.proto
                , cmd: cmd
                , password: this.user.password
                , sign: crypto.rsa.signSHA1(cmd, this.user.privKey);
            }, function postDone(err, status, data){
                if(err) { callback && callback(err); return; }

                handleError(status, data, callback);
            });
        },

        /**
         * Send a GET command to the storage node.
         *
         * @param {String} keyPath The key path to get.
         * @param {Function} callback A function that will be called with the
         * arguments (err, data) once the request completes.
         */
        _get: function _get(keyPath, callback) {
            sendPost(this.address, this.postURI, {
                protocol: this.proto
                , cmd: JSON.stringify({
                    method: 'GET'
                    , user: this.user.id
                    , keyPath: keyPath
                })
            }, function postDone(err, status, data){
                if(err) { callback && callback(err); return; }

                handleError(status, data, callback);
            });
        },

        /**
         * Send a SEND command to the storage node
         *
         * @param {User} recipinet The user the message is for.
         * @param {String} keyPath The key path to send to.
         * @param {String} value The value to send.
         * @param {Function} callback A function that will be called with the
         * argument (err).
         */
        _send: function _send(recipient, keyPath, value, callback) {
            var cmd = JSON.stringify({
                    method: 'SEND'
                    , user: recipient.id
                    , keyPath: keyPath
            });

            sendPost(this.address, this.postURI, {
                protocol: this.proto
                , cmd: cmd
                , sign: crypto.rsa.signSHA1(cmd, recipinet.privKey);
            }, function postDone(err, status, data){
                if(err) { callback && callback(err); return; }

                handleError(status, data, callback);
            });
        },

        /**
         * Send a RECEIVE command to the storage node
         *
         * @param {String} keyPath The key path to receive from.
         * @param {Function} callback A function that will be called with the
         * argument (err, data).
         */
        _receive: function _receive(keyPath, callback){
            sendPost(this.address, this.postURI, {
                protocol: this.proto
                , cmd: JSON.stringify({
                    method: 'RECEIVE'
                    , user: this.user.id
                    , keyPath: keyPath
                })
            }, function postDone(err, status, data){
                if(err) { callback && callback(err); return; }

                handleError(status, data, callback);
            });
        }
    }
});