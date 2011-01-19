/**
 * UJJP implementation of the KeyValue functionality
 */

define(['../interfaces/KeyValue'
        , '../modules'
        , '../util'
        , '../key-storage'
        , '../crypto'],
function(KeyValueInterface, modules, util, keyStorage, crypto) {
    modules.register('KeyValue', 0, 'modules/UJJP-KeyValue');

    /* Inherit interfaces/KeyValue */
    var UJJPKeyValue = Object.create(KeyValueInterface);

    /**
     * The UJJP protocol version this module supports
     */
    UJJPKeyValue.protocol = 'UJJP/0.2;KeyValue-0.2';
    var protocol = UJJPKeyValue.protocol;

    /**
     * Default post URI
     */
    UJJPKeyValue.postURI = '/unhosted/cloudside/unhosted.php';

    UJJPKeyValue.set = function set(key, value, callback){
        var password = this.user.getAuth(protocol);
        if( typeof password !== 'string') {
            throw new Error('User has No password set for ' + protocol);
        }

        var cmd = JSON.stringify({
            method: 'SET'
            , user: this.user.id
            , keyHash: key
            , value: value
        });

        var privKey = keyStorage.retrievePrivKey(this.user.keyID);

        util.UJJP.sendPost(this.address, this.postURI, {
            protocol: protocol
            , password: password
            , command: cmd
            , pubSign: crypto.rsa.signSHA1(cmd, privKey)
        }, function postDone(err, status, data){
            if(err) { callback(err); return; }

            util.UJJP.handlePostError(status, data, callback);
        });
    };

    UJJPKeyValue.get = function get(key, callback) {
        var self = this;

        var cmd = JSON.stringify({
            method: 'GET'
            , user: this.user.id
            , keyHash: key
        });

        util.UJJP.sendPost(this.address, this.postURI, {
            protocol: protocol
            , command: cmd
        }, function postDone(err, status, data){
            if(err) { callback(err); return; }

            util.UJJP.handlePostError(status, data, callback, function ok(){
                var res = JSON.parse(data);
                var pubKey = keyStorage.retrievePubKey(self.user.keyID);

                if(!crypto.rsa.verifySHA1(res.pubSign, res.cmd, pubKey)) {
                    throw new Error('Invalid signature');
                }

                var cmd = JSON.parse(res.cmd);

                callback(null, cmd.value, res.cmd);
            });
        });
    };

    return UJJPKeyValue;
});