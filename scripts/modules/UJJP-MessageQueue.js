/**
 * UJJP implementation of the MessageQueue functionality
 */

define(['../interfaces/MessageQueue'
        , '../modules'
        , '../util'
        , '../key-storage'
        , '../crypto'],
function(MessageQueueInterface, modules, util, keyStorage, crypto) {
    modules.register('MessageQueue', 0, 'modules/UJJP-MessageQueue');

    var UJJPMessageQueue = Object.create(MessageQueueInterface);

    /**
     * The UJJP protocol version this module supports
     */
    UJJPMessageQueue.protocol = 'UJJP/0.2';
    var protocol = UJJPMessageQueue.protocol;

    /**
     * Default post URI
     */
    UJJPMessageQueue.postURI = '/unhosted/cloudside/unhosted.php',

    UJJPMessageQueue.send = function send(recipinet, key, message, callback){
        var recipientPubKey = keyStorage.retrievePubKey(recipient.keyID);
        var privKey = keyStorage.retrievePrivKey(this.user.keyID);
        var sessionKey = crypto.sessionKey();

        // TESTME: do we need a checksum of the message?
        // what if somebody tries to decrypt a message that was not
        // encrypted with his rsa key? Will decryption succeed? If that is
        // the case a hash of the message should be included to be sure the
        // message was actually for the user trying to decrypt it.
        var value = {
            // Including the date is never a bad idea
            date: (new Date()).toString()

            // Sender information
            , sender: this.user.id
            , senderKeyID: this.user.keyID

            // The message
            , messageSignature: crypto.rsa.signSHA1(message, privKey)
            , encryptedMessage: crypto.aes.encryptCBC(message, sessionKey)
            , encryptedSessionKey: crypto.rsa.encrypt(sessionKey
                                                      , recipientPubKey)
        }

        var cmd = JSON.stringify({
            method: 'SEND'
            , user: this.recipient.id
            , keyHash: key
            , value: value
        });

        util.UJJP.sendPost(this.address, this.postURI, {
            protocol: MessageQueue.proto
            , command: cmd
            , pubSign: crypto.rsa.signSHA1(cmd, privKey)
        }, function postDone(err, status, data){
            if(err) { callback(err); return; }

            util.UJJP.handlePostError(status, data, callback);
        });
    };

    /**
     * Send a RECEIVE command to the storage node.
     *
     * @param {String} key The key to receive messages from.
     * @param {Function} callback A function that will be called with the
     * arguments (err, message) once the request completes.
     */
    UJJPMessageQueue.receive = function receive(key, callback) {
        var self = this;

        var cmd = JSON.stringify({
            method: 'RECEIVE'
            , user: this.user.id
            , keyHash: key
        });

        util.UJJP.sendPost(this.address, this.postURI, {
            protocol: MessageQueue.proto
            , password: this.user.password
            , command: cmd
        }, function postDone(err, status, data){
            if(err) { callback(err); return; }

            util.UJJP.handlePostError(status, data, callback, function ok(){
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
                    , senderKeyID: res.senderKeyID
                    , message: message
                });
            });
        });
    }

    return UJJPMessageQueue;
});