define(['./crypto/rsa'
        , './crypto/sha1'
        , './crypto/aes_cbc'
        , './crypto/jsbn']
       , module);

function module(RsaKey, sha1, pidCrypt, BigInteger){
    
    var crypto = function crypto(){
        
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

            signSHA1: function rsaSign(message, privKey){
                var key = new RsaKey();
                key.setPrivate(privKey.n, privKey.d, '0', 16 /* hex */);

                var hash = sha1(message);
                var x = new BigInteger(hash, 16);
                var sig = key.doPrivate(x);

                return sig;
            }
        }
    }
    
    return crypto;
}
