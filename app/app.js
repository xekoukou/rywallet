var http = require('http');
var User = require("./user.js");
var Serve = require("./serve.js");
var port = 8888;

var user = new User();
console.log("user" + user.authenticated);
var serve = new Serve(user);

var server = http.createServer(function(req, res) {
    serve.serve(req, res);
}).listen(port, "127.0.0.1");


require('./socketio.js')(user, server, port);
