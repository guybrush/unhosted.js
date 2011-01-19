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
 * This is the interface all modules claiming to implement MessageQueue
 * functionality must implement.
 */

define(['./Module', '../util'], function(Module){
    /**
     * Queue up `message` at `key`. This message will be send to `recipient`.
     *
     * @param {User} recipient The recipient of this message
     * @param {String} key The key to send to.
     * @param {String} message . The message that will be sent
     * @param {Function} callback A function that will be called with the
     * argument (err) once the request completes.
     */
    function send(recipinet, key, message, callback){ NOT_IMPLEMENTED(callback); }

    /**
     * Send a RECEIVE command to the storage node.
     *
     * @param {String} key The key to receive messages from.
     * @param {Function} callback A function that will be called with the
     * arguments (err, message) once the request completes.
     */
    function receive(key, callback) { NOT_IMPLEMENTED(callback); }

    function NOT_IMPLEMENTED(callback){
        callback(new Error('Method not implemented'));
    }


    var MessageQueueInterface = Object.create(Module);

    MessageQueueInterface.send = send;
    MessageQueueInterface.receive = receive;

    return MessageQueueInterface;
});
