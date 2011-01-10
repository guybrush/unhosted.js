define(['./crypto/sha1'], function(sha1){
    /**
     * Create a new User object.
     *
     * @constructor
     * @param alias The alias for the user id. The alias is a string that points
     * to a userID. A userID is a globally uniqie identifyer that directly links
     * to a user. The alias is, well, a alias to this userID.
     */
    var User = function(alias){
        this.alias = alias;
    };

    /**
     * The user's password.
     *
     * Needed for SET and RECEIVE operations.
     */
    User.prototype.password = null;

    /**
     * The fingerprint of the user's key. The fingerprints of public and private
     * key are the same. Thus this identifies public and private key at the same
     * time. The acctual keys can be retrived using the key-stroage module.
     */
    User.prototype.keyID = null;

    /**
     * Before a User object can be used with the API it has to be initialized by
     * getting its id. Right now this just does sha1(alias) but in future
     * version this migt become more sufisticated.
     */
    User.prototype.getID = function(callback){
        this.id = sha1(this.alias);
        callback(null, this.id);
    }

    return User;
});