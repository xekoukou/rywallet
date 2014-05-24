module.exports = function(user, server, port) {

    var io = require('socket.io').listen(server);

    io.configure(function() {
        io.set('authorization', function(handshakeData, callback) {
            var sessionId = handshakeData.headers.cookie.substring(10);

            if ((!handshakeData.xdomain) && (sessionId == user.sessionId)) {

                callback(null, true);
            } else {
                callback(null, false);
            }


        });

        io.set('origins', '127.0.0.1:' + port);
        io.set('transports', ['websocket']);


    });



    io.of('/local'.on('connection', function(socket) {


            socket.on("encrypt", function(data) {
                if (user.authenticated) {
                    var result = openpgp.key.readArmored(data.publicKey);
                    if (result.err == null) {
                        var encrypted = openpgp.encryptMessage([result.keys[0]], data.text);
                        socket.emit("encrypt", encrypted);
                        return;
                    }
                }
                socket.emit("encrypted", null);
                return;
            });
            socket.on("decrypt", function(data) {
                if (user.authenticated) {
                    var msg = openpgp.message.readArmored(data);
                    if (msg != null) {

                        var decrypted = openpgp.decryptMessage([user.privateKey], msg);
                        socket.emit("decrypt", decrypted);
                        return;
                    }
                    socket.emit("decrypt", null);
                    return;
                }
            });
            socket.on("sign", function(data) {
                if (user.authenticated) {
                    var signed = openpgp.signClearMessage([user.privateKey], data);
                    socket.emit("sign", signed);
                    return;
                }
                socket.emit("sign", null);
                return;
            });


            socket.on("verify", function(data) {
                if (user.authenticated) {
                    var result = openpgp.key.readArmored(data.publicKey);
                    if (result.err == null) {
                        var verify = openpgp.verifyMessage([result.keys[0]], data.text);
                        socket.emit("verify", verify.signatures[0].valid);
                        return;
                    }
                }
                socket.emit("verify", null);
                return;
            });
            socket.on("encryptSign", function(data) {
                if (user.authenticated) {
                    var result = openpgp.key.readArmored(data.publicKey);
                    if (result.err == null) {
                        var encryptSigned = openpgp.signAndEncryptMessage([result.keys[0]], user.privateKey, data.text);
                        socket.emit("encryptSign", encryptSigned);
                        return;

                    }
                }
                socket.emit("encryptSign", null);
                return;
            });
            socket.on("decryptVerify", function(data) {
                if (user.authenticated) {
                    var result = openpgp.key.readArmored(data.publicKey);
                    if (result.err == null) {
                        var msg = openpgp.message.readArmored(data.text);
                        if (msg != null) {

                            var decryptVerified = openpgp.decryptMessage(user.privateKey, [result.keys[0]], msg);

                            socket.emit("decryptVerify", {
                                valid: decryptVerified.signatures[0].valid,
                                text: decryptVerified.text
                            });
                            return;
                        }
                    }
                }
                socket.emit("decryptVerify", null);
                return;
            });

            socket.on("publicKey", function(data) {
                if (user.authenticated) {
                    socket.emit("publicKey", user.publicKey.armor());
                }
            });






        });





    }
