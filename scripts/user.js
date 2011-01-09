define(['./crypto/sha1'], function(sha1){
    /**
     * Create a new User object.
     *
     * @constructor
     * @param alias The alias for the user id. (currently: email address)
     */
    var User = function(alias){
        this.alias = alias;
    };

    /**
     * The user's password
     */
    User.prototype.password = null;

    /**
     * The user's private key.
     */
    User.prototype.privKey = null;

    /**
     * The user's public key.
     */
    User.prototype.pubKey = null;

    /**
     * Before a User object can be used with the API it has to be initialized by
     * getting its id. Right now this just does sha1(email) but in future
     * version of UJP this migt become more sufisticated.
     */
    User.prototype.getID = function(callback){
        this.id = sha1(this.alias);
        callback(null, this.id);
    }

    return User;
});