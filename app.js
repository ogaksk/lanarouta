
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(app.router);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));


var osc = require('node-osc');
var client = new osc.Client('127.0.0.1', 3333);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

// http.createServer(app).listen(app.get('port'), function(){
//   console.log('Express server listening on port ' + app.get('port'));
// });

server = http.createServer(app);
var socketio = require('socket.io');
var io = socketio.listen(server);


io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

server.listen(app.get('port'), function(){
  console.log("server listening on port " + app.get('port'));
});


io.sockets.on('connection', function (socket) {
  var address = socket.handshake.address;
  console.log("connected from " + address.address + ":" + address.port);

  socket.on('sendmessage', function(data) {
    // max/msp にプッシュする
    console.log("data_is==="+ data.message);
    client.send('/oscAddress', data.message);
  });

  socket.on('disconnect', function () {
    console.log("disconnectted from " + address.address + ":" + address.port)
  });


});
