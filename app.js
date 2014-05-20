var http = require('http');
var path = require('path');
var fs = require('fs');
var crypto = require('crypto');
var qs = require('querystring');
var Cookies = require('cookies');
var openpgp = require('openpgp');
var socketIO = require('socket.io');


var port = 8888;
var pfolder = "./client";


function User() {
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
    this.authenticate = function(res, password) {
        this.authenticated = 1;

        sendData(res, null);
    };

    this.createKeys = function(res, name, lname, password) {
        console.log("creating keys ... please wait.");
        console.log("userId:" + name + " " + lname);
        console.log("password:" + password);
        var key = openpgp.generateKeyPair({
            numBits: 4096,
            userId: (name + " " + lname),
            passphrase: password
        });

        console.log("created keys.");

        fs.writeFileSync('./keys/myPublicKey.key', key.publicKeyArmored, {
            encoding: "UTF-8"
        });
        fs.writeFileSync('./keys/myPrivateKey.key', key.privateKeyArmored, {
            encoding: "UTF-8"
        });
        this.publicKey = openpgp.key.readArmored(key.publicKeyArmored).keys[0];
        this.privateKey = openpgp.key.readArmored(key.privateKeyArmored).keys[0];
        this.newUser = 0;
        sendData(res, null);
        return;
    };


    var armored;
    try {

        armored = fs.readFileSync('./keys/myPublicKey.key', {
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

        armored = fs.readFileSync('./keys/myPrivateKey.key', {
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


var user = new User();



var notHavingSessionId = function(res, cookies) {

    console.log("a new session started, destrroying the previous one if it existed");
    user.createSessionId();
    cookies.set("sessionId", user.sessionId);
    res.writeHead(307, {
        'Location': '/ryWallet.html'
    });
    res.end();


};

var sendNotFound = function(res) {
    res.writeHead(404);
    res.end("404 Not Found");
    return;
}

//url is the url asked by the client or null that sends the user to the default page
var sendData = function(res, url) {

    if (url == null) {
        url = "/ryWallet.html";
    }

    var nurl = path.resolve(url);
    nurl = pfolder + nurl;

    var extname = path.extname(nurl);

    var ct = 0;
    switch (extname) {
        case ".html":
            ct = 'text/html';
            break;
        case ".js":
            ct = 'text/javascript';
            break;
        case ".css":
            ct = 'text/css';
            break;
    }

    if ((ct == 0) || (nurl != "./client/ryWallet.html")) {
        sendNotFound(res);
        return;
    }
    if (extname == ".html") {
        if (user.missing) {
            nurl = pfolder + "/keyMissingError.html";
        } else {
            if (user.newUser) {
                nurl = pfolder + "/newUser.html";
            } else {
                if (user.authenticated) {
                    nurl = pfolder + "/ryWallet.html";
                } else {
                    nurl = pfolder + "/authRyWallet.html";
                }

            }
        }
    }

    var data;
    try {

        data = fs.readFileSync(nurl, {
            encoding: "UTF-8"
        });
    } catch (e) {

        if (e.code === 'ENOENT') {
            sendNotFound(res);
            return;
        } else {
            throw (e);
        }
    }




    res.writeHead(200, {
        "Content-Type": ct
    });
    res.end(data);
    return;

};


var route = function(req, res) {


    if (req.method == 'GET') {

        sendData(res, req.url);
    }

    if (req.method == 'POST') {
        var body = '';
        req.on('data', function(data) {
            body += data;
            if (body.length > 1e6) {
                req.connection.destroy();
            }
        });
        req.on('end', function() {

            var post = qs.parse(body);
            if (post.password) {
                console.log("post:" + post.password);
                user.authenticate(res, post.password);
            } else {

                if (post.newPassword == post.rnewPassword) {
                    console.log("same..");
                    user.createKeys(res, post.newName, post.newLastName, post.newPassword);
                } else {
                    console.log("not the same..");
                    sendData(res, null);
                }
            }
            return;

        });
    }
}




var serve = function(req, res) {
    console.log(req.url);
    console.log(req.headers);
    console.log(req.method);
    console.log(req.trailers);
    var cookies = new Cookies(req, res, null);

    var sessionId = cookies.get("sessionId");
    if ((sessionId == null) || (sessionId != user.sessionId))
        return notHavingSessionId(res, cookies);

    return route(req, res);






};




var server = http.createServer(serve).listen(port, "127.0.0.1");
