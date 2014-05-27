var fs = require('fs');
var openpgp = require('openpgp');
var crypto = require('crypto');


module.exports = function User() {
    this.sessionId = 0;
    this.authenticated = 0;
    this.publicKey = 0;
    this.privateKey = 0;
    this.newUser = 1;
    this.missing = 0;

    this.createSessionId = function() {
        this.clear();
        this.sessionId = crypto.randomBytes(256).toString("Base64");
        return this.sessionId;

    };

    this.clear = function() {
        this.sessionId = 0;
        this.authenticated = 0;
    }
    this.authenticate = function(password) {
        if (this.privateKey.decrypt(password)) {
            this.authenticated = 1;
        }
    };

    this.createKeys = function(name, lname, password) {
        console.log("creating keys ... please wait.");
        console.log("userId:" + name + " " + lname);
        console.log("password:" + password);
        var key = openpgp.generateKeyPair({
            numBits: 4096,
            userId: (name + " " + lname),
            passphrase: password
        });

        console.log("created keys.");

        fs.writeFileSync('../data/keys/myPublicKey.key', key.publicKeyArmored, {
            encoding: "UTF-8"
        });
        fs.writeFileSync('../data/keys/myPrivateKey.key', key.privateKeyArmored, {
            encoding: "UTF-8"
        });
        this.publicKey = openpgp.key.readArmored(key.publicKeyArmored).keys[0];
        this.privateKey = openpgp.key.readArmored(key.privateKeyArmored).keys[0];
        this.newUser = 0;
        return;
    };

    var armored;
    try {

        armored = fs.readFileSync('../data/keys/myPublicKey.key', {
            encoding: "UTF-8"
        });
        this.publicKey = openpgp.key.readArmored(armored).keys[0];
    } catch (e) {

        if (e.code === 'ENOENT') {
            this.publicKey = 0;
        } else {
            throw (e);
        }
    }

    try {

        armored = fs.readFileSync('../data/keys/myPrivateKey.key', {
            encoding: "UTF-8"
        });
        this.privateKey = openpgp.key.readArmored(armored).keys[0];
    } catch (e) {

        if (e.code === 'ENOENT') {
            this.privateKey = 0;
        } else {
            throw (e);
        }
    }

    if (this.publicKey && this.privateKey) {
        this.newUser = 0;
    } else {
        if (this.publicKey || this.privateKey) {
            this.missing = 1;
        }
    }


};
