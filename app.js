var express = require('express');
var fs = require('fs');
var app = express();

// GET /assets (static files).
app.use('/assets', express.static(__dirname + '/public'));

// GET /
// Return a simple welcome message.
app.get('/', function(req, res) {
  fs.readFile('./public/welcome.html', function (err, html) {
    res.writeHeader(200, {"Content-Type": "text/html"});
    res.write(html);
    res.end();
  });
});

// GET /habits/$username
app.get('/habits/:username', function(req, res) {
  res.send('<html><head></head><body><h1>Username: ' + req.params.username + '</body></html>');
  //    Get habits array from database.
  //    Convert it to JSON.
  //    Serve it back as JSON.
});

  // POST /habits/$username
  //     Recieve JSON data.
  //     Save JSON data to database.
  //     Send back confirmation in JSON.

// GET 404
// Return a simple 404 page.
app.get(/.*/, function(req, res) {
  fs.readFile('./public/404.html', function (err, html) {
    res.writeHeader(200, {"Content-Type": "text/html"});
    res.write(html);
    res.end();
  });
});

app.listen(3000);
