var http = require('http');
var User = require("./user.js");
var Serve = require("/serve.js");
var port = 8888;

var user = new User();
var serve = new Serve(user);

var server = http.createServer(function(req, res) {
    serve.serve(req, res);
}).listen(port, "127.0.0.1");


var io = require('socket.io').listen(server);
