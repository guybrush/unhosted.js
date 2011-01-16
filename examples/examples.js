require({ baseUrl: "/scripts/", waitSeconds: 2 }
        , ['crypto', 'key-storage'],
function(crypto, keyStorage){
    $(window).bind('hashchange', hash);
    if(location.hash) {
        hash();
    }
    
    function hash(){
        var example = location.hash.slice(1);
        require(['./' + example], function(ex){
            // The example will run by itself
        });
    }

    // Hardcoded rsa key
    // Usually the rsa key would be retrived on login or generated on the fly
    var n = '3e5af785629a8f35ec67f71fd0ee388f43472c1f6413467a29f0ebaf0f56bcba4245bd77e8d526d59e69ea3d50a33b7bcf7e67df22dfc662f5d8eb346bbd2bffdd0993ebae2e022f5dc75eaac09b4f7d2ec6f45d7a2a50be4ecdad4b7282221e904ee810274102e2faf4bc2f34fc4bcb1ec3b53178ef9176e5e222a398b05ddf667973331d0b3c7c36b81a365a7c428c4a95aebaaea3b8aecf34f985a293b6cd';
    var e = '10001';
    var d = '19c13eed33fdfcdadbeb51322dfcc715bd471f5d53db7647ad1d1a6bb31d3354875d00d60f30431b06945eb0b6a6c541ed411bac195e6e359fafd9ee4bf5d5bf97cf85ee59821d5aed1414f0d81f0e247b81542d43eea345d60b9f316cecf317e4fdea57f62dbdf5c974b256ef86f4b5b1ffddca750ca24de67973a32560c0bbfd19520aa8b91374cb7d8b6017a0d8ad7b6802a497faa0d1b429a19cc77e4901';
    var key = new crypto.rsa.PrivKey(n, e, d);
    // Store the key for later use
    window.keyID = keyStorage.storePrivKey(key);
    keyStorage.storePubKey({n: key.n, e: key.e});
});
