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

define(['./crypto/rsa-sign'
        , './crypto/sha1'
        , './crypto/aes_cbc'
        , './crypto/jsbn'
        , './crypto/rng']
       , module);

function module(RsaKey, sha1, AES_CBC, BigInteger, Random){
    var crypto = {
        // options
        aesBits: 128,

        // methods
        rsa: {
            /**
             * RSA public key constructor.
             *
             * @param {String} N Hex encoded modulus
             * @param {String} E Hex encoded public exponent
             *
             * @constructor
             */
            PubKey: function(N, E){
                if(typeof N === 'object' && typeof E === 'undefined') {
                    this.n = N.n;
                    this.e = N.e;
                } else {
                    this.n = N;
                    this.e = E;
                }
            },

            /**
             * RSA private key constructor.
             *
             * @param {String} N Hex encoded modulus
             * @param {String} E Hex encoded public exponent
             * @param {String} D Hex encoded secret (decryption) exponent
             *
             * @constructor
             */
            PrivKey: function(N, E, D){
                if(typeof N === 'object'
                   && typeof E === 'undefined'
                   && typeof D === 'undefined')
                {
                    this.n = N.n;
                    this.e = N.e;
                    this.d = N.d;
                } else {
                    this.e = E;
                    this.n = N;
                    this.d = D;
                }
            },

            /**
             * Get a fingerprint for a rsa key (public or private)
             *
             * @param {rsa.PubKey or rsa.PrivKey} key The key fingerprint is to
             * be made of
             * @return Returns the sha1 hash of the key public exponent (e)
             * concatenated with the key modulus (n)
             */
            keyID: function keyId(key){
                return sha1(key.e + key.n);
            },

            /**
             * Encrypt a plain text message with a public key
             *
             * @param {String} plaintext The string to be encrypted
             * @param {rsa.PubKey} pubKey The RSA public key
             */
            encrypt: function rsaEncrypt(plaintext, pubKey){
                var key = new RsaKey();
                key.setPublic(pubKey.n, pubKey.e, 16 /* hex */);
                var ciphertext = key.encrypt(plaintext);
                return ciphertext;
            },

            /**
             * Decrypt a cipher text with a private key
             *
             * @param {String} ciphertext The string to be decrypted
             * @param {rsa.PrivKey} privKey The RSA private key
             */
            decrypt: function rsaDecrypt(ciphertext, privKey){
                var key = new RsaKey();
                key.setPrivate(privKey.n, privKey.e, privKey.d, 16 /* hex */);

                var plaintext = key.decrypt(ciphertext);
                return plaintext;
            },

            /**
             * Sign a message with a private key using SHA-1 as hash algorithm
             *
             * @param {String} message The message to be signed
             * @param {rsa.PrivKey} privKey The private key to sign the message
             * with
             */
            signSHA1: function rsaSign(message, privKey){
                var key = new RsaKey();
                key.setPrivate(privKey.n, privKey.e, privKey.d, 16 /* hex */);

                return key.signStringWithSHA1(message);
            },

            /**
             * Verify the signature of a message using SHA-1 as hash algorithm
             *
             * @param {String} signature The signature to be checked
             * @param {String} message The message to be validated
             * @param {rsa.PubKey} pubKey The RSA public key to use for
             *        verification
             */
            verifySHA1: function rsaVerify(signature, message, pubKey){
                var key = new RsaKey();
                key.setPublic(pubKey.n, pubKey.e, 16 /* hex */);

                return key.verifyHexSignatureForMessage(signature, message);
            }
        }, // crypto.rsa

        aes: {
            /**
             * Encrypt a plain text with AES-CBC
             *
             * @param {String} plaintext The string to be encrypted
             * @param {String} key The password to encrypt the string
             */
            encryptCBC: function(plaintext, key){
                var aes = new AES_CBC();
                var ciphertext = aes.encryptText(plaintext, key
                                                 , {nBits: crypto.aesBits});
                return ciphertext;
            },

            /**
             * Decrypt a cipher text with AES-CBC
             *
             * @param {String} ciphertext The string to be decrypted
             * @param {String} key The password to use for decryption
             */
            decryptCBC: function(ciphertext, key){
                var aes = new AES_CBC();
                var plaintext = aes.decryptText(ciphertext, key
                                                , {nBits: crypto.aesBits});

                return plaintext;
            }
        },

        random: {
            // !!! TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO !!!
            // Proper Cryptographically secure rng (from sjcl)
            bytes: function(n) {
                var bytes = new Array(n);
                (new Random()).nextBytes(bytes);
                return bytes;
            }
        }

    } // crypto

    return crypto;
}
