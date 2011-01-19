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

define(['./crypto', './util'], function(crypto){
    var User = {};

    /**
     * Alias to the user UID
     *
     * In the general case this can be a email address or a JID. Identifying a
     * user by a UID has the advantage of the UID being portable. Multible
     * aliases can point to the same UID. Thus a user can change his email
     * address without losing his identity.
     *
     * Right now the 'UID' is just a hash of the alias but in the future this
     * might change.
     */
    User.alias = null;

    /**
     * The fingerprint of the user's key. The fingerprints of public and private
     * key are the same. Thus this identifies public and private key at the same
     * time. The actual keys can be retrieved using the key-storage module.
     */
    User.keyID = null;

    /**
     * The server the user has registered.
     * Something like the following, highly depends on the module.
     *
     *     { 'KeyValue':
     *       { address: 'example.org'
     *       , user: 'dxld'
     *       , password: '1234me'
     *       }
     *     }
     */
    User.servers = {};

    /**
     * Fetch a user's UID
     *
     * Right now this just does sha1(alias) but in future version this might
     * become more sophisticated.
     */
    User.getID = function(callback){
        this.id = crypto.hash(this.alias);
        callback(null, this.id);
    }

    User.getAuth = function(protocol){
        var self = this;
        var p = protocol.split(';');
        var password = this.servers[protocol] &&
            this.servers[protocol].password;
        if(password) return;

        p.forEach(function(s){
            password = password || self.servers[s] && self.servers[s].password
        });

        return password;
    }

    function createUser(alias) {
        var u = Object.create(User);
        u.alias = alias;
        return u;
    }

    createUser.User = User;

    return createUser;
});