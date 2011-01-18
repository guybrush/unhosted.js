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

define(['./crypto'], function(crypto){
    /**
     * Create a new User object.
     *
     * @constructor
     * @param alias The alias for the user id. The alias is a string that points
     * to a userID. A userID is a globally unique identifier that directly links
     * to a user. The alias is, well, a alias to this userID.
     */
    var User = function(alias){
        this.alias = alias;
    };

    /**
     * The user's password.
     */
    User.prototype.password = null;

    /**
     * The fingerprint of the user's key. The fingerprints of public and private
     * key are the same. Thus this identifies public and private key at the same
     * time. The actual keys can be retrieved using the key-storage module.
     */
    User.prototype.keyID = null;

    /**
     * Hash map of the servers that this user has available.
     * In the form: { 'KeyValue': 'example.com', 'WebDAV':
     * 'https://example.net/dav/user' }
     */
    User.prototype.servers = {}

    /**
     * Before a User object can be used with the API it has to be initialized by
     * getting its id. Right now this just does sha1(alias) but in future
     * version this might become more sophisticated.
     */
    User.prototype.getID = function(callback){
        this.id = crypto.hash(this.alias);
        callback(null, this.id);
    }

    return User;
});