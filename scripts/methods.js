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

/**
 * These are the low-level primitives of the Unhosted protocol upon which we
 * build some higher level operations.
 */

define(['./util', './key-storage', './crypto'], function(util, keyStorage, crypto){
    function handleError(status, data, err_callback, ok_callback){
        if(status == 200) {
            ok_callback && ok_callback(null);
        } else {
            var res = JSON.parse(data);
            var err = new Error(res.message);
            // err.number = status;
            err_callback && err_callback(err);
        }
    }

    return {
        /**
         * Send a SET command to the storage node.
         *
         * This will sign the contents of the generated cmd object but it will
         * not encrypt the value. The value is expected to be already encrypted
         * if that is even desired.
         *
         * @param {String} key The key path to set.
         * @param {String} value The value to set.
         * @param {Function} callback A function that will be called with the
         * argument (err) once the request completes.
         */
        _set: function _set(key, value, callback){
            var cmd = JSON.stringify({
                method: 'SET'
                , user: this.user.id
                , key: key
                , value: value
            });

            var privKey = keyStorage.retrivePrivKey(this.user.keyID);

            util.sendPost(this.address, this.postURI, {
                protocol: this.proto
                , cmd: cmd
                , password: this.user.password
                , sign: crypto.rsa.signSHA1(cmd, privKey)
            }, function postDone(err, status, data){
                if(err) { callback && callback(err); return; }

                handleError(status, data, callback, callback);
            });
        },

        /**
         * Send a GET command to the storage node.
         *
         * This function will _NOT_ verify the signature of the received cmd
         * string.
         *
         * @param {String} key The key path to get.
         * @param {Function} callback A function that will be called with the
         * arguments (err, data) once the request completes.
         */
        _get: function _get(key, callback) {
            util.sendPost(this.address, this.postURI, {
                protocol: this.proto
                , cmd: JSON.stringify({
                    method: 'GET'
                    , user: this.user.id
                    , key: key
                })
            }, function postDone(err, status, data){
                if(err) { callback && callback(err); return; }

                handleError(status, data, callback, function ok(){
                    callback && callback(null, data);
                });
            });
        },

        /**
         * Send a SEND command to the storage node
         *
         * This will sign the contents of the generated cmd object but it will
         * not encrypt the value. The value is expected to be already encrypted
         * if that is even desired.
         *
         * @param {User} recipinet The user the message is for.
         * @param {String} key The key path to send to.
         * @param {String} value The value to send.
         * @param {Function} callback A function that will be called with the
         * argument (err).
         */
        _send: function _send(recipient, key, value, callback) {
            var cmd = JSON.stringify({
                    method: 'SEND'
                    , user: recipient.id
                    , key: key
            });

            var privKey = keyStorage.retrivePrivKey(this.user.keyID);

            util.sendPost(this.address, this.postURI, {
                protocol: this.proto
                , cmd: cmd
                , sign: crypto.rsa.signSHA1(cmd, privKey)
            }, function postDone(err, status, data){
                if(err) { callback && callback(err); return; }

                handleError(status, data, callback, callback);
            });
        },

        /**
         * Send a RECEIVE command to the storage node
         *
         * This function will _NOT_ verify the signature of the received cmd
         * string.
         *
         * @param {String} key The key path to receive from.
         * @param {Function} callback A function that will be called with the
         * argument (err, data).
         */
        _receive: function _receive(key, callback){
            util.sendPost(this.address, this.postURI, {
                protocol: this.proto
                , cmd: JSON.stringify({
                    method: 'RECEIVE'
                    , user: this.user.id
                    , key: key
                })
            }, function postDone(err, status, data){
                if(err) { callback && callback(err); return; }

                handleError(status, data, callback, function ok(){
                    callback && callback(null, data);
                });
            });
        }
    }
});