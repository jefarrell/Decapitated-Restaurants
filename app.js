var express = require('express');
var path = require('path');
var routes = require('./routes/index');
var app = express();

app.use(express.static(path.join(__dirname, '/views')));
app.use(express.static(path.join(__dirname, '/public')));

app.use('/', routes);



var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('app listening at http://%s:%s', host, port);
});


app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html')
});


module.exports = app;