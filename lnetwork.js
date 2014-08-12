'use strict'

var lport = 8888;




function LData() {


    this.socket = io.connect('http://127.0.0.1:' + lport + '/local');
    this.encryptCall = null;
    this.encryptArgs = null;
    this.decryptCall = null;
    this.decryptArgs = null;
    this.signCall = null;
    this.signArgs = null;
    this.verifyCall = null;
    this.verifyArgs = null;
    this.encryptSignCall = null;
    this.encryptSignArgs = null;
    this.decryptVerifyCall = null;
    this.decryptVerifyArgs = null;
    this.publicKeyCall = null;
    this.publicKeyArgs = null;

    var thiss = this;

    this.encrypt = function(publicKey, text, callback, args) {

        if (this.encryptCall == null) {
            this.socket.emit("encrypt", {
                publicKey: publicKey,
                text: text
            });
            this.encryptCall = callback;
            this.encryptArgs = args;
            return 1;
        } else {
            return 0;
        }


    };
    this.socket.on("encrypt", function(data) {
        thiss.encryptCall(data, thiss.encryptArgs);
        thiss.encryptCall = null;
        thiss.encryptArgs = null;
    });


    this.decrypt = function(armoredText, callback, args) {

        if (this.decryptCall == null) {
            this.socket.emit("decrypt", armoredText);
            this.decryptCall = callback;
            this.decryptArgs = args;
            return 1;
        } else {
            return 0;
        }


    };
    this.socket.on("decrypt", function(data) {
        thiss.decryptCall(data, thiss.decryptArgs);
        thiss.decryptCall = null;
        thiss.decryptArgs = null;
    });


    this.sign = function(text, callback, args) {

        if (this.encryptCall == null) {
            this.socket.emit("sign",
                text
            );
            this.signCall = callback;
            this.signArgs = args;
            return 1;
        } else {
            return 0;
        }

    };
    this.socket.on("sign", function(data) {
        thiss.signCall(data, thiss.signArgs);
        thiss.signCall = null;
        thiss.signArgs = null;
    });


    this.encryptSign = function(publicKey, text, callback, args) {

        if (this.encryptSignCall == null) {
            this.socket.emit("encryptSign", {
                publicKey: publicKey,
                text: text
            });
            this.encryptSignCall = callback;
            this.encryptSignArgs = args;
            return 1;
        } else {
            return 0;
        }


    };
    this.socket.on("encryptSign", function(data) {
        thiss.encryptSignCall(data, thiss.encryptSignArgs);
        thiss.encryptSignCall = null;
        thiss.encryptSignArgs = null;
    });

    this.decryptVerify = function(publicKey, text, callback, args) {

        if (this.decryptVerifyCall == null) {
            this.socket.emit("decryptVerify", {
                publicKey: publicKey,
                text: text
            });
            this.decryptVerifyCall = callback;
            this.decryptVerifyArgs = args;
            return 1;
        } else {
            return 0;
        }


    };
    this.socket.on("decryptVerify", function(data) {
        thiss.decryptVerifyCall(data, thiss.decryptVerifyArgs);
        thiss.decryptVerifyCall = null;
        thiss.decryptVerifyArgs = null;
    });

    this.publicKey = function(callback, args) {

        if (this.publicKeyCall == null) {
            console.log("requesting key");
            this.socket.emit("publicKey", null);
            this.publicKeyCall = callback;
            this.publicKeyArgs = args;
            return 1;
        } else {
            return 0;
        }


    };
    this.socket.on("publicKey", function(data) {
        thiss.publicKeyCall(data, thiss.publicKeyArgs);
        thiss.publicKeyCall = null;
        thiss.publicKeyArgs = null;
    });



}

var ldata = new LData();
