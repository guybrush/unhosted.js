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
         * @param {String} value The value that should be set. Symetric
         * encryption of this value is not handled by this API! You have to do
         * it yourself with crypto.aes.encryptCBC/decryptCBC
         * @param {Function} callback A function that will be called with the
         * argument (err) once the request completes.
         */
        set: function set(key, value, callback){
            var cmd = JSON.stringify({
                method: 'SET'
                , user: this.user.id
                , key: key
                , value: value
            });

            var privKey = keyStorage.retrievePrivKey(this.user.keyID);

            util.UJJP.sendPost(this.address, this.postURI, {
                protocol: KeyValue.proto
                , cmd: cmd
                , password: this.user.password
                , pubSign: crypto.rsa.signSHA1(cmd, privKey)
            }, function postDone(err, status, data){
                if(err) { callback(err); return; }

                util.UJJP.handlePostError(status, data, callback);
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
            util.UJJP.sendPost(this.address, this.postURI, {
                protocol: KeyValue.proto
                , cmd: JSON.stringify({
                    method: 'GET'
                    , user: this.user.id
                    , key: key
                })
            }, function postDone(err, status, data){
                if(err) { callback(err); return; }

                util.UJJP.handlePostError(status, data, callback, function ok(){
                    var res = JSON.parse(data);
                    var pubKey = keyStorage.retrievePubKey(self.user.keyID);

                    if(!crypto.rsa.verifySHA1(res.pubSign, res.cmd, pubKey)) {
                        callback(new Error('Invalid signature'));
                    }

                    callback(null, res.cmd);
                });
            });
        }
    }

    return KeyValue;
});