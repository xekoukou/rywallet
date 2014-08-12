'use strict';

var authenticate = function(socket) {

    console.log("authenticate");

    ldata.publicKey(function(publicKey, args) {
        console.log("publicKey:" + publicKey);
        socket.emit("req_auth", {
            publicKey: publicKey
        });

    }, null);

    socket.on("session_auth", function(data) {
        //TODO remove this console line since it is insecure
        console.log("sessionId:" + data.sessionId);
        if (data.sessionId != null) {
            ldata.sign(data.sessionId, function(signed, args) {
                socket.emit("signed_auth", {
                    signed: signed
                });

            }, null);

        }

    });

};
