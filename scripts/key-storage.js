/***
 * Module for storing public and private keys in the browser's storage.
 */

if(typeof localStorage === 'undefined') {
    throw new Error('Your browser does not support HTML5 local storage');
}

define(['./crypto'], function(crypto){
    var PubKey = crypto.rsa.PubKey;
    var PrivKey = crypto.rsa.PrivKey;

    /*
     * Because sessionStorage is likely to be stored on the hard drive all
     * private keys will be stored AES encrypted with the key stored in this
     * object. The property is the rsa keyID and the value is random the AES-CBC
     * key
     * 
     * Although javascript variables might also be swapped out to the hard drive
     * this is less likely to happen.
     */
    var sessionStorageKeys = {};
    
    function store(storage, rsaKey){
        var key = rsaKey.stringify(rsaKey);
        var keyType = storage === localStorage ? 'public' : 'private';
        var keyID = crypto.rsa.keyID(rsaKey)
        var keyPath = '/unhosted/rsaKeys/'
            + '/' + keyType + '/'
            + keyID;
        
        if(keyType === 'private') {
            var aesKey = crypto.random.bytes(16).join('');
            sessionStorageKeys[keyID] = aesKey;
            key = crypto.aes.encryptCBC(key, aesKey);
        }

        storage.setItem(keyPath, key);
        return keyID;
    }

    function retreive(storage, keyID){
        var keyType = storage === localStorage ? 'public' : 'private';
        var keyPath = '/unhosted/rsaKeys/'
            + '/' + keyType + '/'
            + crypto.rsa.keyID(rsaKey);
        
        var key = storage.getItem(key);
        
        if(typeof key === 'undefined') {
            throw new Error('Key not found ' + keyID);
        }

        key = JSON.parse(key);
        if(keyType === 'public') {
            key = new PubKey(key);
        } else {
            key = crypto.aes.decryptCBC(key, sessionStorageKeys[keyID]);
            key = new PrivKey(key);
        }

        return key;
    }

    
    // TODO: method to remove (private) key
    return {
        /**
         * Store a rsa public key in local storage. DO NOT use this for private
         * keys! localStorage is persistent.
         *
         * @param {rsa.PubKey} rsaKey The key to store.
         * @return Returns the keyID of the stored key.
         */
        storePubKey: function(rsaKey){
            return store(localStorage, rsaKey);
        },

        /**
         * Retreive a rsa public key from local storage
         * 
         * @param keyID The keyID (aka. fingerprint) of the rsaKey.
         * @return Returns the key as an instance of rsa.PubKey
         */
        retreivePubKey: function(keyID){
            return retrieve(localStorage, rsaKey);
        },

        /**
         * Store a rsa private key in session storage.
         *
         * @param {rsa.PrivKey} rsaKey The key to store.
         * @return Returns the keyID of the stored key.
         */
        storePrivKey: function(rsaKey){
            return store(sessionStorage, rsaKey);
        },

        /**
         * Retreive a rsa private key from session storage
         * 
         * @param keyID The keyID (aka. fingerprint) of the rsaKey.
         * @return Returns the key as an instance of rsa.PrivKey
         */
        retreivePrivKey: function(keyID){
            return retrive(sessionStorage, keyID);
        }
    }
});