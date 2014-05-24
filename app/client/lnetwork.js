var lport = 8888;




function LData() {


    this.scoket = io.connect('http://127.0.0.1:' + lport + '/local');
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
        this.encryptCall(data, this.encryptArgs);
        this.encryptCall = null;
        this.encryptArgs = null;
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
        this.decryptCall(data, this.decryptArgs);
        this.decryptCall = null;
        this.decryptArgs = null;
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
        this.signCall(data, this.signArgs);
        this.signCall = null;
        this.signArgs = null;
    });


    this.encryptSign = function(publicKey, text, args) {

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
        this.encryptSignCall(data, this.encryptSignArgs);
        this.encryptSignCall = null;
        this.encryptSignArgs = null;
    });

    this.decryptVerify = function(publicKey, text, args) {

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
        this.decryptVerifyCall(data, this.decryptVerifyArgs);
        this.decryptVerifyCall = null;
        this.decryptVerifyArgs = null;
    });


}
