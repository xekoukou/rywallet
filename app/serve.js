var path = require('path');
var fs = require('fs');
var qs = require('querystring');
var Cookies = require('cookies');

var pfolder = "./client";


module.exports = function Serve(user) {

    user: user,

    notHavingSessionId: function(url, res, cookies) {

        console.log("a new session started, destrroying the previous one if it existed");
        this.user.createSessionId();
        cookies.set("sessionId", this.user.sessionId);
        res.writeHead(307, {
            'Location': url
        });
        res.end();


    },

    sendNotFound: function(res) {
        res.writeHead(404);
        res.end("404 Not Found");
        return;
    },

    //url is the url asked by the client or null that sends the user to the default page
    sendData: function(res, url) {

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

        if ((ct == 0) || ((extname == ".html") && (nurl != (pfolder + "/ryWallet.html")))) {
            this.sendNotFound(res);
            return;
        }
        if (extname == ".html") {
            if (this.user.missing) {
                nurl = pfolder + "/keyMissingError.html";
            } else {
                if (this.user.newUser) {
                    nurl = pfolder + "/newUser.html";
                } else {
                    if (this.user.authenticated) {
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
                this.sendNotFound(res);
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

    },


    route: function(req, res) {


        if (req.method == 'GET') {

            this.sendData(res, req.url);
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
                    this.user.authenticate(res, post.password);
                } else {

                    if (post.newPassword == post.rnewPassword) {
                        console.log("same..");
                        this.user.createKeys(res, post.newName, post.newLastName, post.newPassword);
                    } else {
                        console.log("not the same..");
                        this.sendData(res, null);
                    }
                }
                return;

            });
        }
    },




    serve: function(req, res) {
        console.log(req.url);
        console.log(req.headers);
        console.log(req.method);
        console.log(req.trailers);
        var cookies = new Cookies(req, res, null);

        var sessionId = cookies.get("sessionId");
        if ((sessionId == null) || (sessionId != this.user.sessionId))
            return this.notHavingSessionId(req.url, res, cookies);

        return this.route(req, res);

    }

}
