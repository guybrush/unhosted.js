define(['./sjcl', './jsbn'], function(sjcl, BigInteger){
    sjcl.random.setDefaultParanoia(10);
    sjcl.random.startCollectors();

    var seeded = false;
    sjcl.random.addEventListener('seeded', function(){
        seeded = true;
    });
    
    /**
     * Generate RSA key with async callbacks
     *
     * @param {Number} B The number of bits the RSA key should have
     * @param {String} E The hex encoded public exponent to use  (usually E: 0x10001)
     * @param {Function} callback_progress This function will get called at
     * every step in the key generation with the first argument indicating the current
     * step ['i' // init
     *       , 'p' // generating 'p'
     *       , 'q' // generating 'q'
     *       , 'done' // done]
     * and the second argument indicating the number of loops this step has
     * already done.
     *
     * @note This function will wait for sjcl.random to be fully seeded, so a
     * message should be displayed instructing the user to generate randomness
     * by moving the mouse.
     */
    function RSAGenerateAsync(B,E, callback_progress, callback) {
        var qs = B>>1;
        var e = new BigInteger(E,16);
        
        /* Wait for sjcl.random to be fully seeded */
        if(!seeded){
            sjcl.random.addEventListener('seeded', function(){
                gen();
            });
        } else {
            gen();
        }

        function gen(){
            callback_progress('i');
            function genP(callback){
                var p = null;

                function doGenP(){
                    callback_progress('p');
                    p = randomBN(B - qs);
                    if(p.subtract(BigInteger.ONE).gcd(e).compareTo(BigInteger.ONE) == 0
                       && p.isProbablePrime(10))
                    {
                        callback(p);
                    } else {
                        setTimeout(doGenP, 0);
                    }
                }
                doGenP();
            }

            function genQ(callback){
                var q = null;

                function doGenQ(){
                    callback_progress('q');
                    q = randomBN(qs);
                    if(q.subtract(BigInteger.ONE).gcd(e).compareTo(BigInteger.ONE) == 0
                       && q.isProbablePrime(10))
                    {
                        callback(q);
                    } else {
                        setTimeout(doGenQ, 0);
                    }
                }
                doGenQ();
            }

            genP(function(p){
                genQ(function(q){
                    if(p.compareTo(q) <= 0) {
                        var t = p;
                        p = q;
                        q = t;
                    }
                    var p1 = p.subtract(BigInteger.ONE);
                    var q1 = q.subtract(BigInteger.ONE);
                    var phi = p1.multiply(q1);
                    if(phi.gcd(e).compareTo(BigInteger.ONE) == 0) {
                        var n = p.multiply(q);
                        var d = e.modInverse(phi);
                        var dmp1 = d.mod(p1);
                        var dmq1 = d.mod(q1);
                        var coeff = q.modInverse(p);

                        callback_progress('done');
                        callback({ e: e
                                   , n: n
                                   , d: d
                                 });
                    } else {
                        setTimeout(gen, 1);
                    }
                });
            });
        }
    }

    function randomBN(a){
        var length = (a>>3)+1;
        var t = a&7;
        
        var x = sjcl.random.randomWords(length);
        
        if(t > 0) {
            x[0] &= ((1<<t)-1);
        } else {
            x[0] = 0;
        }
        
        var bn = new BigInteger();
        bn.fromString(x, 256 /*< byte array */);
        return bn;
    }
    
    return RSAGenerateAsync;
});
