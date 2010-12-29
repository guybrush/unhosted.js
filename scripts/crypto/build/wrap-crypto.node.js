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
    , 'pidCrypt/pidcrypt.js': {
        '.exports': 'pidCrypt'
    }
    , 'pidCrypt/pidcrypt_util.js': {
        '.exports': 'pidCryptUtil'
    }
    , 'pidCrypt/aes_core.js': {
        '.depends': {
            'pidCrypt': './pidcrypt'
            , 'pidCryptUtil': './pidcrypt_util'
        }
        , '.exports': 'pidCrypt'
    }
    , 'pidCrypt/aes_cbc.js': {
        '.depends': {
            // this already includes the core pidCrypt stuff
            'pidCrypt': './aes_core'
            , 'pidCryptUtil': './pidcrypt_util'
        }
        , '.exports': 'pidCrypt'
    }
};


Wrap('../original-libs', '../', o, function(err, scripts){
    if (err) throw err;
});
