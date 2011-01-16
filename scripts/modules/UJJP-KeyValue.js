/**
 * UJJP implementation of the KeyValue functionality
 */

define(['../modules'
        , '../util'
        , '../key-storage'
        , '../crypto'],
function(modules, util, keyStorage, crypto) {
    modules.register('KeyValue', 0, 'modules/UJJP-KeyValue');
    var KeyValue = function(user, address){
        this.user = user;
        this.address = address;
    }

    /**
     * The UJJP protocol version this module supports
     */
    KeyValue.proto = 'UJJP/0.2';

    KeyValue.prototype = {
        /**
         * Default post URI
         */
        postURI: '/unhosted/cloudside/unhosted.php',

        /**
         * Send a SET command to the storage node.
         *
         * @param {String} key The key path to set.
         * @param {Object} value Object with the properties 'value' and
         * 'sessionKey'. The value should be a String, this value will be
         * encrypted with the session key.
         * @param {Function} callback A function that will be called with the
         * argument (err) once the request completes.
         */
        set: function set(key, val, callback){
            if(typeof val !== 'object'
               || typeof val.value !== 'string'
               || typeof val.sessionKey !== 'string')
            {
                throw new Error('Invalid value object');
            }

            var cmd = JSON.stringify({
                method: 'SET'
                , user: this.user.id
                , key: key
                , value: crypto.aes.encryptCBC(val.value, val.sessionKey)
            });

            var privKey = keyStorage.retrievePrivKey(this.user.keyID);

            util.sendPost(this.address, this.postURI, {
                protocol: KeyValue.proto
                , cmd: cmd
                , password: this.user.password
                , sign: crypto.rsa.signSHA1(cmd, privKey)
            }, function postDone(err, status, data){
                if(err) { callback(err); return; }

                util.handlePostError(status, data, callback);
            });
        },

        /**
         * Send a GET command to the storage node.
         *
         * @param {String} key The key path to get.
         * @param {Function} callback A function that will be called with the
         * arguments (err, value) once the request completes.
         */
        get: function get(key, callback) {
            var self = this;
            util.sendPost(this.address, this.postURI, {
                protocol: KeyValue.proto
                , cmd: JSON.stringify({
                    method: 'GET'
                    , user: this.user.id
                    , key: key
                })
            }, function postDone(err, status, data){
                if(err) { callback(err); return; }

                util.handlePostError(status, data, callback, function ok(){
                    var res = JSON.parse(data);
                    var pubKey = keyStorage.retrievePubKey(self.user.keyID);

                    if(!crypto.verifySHA1(res.pubSign, reponse.value)) {
                        callback(new Error('Invalid signature'));
                    }

                    callback(null, data);
                });
            });
        }
    }

    return KeyValue;
});