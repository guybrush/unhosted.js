/**
 * UJJP implementation of the MessageQueue functionality
 */

define(['../modules'
        , '../util'
        , '../key-storage'
        , '../crypto'],
function(modules, util, keyStorage, crypto) {
    modules.register('MessageQueue', 0, 'modules/UJJP-MessageQueue');
    var MessageQueue = function(user, address){
        this.user = user;
        this.address = address;
    }

    /**
     * The UJJP protocol version this module supports
     */
    MessageQueue.proto = 'UJJP/0.2';

    MessageQueue.prototype = {
        /**
         * Default post URI
         */
        postURI: '/unhosted/cloudside/unhosted.php',

        /**
         * Send a SEND command to the storage node.
         *
         * @param {User} recipient The recipient of this message
         * @param {String} key The key to send to.
         * @param {String} message . The message that will be sent
         * @param {Function} callback A function that will be called with the
         * argument (err) once the request completes.
         */
        send: function send(recipinet, key, message, callback){
            var recipientPubKey = keyStorage.retrievePubKey(recipient.keyID);
            var privKey = keyStorage.retrievePrivKey(this.user.keyID);
            var sessionKey = crypto.random.bytes(16).join('');

            // TESTME: do we need a checksum of the message?
            // what if somebody tries to decrypt a message that was not
            // encrypted with his rsa key? Will decryption succeed? If that is
            // the case a hash of the message should be included to be sure the
            // message was actually for the user trying to decrypt it.
            var value = {
                date: (new Date()).toString()

                , sender: this.user.id
                , senderKeyID: this.user.keyID

                , messageSignature: crypto.rsa.signSHA1(message, privKey)

                , encryptedMessage: crypto.aes.encryptCBC(message, sessionKey)
                , encryptedSessionKey: crypto.rsa.encrypt(sessionKey
                                                          , recipientPubKey)
            }

            var cmd = JSON.stringify({
                method: 'SEND'
                , user: this.recipient.id
                , key: key
                , value: value
            });

            util.sendPost(this.address, this.postURI, {
                protocol: MessageQueue.proto
                , cmd: cmd
                , password: this.user.password
                , pubSign: crypto.rsa.signSHA1(cmd, privKey)
            }, function postDone(err, status, data){
                if(err) { callback(err); return; }

                util.handlePostError(status, data, callback);
            });
        },

        /**
         * Send a RECEIVE command to the storage node.
         *
         * @param {String} key The key to receive messages from.
         * @param {Function} callback A function that will be called with the
         * arguments (err, message) once the request completes.
         */
        receive: function receive(key, callback) {
            var self = this;
            util.sendPost(this.address, this.postURI, {
                protocol: MessageQueue.proto
                , cmd: JSON.stringify({
                    method: 'RECEIVE'
                    , user: this.user.id
                    , password: this.user.password
                    , key: key
                })
            }, function postDone(err, status, data){
                if(err) { callback(err); return; }

                util.handlePostError(status, data, callback, function ok(){
                    // FIXME: data could be invalid JSON, check for that
                    var res = JSON.parse(data);
                    var senderPubKey =
                        keyStorage.retrievePubKey(res.senderKeyID);
                    var privKey = keyStorage.retrievePrivKey(this.user.keyID);

                    if(!crypto.rsa.verifySHA1(res.pubSign
                                              , reponse.value
                                              , senderPubKey))
                    {
                        callback(new Error('Invalid command signature'));
                    }

                    var sessionKey = crypto.rsa.decrypt(res.encryptedSessionKey,
                                                        privKey);

                    var message = crypto.aes.decryptCBC(res.encryptedMessage
                                                        , sessionKey);

                    if(!crypto.rsa.verifySHA1(res.messageSignature
                                              , message
                                              , senderPubKey))
                    {
                        callback(new Error('Invalid message signature'))
                    }

                    callback(null, {
                        date: res.date
                        , sender: res.sender
                        , message: message
                    });
                });
            });
        }
    }

    return MessageQueue;
});