module('set');
var keys =
  //{ "r":"7db31"
  //, "c":"localhost:8040"
  //, "n":"7eec3efb6ba70112dc2bf82938302fcebbb777921c1ca0aa2217591bf0822518d66ccd616859026ccd90ff1493e471ad348bc5fba96c0ff493b91a6cf81ebf37"
  //, "s":"b1f0a643a44cab9c9b0a979029c02861"
  //, "w":"0249e"
  //, "d":"77321097f76a986488e6b620a7c7012eca35ab9248da4dbc5955c9f6a630e2fa872a0f871f6d7fd893b1df3b53d6abee2e09f40f5873ccd7b68d5bbf15e92759"
  //};
  

	{ "r":"7db31"
	, "c":"10.0.0.160:8040"
	, "n":"c0d10744c4b84eb5de80695999b8d9be8b61a6856ac38ad7bba3c17cc96aac621c6bc0d8ab407dfb09fdfdf643e0b0e5bc0ecf305fe661ead65066ae1b1eba01"
	, "s":"d416f1ff335916c7ef40ecf8a6b475ab"
	, "w":"0249e"                                                            
	, "d":"457b0d637a7fefdd1990ac65dd3eff37ea8205bf8df968ced48eedea49aa66f3527fa60ffa8b5cd00561d33ca43e6c63b7f9d40a266113a880fe72975ca9ac1"
	};

asyncTest('simple set, get', function() {
    unhosted.importPub(keys, 'nick');
    equals(unhosted.set('nick', 'key', 'val', function() {}), true, 'null');
    unhosted.set('nick', 'key', 'val', function(err, res) {
        unhosted.get('nick', 'key', function(err, res) {
            equals('key', res, 'We expected `res` to be "key".');
            start();
        });                                   
    });
});