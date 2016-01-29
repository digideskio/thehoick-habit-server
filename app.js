var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser')
var favicon = require('serve-favicon');

var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-upsert'));
var db = new PouchDB('habits');
var remoteCouch = false;

var app = express();
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.set('view engine', 'jade');

// GET /assets (static files).
app.use('/assets', express.static(__dirname + '/public'));

/*
 *
 * Web App
 *
*/

// GET /
// Return a simple welcome message.
app.get('/', function(req, res) {
  db.allDocs(function(error, docs) {
    res.render('index', {habits: docs, title: 'Habits'});
  });
});

// GET /users/:username
app.get('/users/:username', function(req, res) {
  db.get(req.params.username, {rev: req.query.rev, revs: true}, function(error, doc) {
    if (error) {
      res.status(200).render('error', {error: error});
    }

    res.render('user', {user: doc});
  });
});

// GET /users/rollback/:username
app.get('/users/rollback/:username', function(req, res) {
  // Get the revision from the query string.
  db.get(req.params.username, {rev: req.query.rev}, function(error, oldDoc) {
    if (error) {
      res.status(200).render('error', {error: error});
    }

    db.upsert(oldDoc._id, function(doc) {
      doc.habits = oldDoc.habits || [];
      return doc;
    }).then((result) => {
      // success!
      res.redirect('/users/' + req.params.username);
    }).catch(function (err) {
      // error (not a 404 or 409)
    });
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

/*
 *
 * API
 *
*/

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
  db.get(req.params.username, {rev: req.query.rev, revs: true}, function(error, doc) {
    if (error) {
      res.status(error.status).json(error);
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

// GET 404
// Return a simple 404 page.
app.get(/.*/, function(req, res) {
  fs.readFile('./public/404.html', function (err, html) {
    res.set('Content-Type', 'text/html');
    res.send(html);
  });
});

app.listen(3000);
