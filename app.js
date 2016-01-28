var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser')
var favicon = require('serve-favicon');

var PouchDB = require('pouchdb');
var db = new PouchDB('habits');
var remoteCouch = false;

var app = express();
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// GET /assets (static files).
app.use('/assets', express.static(__dirname + '/public'));

// GET /
// Return a simple welcome message.
app.get('/', function(req, res) {
  fs.readFile('./public/welcome.html', function (err, html) {
    res.set('Content-Type', 'text/html');
    res.send(html);
  });
});

// GET /habits
app.get('/habits', function(req, res) {
  db.allDocs(function(error, docs) {
    res.json(docs);
  });
});

// POST /habits/
app.post('/habits', function(req, res) {
  // Look for the document in the database.
  db.get(req.body.username, (error, doc) => {
    // If there is no document for that user create one.
    if (error && error.status == 404) {
      // Use username for _id.
      req.body._id = req.body.username;

      // Create new doc.
      db.put(req.body, (error, newDoc) => {
        if (error) {
          res.status(error.status).json(error);
        }

        res.json(newDoc);
      });
    } else {
      // Update the doc.
      db.put(req.body, doc._id, doc._rev, (error, updatedDoc) => {
        if (error) {
          res.status(error.status).json(error);
        }

        res.json(updatedDoc);
      });
    }
  })
});

// GET /habits/:username
app.get('/habits/:username', function(req, res) {
  // Get habits array from database.
  db.get(req.params.username, function (error, doc) {
    if (error) {
      res.status(404).json(error);
    }
    res.json(doc);
  });
});

// DELETE /habits/:username
app.delete('/habits', function(req, res) {
  // Lookup username.
  db.get(req.body.username, function (error, doc) {
    if (error) {
      res.status(error.status).json(error);
    }

    // Remove the doc and send status message.
    db.remove(doc);
    res.json({username: req.params.username, message: 'Removed from database.'});
  });
});

// GET /help
// Return a simple 404 page.
app.get('/help', function(req, res) {
  fs.readFile('./public/help.html', function (err, html) {
    res.set('Content-Type', 'text/html');
    res.send(html);
  });
});

// GET 404
// Return a simple 404 page.
app.get(/.*/, function(req, res) {
  fs.readFile('./public/404.html', function (err, html) {
    res.set('Content-Type', 'text/html');
    res.send(html);
  });
});

app.listen(3000);
