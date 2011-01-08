/*
 * Unhosted JS library.
 *  Handles comms with unhosted storage node for unhosted web apps.
 * Copyright (C) 2010 Michiel de Jong michiel@unhosted.org
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

define(['./crypto'
        , './key-storage'
        , './util'
        , './methods'], unhostedModule);

function unhostedModule(crypto, keyStorage, URL, util, methods){
    var JSONtoCGI = util.JSONtoCGI;
    var sendPost = util.sendPost;

    var options = {
        postURI: '/unhosted/cloudside/unhosted.php'
        , ajaxFailure: function(){}
    }

    var Unhosted = function(userID, nodeAddress){
        // TODO better checks
        if(!nodeAddress) {
            throw new Error('Invalid node address');
        }

        if (typeof userID === 'undefined' || !userID.match(/[\S+@\S+]/)) {
            throw new Error('Invalid userID');
        }

        this.userID = userID;
        this.address = nodeAddress;
        this.postURI = options.postURI;
    }

    Unhosted.prototype = methods;

    return Unhosted;
} // function unhostedModule(..
