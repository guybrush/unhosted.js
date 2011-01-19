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
 * This is the interface all modules claiming to be KeyValue compatible must
 * implement.
 *
 * This interface also provides utility functions such as setEncrypted and
 * getEncrypted that rely on the module specific set/get methods so it is
 * recommended to inherit this object.
 */

define(['./Module', '../util'], function(Module){
    /**
     * SET the value of a key-value pair.
     *
     * @param {String} key The key path to set.
     * @param {String} value The value that should be set. Symetric
     * encryption of this value is not handled by this API! You have to do
     * it yourself with crypto.aes.encryptCBC/decryptCBC
     * @param {Function} callback A function that will be called with the
     * argument (err) once the request completes.
     */
    function set(key, value, callback){ NOT_IMPLEMENTED(callback); };

    /**
     * GET the value of a key-value pair
     *
     * @param {String} key The key path to get.
     * @param {Function} callback A function that will be called with the
     * arguments (err, value [, cmdStr]) once the request completes.
     */
    function get(key, callback){ NOT_IMPLEMENTED(callback); };

    /**
     * SET a key-value pair
     *
     * The key-value pair is secured with a sessionKey that has to be delivered
     * to subscribers somehow. The key is salt'ed with the sessionKey and
     * the value is AES encrypted using the sessionKey. Thus ensuring no one
     * can access the key-value pair without the sessionKey.
     *
     * @param {String} key The key to set
     * @param {String} value The value to be set
     * @param {String} sessionKey A key that must be obtained to GET this
     * key-value pair.
     * @param {Function} callback A function that will be called with the
     * argument (err) once the request completes.
     */
    function setEncrypted(key, value, sessionKey, callback){
        if(typeof sessionKey === 'undefined'
           || typeof sessionKey === 'null'
           || sessionKey.length < crypto.aesBits / 8)
        {
            callback(new Error('Session key too weak!'));
            return;
        }

        this.set(crypto.hash(sessionKey + key)
                 , crypto.aes.encryptCBC(value, sessionKey)
                 , callback);
    };

    /**
     * GET a key-value pair
     *
     * @param {String} key The key to get
     * @param {String} sessionKey The key to use to find and decrypt the
     * key-value pair
     * @param {Function} callback A function that will be called with the
     * arguments (err, value [, cmdStr]) once the request completes.
     */
    function getEncrypted(key, sessionKey, callback){
        this.get(crypto.hash(sessionKey + key), function(err, value, cmdStr){
            if(err) { callback(err); return; }

            var value = crypto.aes.decryptCBC(value, sessionKey);
            callback(null, value, cmdStr);
        });
    }

    function NOT_IMPLEMENTED(callback){
        callback(new Error('Method not implemented'));
    }


    var KeyValueInterface = Object.create(Module);

    KeyValueInterface.get = get;
    KeyValueInterface.getEncrypted = getEncrypted;
    KeyValueInterface.set = set;
    KeyValueInterface.setEncrypted = setEncrypted;

    return KeyValueInterface;
});