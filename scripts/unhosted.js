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

var u = function() {
    //private:
    var that = this;
    var keys = {}; // each one should contain fields r,c,n[,s[,d]] (r,c in ASCII; n,s,d in HEX)


    var makePubSign = function(nick, cmd) {  // this function based on the rsa.js script included in Tom Wu's jsbn and rsa-sign.js by [TODO: look up name of wikitl.jp(?)]
        var sHashHex = sha1.hex(cmd);          // this uses sha1.js to generate a sha1 hash of the command
        var biSign = RSASign(sHashHex, nick);  // sign it using the function above
        var hexSign = biSign.toString(16);     // turn into HEX representation for easy displaying, posting, etcetera. Changing this to base64 would be 33% shorter; worth it?
        return hexSign;
    }


    var checkPubSign = function(cmd, PubSign, nick_n) {//check a signature. based on rsa-sign.js. uses Tom Wu's jsbn library.
        var n = new BigInteger();   n.fromString(nick_n, 16);
        var x = new BigInteger(PubSign.replace(/[ \n]+/g, ""), 16);
        return (x.modPowInt(parseInt("10001", 16), n).toString(16).replace(/^1f+00/, '') == sha1.hex(cmd));
    }

    var checkND = function(n, d) {
        return true;
    }

    var addN = function(nick, locationN) {
        var n = that.rawGet(nick, locationN);
        if (n==null) return false;
        n = n.cmd.value; // unpack UJ/0.1 SET command
        if (!checkND(n, keys[nick].d)) return false; // checks plaintext, PubSign-less n against d
        keys[nick].n = n;
        return true;
    }

    var addS = function(nick, locationS) {
        var ret = that.rawGet(nick, locationS); // decrypts with d instead of with s
        if (ret==null) {
            return false;
        }
        var cmdStr = JSON.stringify(ret.cmd).replace("+", "%2B");
        var sig = ret.PubSign;
        if (checkPubSign(cmdStr, sig, keys[nick].n) == false) {
            return false;
        }
        var ses = RSADecrypt(ret.cmd.ses, nick); // decrypts with d instead of with s
        var s = byteArrayToString(rijndaelDecrypt(hexToByteArray(ret.cmd.value), hexToByteArray(ses), 'ECB'));
        if (s == null) {
            return false;
        }
        keys[nick].s = s;
        return true;
    }

    var makeStar = function(signerNick, signeeNick) { // creates a star-object for signing
        return { "signer":{"r":keys[signerNick].r, "c":keys[signerNick].c, "n":keys[signerNick].n}
                 , "signee":{"r":keys[signeeNick].r, "c":keys[signeeNick].c, "n":keys[signeeNick].n}
               };
    }

    var checkNick=function(nick) {
        if (typeof keys[nick] == 'undefined') {
            parts=nick.split('@', 2);
            if (parts.length != 2) {
                console.error('attempt to use undefined key nick: '+nick+'. Did you forget to log in?');
            }
            that.importSubN({"r":parts[0],"c":parts[1]},nick,".n");
        }
    }
    var checkFields = function(arr, fieldNames) {
        for (field in fieldNames) {
            if (typeof arr[fieldNames[field]] == 'undefined') {
                console.error('field '+fieldNames[field]+' missing from key: '+JSON.stringify(arr));
                return;
            }
        }
    }
    //public:
    this.importPub = function(writeCaps, nick) {// import a (pub) key to the keys[] variable
        checkFields(writeCaps, ['r', 'c', 'n', 'd']);
        keys[nick]=writeCaps; // this should contain r,c,n,d.
    }
    this.importPubNS = function(writeCaps, nick, locationN, locationS) {
        checkFields(writeCaps, ['r', 'c', 'w', 'd']);
        keys[nick]=writeCaps; // this should contain r,c,w,d.
        return (addN(nick, locationN)==true && addS(nick, locationS)==true);
    }
    this.importSub = function(readCaps, nick) { // import a (sub) key to the keys[] variable
        checkFields(readCaps, ['r', 'c']);
        keys[nick]=readCaps;
    }
    this.importSubN = function(readCaps, nick, locationN) { // import a (sub) key to the keys[] variable
        checkFields(readCaps, ['r', 'c']);
        keys[nick]=readCaps; // this should contain r,c.
        return (addN(nick, locationN)==true);
    }
    this.rawGet = function(nick, keyPath) { // used for starskey and by wappbook login bootstrap to retrieve key.n and key.s
        checkNick(nick);
        var cmd = JSON.stringify({"method":"GET", "chan":keys[nick].r, "keyPath":keyPath});
        sendPost( "protocol=UJ/0.1&cmd="+cmd, keys[nick].c, function(err, res) {
            if (res == "") {
                callback('error');
            }
            try {
                callback(null, JSON.parse(res));
            } catch(e) {
                callback('Non-JSON response to GET command:'+res);
            }
        });
    }

    this.get = function(nick, keyPath) { // execute a UJ/0.1 GET command
        checkNick(nick);
        var ret = that.rawGet(nick, keyPath);
        if (ret==null) {
            return null;
        }
        var cmdStr = JSON.stringify(ret.cmd).replace("+", "%2B");
        var sig = ret.PubSign;
        if (checkPubSign(cmdStr, sig, keys[nick].n) == true) {
            return JSON.parse(byteArrayToString(rijndaelDecrypt(hexToByteArray(ret.cmd.value), hexToByteArray(keys[nick].s), 'ECB')));
        } else {
            return "ERROR - PubSign "+sig+" does not correctly sign "+cmdStr+" for key "+keys[nick].n;
        }
    }

    this.rawSet = function(nick, keyPath, value, useN, callback) {
        checkNick(nick);
        var cmd, PubSign, ret;
        if (useN) {
            // this is two-step encryption. first we Rijndael-encrypt value
            // symmetrically (with the single-use var seskey). The result goes
            // into 'value' in the cmd.
            var bnSeskey = new BigInteger(128,1,rng); // rijndael function we use uses a 128-bit key
            var seskey = bnSeskey.toString(16);
            var encr = byteArrayToHex(rijndaelEncrypt(value, hexToByteArray(seskey), 'ECB'));
            // Then, we RSA-encrypt var seskey asymmetrically with nick's public
            // RSA.n, and that encrypted session key goes into 'ses' in the cmd.
            // See also this.receive.
            var encrSes = RSAEncrypt(seskey, nick);
            cmd = JSON.stringify( { "method":"SET", "chan":keys[nick].r
                                  , "keyPath":keyPath, "value":encr, "ses":encrSes
                                  });
            PubSign = makePubSign(nick, cmd);
        } else {
            cmd = JSON.stringify( { "method":"SET", "chan":keys[nick].r
                                  , "keyPath":keyPath, "value":value
                                  });
            PubSign = '';
        }
        sendPost( 'protocol=UJ/0.1&cmd='+cmd+'&PubSign='+PubSign+'&WriteCaps='+keys[nick].w
                , keys[nick].c
                , function(err, res) {
            if (err) throw err;
            else callback && callback(null, res)
        });
        if (ret != '"OK"') {
            console.error(ret);
            return null;
        }
        callback && callback(null, ret);
    }
    this.set = function(nick, keyPath, value, callback) { // execute a UJ/0.1 SET command
        checkNick(nick);
        var encr = byteArrayToHex(rijndaelEncrypt(JSON.stringify(value), hexToByteArray(keys[nick].s), 'ECB'));
        var cmd = JSON.stringify({"method":"SET", "chan":keys[nick].r, "keyPath":keyPath, "value":encr});
        var PubSign = makePubSign(nick, cmd);
        sendPost( 'protocol=UJ/0.1&cmd='+cmd+'&PubSign='+PubSign+'&WriteCaps='+keys[nick].w
                , keys[nick].c
                , function(err, res) {
            if (err) throw err;
            else callback && callback(null, res)
        });
        if (ret != '"OK"') {
            callback && callback('not OK', res)
            return null;
        }
        callback && callback(null, res);
    }
    this.send = function(fromNick, toNick, keyPath, value, callback) { // execute a UJ/0.1 SEND command
        checkNick(fromNick);
        checkNick(toNick);
        // this is two-step encryption. first we Rijndael-encrypt value symmetrically (with the single-use var seskey). The result goes into 'value' in the cmd.
        var bnSeskey = new BigInteger(128,1,rng); // rijndael function we use uses a 128-bit key
        var seskey = bnSeskey.toString(16);
        var encr = byteArrayToHex(rijndaelEncrypt(JSON.stringify(value), hexToByteArray(seskey), 'ECB'));
        // Then, we RSA-encrypt var seskey asymmetrically with toNick's public RSA.n, and that encrypted session key goes into 'ses' in the cmd. See also this.receive.
        var encrSes = RSAEncrypt(seskey, toNick);
        var cmd = JSON.stringify({"method":"SEND", "chan":keys[toNick].r, "keyPath":keyPath, "value":encr, "ses":encrSes,
                                  "SenderSub":{"r":keys[fromNick].r, "c":keys[fromNick].c, "n":keys[fromNick].n}});
        var PubSign = makePubSign(fromNick, cmd);
        sendPost( "protocol=UJ/0.1&cmd="+cmd+"&PubSign="+PubSign
                , keys[toNick].c
                , function(err, res) {
            if (err) throw err;
            else callback && callback(null, res);
        });
        if (ret != '"OK"') {
            callback && callback('not OK', res);
            return null;
        }
        callback && callback(null, res);
    }

    this.receive = function(nick, keyPath, andDelete) { // execute a UJ/0.1 GET command
        checkNick(nick);
        if (andDelete) {
            andDeleteBool = true;
        } else {
            andDeleteBool = false;
        }
        var cmd = JSON.stringify({"method":"RECEIVE", "chan":keys[nick].r, "keyPath":keyPath, "delete":andDeleteBool});
        sendPost( "protocol=UJ/0.1&cmd="+cmd+'&WriteCaps='+keys[nick].w
                , keys[nick].c
                , function(err, res) {
            if (err) throw err;
            else callback && callback(null, retJson);
            var ret, cmdStr, sig, seskey, decrVal;
            try {
                ret = JSON.parse(retJson);
            } catch (e) {
                console.error('Non-JSON response to RECEIVE command:'+ret);
                ret = null;
            }
            if (ret==null) {
                callback('ret == null')
                return null;
            }
            var res = [];
            for (msg in ret) {
                cmdStr = JSON.stringify(ret[msg].cmd).replace("+", "%2B");
                sig = ret[msg].PubSign; // careful: this PubSign refers to the sender's n (cmd.SenderSub.n), not the receiver's one (keys[nick].n)!
                if (checkPubSign(cmdStr, sig, ret[msg].cmd.SenderSub.n) == true) {
                    try {
                        // now we first need to RSA-decrypt the session key that will let us Rijdael-decrypt the actual value:
                        seskey = RSADecrypt(ret[msg].cmd.ses, nick);
                        if (seskey === null) {
                            res.push({"body":'ERROR - seskey '+ret[msg].cmd.ses+' does not correctly decrypt, or have no private key (key.d) of '+nick,
                                      "SenderSub":{"r":"not valid", "c":"not valid", "n":"not valid"}});
                        } else {
                            decrVal = byteArrayToString(rijndaelDecrypt(hexToByteArray(ret[msg].cmd.value), hexToByteArray(seskey), 'ECB'));
                            res.push({"body":JSON.parse(decrVal), "SenderSub":ret[msg].cmd.SenderSub});
                        }
                    } catch (e) {
                        res.push({"body":'ERROR - could not decrypt message.',
                                  "SenderSub":{"r":"not valid", "c":"not valid", "n":"not valid"}});
                    }
                } else {
                    res.push({"body":'ERROR - PubSign '+sig+' does not correctly sign '+cmdStr+' for key '+ret[msg].cmd.SenderSub.n,
                              "SenderSub":{"r":"not valid", "c":"not valid", "n":"not valid"}});
                }
            }
            // return res; // have to find the proper way of doing foo[] = bar;
            callback && callback(ret);
        });
    }
    this.makeStarSign = function(signerNick, signeeNick) { // creates a star-object, signs it, and returns the signature
        checkNick(signerNick);
        checkNick(signeeNick);
        var star = makeStar(signerNick, signeeNick);
        var StarSign = makePubSign(signerNick, star);
        return StarSign;
    }
    this.checkStarSign = function(signerNick, signeeNick, StarSign) { // creates a star-object and check the signature against it with the signer's n, or his d if available
        checkNick(signerNick);
        checkNick(signeeNick);
        var star = makeStar(signerNick, signeeNick);
        var check = checkPubSign(star, StarSign, keys[signerNick].n);
        return check;
    }

}
// note: following information is outdated! (now some of them are async)
//
//public functions:
//
//  this.importPub = function(writeCaps, nick) {//import a (pub) key to the keys[] variable
//  this.importPubNS = function(writeCaps, nick, locationN, locationS) {
//  this.importSub = function(readCaps, nick) {//import a (sub) key to the keys[] variable

//  this.get = function(nick, keyPath) {//execute a UJ/0.1 GET command
//  this.set = function(nick, keyPath, value) {//execute a UJ/0.1 SET command

//  this.send = function(fromNick, toNick, keyPath, value) {//execute a UJ/0.1 SEND command
//  this.receive = function(nick, keyPath) {//execute a UJ/0.1 GET command

//  this.rawGet = function(nick, keyPath) {//used by wappbook login bootstrap to retrieve key.n and key.s
//  this.rawSet = function(nick, keyPath, value, useN) {

//  this.makeStar = function(signerNick, signeeNick) {//creates a star-object for signing
//  this.makeStarSign = function(signerNick, signeeNick) {//creates a star-object, signs it, and returns the signature
//  this.checkStarSign = function(signerNick, signeeNick, StarSign) {//creates a star-object and check the signature against it with the signer's n, or his d if available

