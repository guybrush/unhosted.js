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
        var key = JSON.stringify(rsaKey);
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

    function retrieve(storage, keyID){
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
         * Retrieve a rsa public key from local storage
         * 
         * @param keyID The keyID (aka. fingerprint) of the rsaKey.
         * @return Returns the key as an instance of rsa.PubKey
         */
        retrievePubKey: function(keyID){
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
        retrievePrivKey: function(keyID){
            return retrieve(sessionStorage, keyID);
        }
    }
});
