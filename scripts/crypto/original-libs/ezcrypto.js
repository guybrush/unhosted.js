define(['rsa', 'sha1'], function(){
    var ezcrypto = {};

    // Basic/simple API
    ezcrypto.generateKey = function(password) {
        var RSAkeys = RSAGenerate(ezcrypto.randomNumber());
        var key = {'public': RSAkeys.n, 'private': RSAkeys.d};
        if (password) {
            key['encryptedPassword'] = ezcrypto.encryptRSA(password, key.public);
        }
        return key;
    }
    
    function encrypt(plaintext, key) {
        var password = ezcrypto.getPassword(key);
        return ezcrypto.encryptAES(plaintext, password)
    }
    
    function decrypt(ciphertext, key) {
        var password = ezcrypto.getPassword(key);
        return ezcrypto.decryptAES(plaintext, password);
    }
    
    // Core encryption functions
    function encryptRSA(plaintext, publicKey) {
        return RSAEncrypt(message, publicKey);
    }
    
    function decryptRSA(ciphertext, publicKey, privateKey) {
        return RSADecrypt(message, publicKey, privateKey);
    }
    
    ezcrypto.encryptAES = function(message, password){
        var aes = new pidCrypt.AES.CBC();
        var encryptedMessage = aes.encryptText(message, password, {nBits: 128});
        return encryptedMessage;
    }
    
    ezcrypto.decryptAES = function(message, password){
        var aes = new pidCrypt.AES.CBC();
        var plain = aes.decryptText(message, password, {nBits: 128});
        return plain;
    }
    
    // Utility functions
    ezcrypto.getPassword = function(key) {
        var password = key.public;
        if ("encryptedPassword" in key) password = ezcrypto.decryptRSA(key['encryptedPassword'], key.public, key.private);
        return password;
    }
    
    ezcrypto.randomNumber = function() {
        return new SecureRandom();
    }
    
    ezcrypto.loadScripts = function(scripts) {
        for (var i=0; i < scripts.length; i++) {
            document.write('<script src="'+scripts[i]+'"><\/script>')
        };
    };

    ezcrypto.loadScripts([
        "vendor/pidcrypt.js",
        "vendor/pidcrypt_util.js",
        "vendor/jsbn.js",
        "vendor/md5.js",
        "vendor/aes_core.js",
        "vendor/aes_cbc.js",
        "vendor/rng.js",
        "vendor/prng4.js",
        "vendor/rsa.js",
        "vendor/unhosted_encryption.js"
    ]);
});
