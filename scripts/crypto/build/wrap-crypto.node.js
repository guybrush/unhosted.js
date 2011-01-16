#!/usr/bin/env node

var Wrap = require('./commonjs-wrapper.node').Wrap;

var o = {
    'sha1.js': {
        '.exports': 'SHA1'
    }
    , 'jsbn.js': {
        '.exports': 'BigInteger'
    }
    , 'prng4.js': {
        '.exports': {
            'newstate': 'prng_newstate'
            , 'psize': 'rng_psize'
        }
    }
    , 'rng.js': {
        '.depends': {
            'prng': './prng4'
        }
        , '.imports': [
            'var prng_newstate = prng.newstate'
            , 'var rng_psize = prng.psize'
        ]
        , '.exports': 'SecureRandom'
    }
    , 'rsa.js': {
        '.depends': {
            'BigInteger': './jsbn'
            , 'SecureRandom': './rng'
        }
        , '.exports': 'RSAKey'
    }
    , 'rsa-sign.js': {
        '.depends': {
            'RSAKey': './rsa'
            , 'sha1': './sha1'
        }
        , '.exports': 'RSAKey'
    }
    , 'pidCrypt/pidcrypt.js': {
        '.exports': 'pidCrypt'
    }
    , 'pidCrypt/pidcrypt_util.js': {
        '.exports': 'pidCryptUtil'
    }
    , 'pidCrypt/md5.js': {
        '.exports': 'pidCrypt.MD5'
        , '.imports': [
            'var pidCrypt = {}'
        ]
    }
    , 'pidCrypt/aes_core.js': {
        '.depends': {
            'pidCryptUtil': './pidcrypt_util'
        }
        , '.imports': [
            'var pidCrypt = {}'
        ]
        , '.exports': 'pidCrypt.AES'
    }
    , 'pidCrypt/aes_cbc.js': {
        '.depends': {
            'pidCrypt': './pidcrypt'
            , 'pidCryptUtil': './pidcrypt_util'
            , 'MD5': './md5'
            , 'AES': './aes_core'
        }
        , '.imports': [
            'pidCrypt.MD5 = MD5'
            , 'pidCrypt.AES = AES'
        ]
        , '.exports': 'pidCrypt.AES.CBC'
    }
    , 'sjcl/sjcl.js': {
        '.exports': 'sjcl'
    }
};


Wrap('../original-libs', '../', o, function(err, scripts){
    if (err) throw err;
});
