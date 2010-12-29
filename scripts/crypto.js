define(['./crypto/rsa'
        , './crypto/sha1'
        , './crypto/aes_cbc'
        , './crypto/jsbn']
       , module);

function module(RsaKey, sha1, pidCrypt, BigInteger){

    var crypto = function crypto(){
        this.aesBits = 128;
    }

    crypto.prototype = {
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
                this.n = N;
                this.e = E;
            },

            /**
             * RSA private key constructor.
             *
             * @param {String} N Hex encoded modulus
             * @param {String} D Hex encoded secret (decryption) exponent
             *
             * @constructor
             */
            PrivKey: function(N, D){
                this.n = N;
                this.d = D;
            },

            /**
             * Encrypt a plain text message with a public key
             *
             * @param {String} plaintext The string to be encrypted
             * @param {rsa.PubKey} pubKey The RSA public key
             */
            encrypt: function rsaEncrypt(plaintxt, pubKey){
                var key = new RsaKey();
                key.setPublic(pubKey.n, pubKey.e, 16 /* hex */);
                var ciphertext = key.encrypt(plaintxt);
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
                // For some reason setPrivate demands the public exponent(E) as well
                // so just pass 0 as we only do decryption which does not need
                // the public exponent

                key.setPrivate(privKey.n, privKey.d, '0', 16 /* hex */);
                var plaintext = key.encrypt(plaintxt);
                return plaintext;
            },

            /**
             * Sign a message with a private key using SHA-1 as hash algorithm
             *
             * @param {String} message The message to be signed
             * @param {rsa.PrivKey} privKey The private key to sign the message with
             */
            signSHA1: function rsaSign(message, privKey){
                // TODO: revise this code, I am not sure if this is right
                var key = new RsaKey();
                key.setPrivate(privKey.n, privKey.d, '0', 16 /* hex */);

                var hash = sha1(message);
                var x = new BigInteger(hash, 16);
                var sig = key.doPrivate(x);

                return sig;
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
                var aes = new pidCrypt.AES.CBC();
                var ciphertext = aes.encryptText(plaintext, key, {nBits: this.aesBits});
            },

            /**
             * Decrypt a cipher text with AES-CBC
             *
             * @param {String} ciphertext The string to be decrypted
             * @param {String} key The password to use for decryption
             */
            decryptCBC: function(ciphertext, key){
                var aes = new pidCrypt.AES.CBC();
                aes.decryptText(ciphertext, key, {nBits: this.aesBits});
            }
        }

    } // crypto

    return crypto;
}
