var nano = require('nano')('http://localhost:5984');
var async = require('async');


function dateSort(a, b) {
  return new Date(a.date).getTime() - new Date(b.date).getTime();
}

exports.getAllHours = function(req, res) {
  var arr = [];

  nano.db.list(function(err, body) {
    async.each(body, function(db, callback) {

      if(db.indexOf("student$") > -1) {
        var dbName = db.slice(db.indexOf("$") + 1);

        nano.db.use("sl-users").get(dbName, function(err, body) {

          nano.db.use(db).view("hours", "date", function(err, bod) {
            bod.rows.forEach(function(doc) {
              doc.value.firstName = body.firstName;
              doc.value.lastName = body.lastName;
              doc.value.student = dbName;
              doc.value.id = doc.id;
              arr.push(doc.value);
            });
            callback();
          });

        });
      }
      else
        callback();
    },
    function(err) { err ? res.send(err) : res.send(arr.sort(dateSort)); });
  });
}

exports.deleteDoc = function(req, res) {
  var studentDB = nano.db.use("student$" + req.params.student);
  studentDB.get(req.body.id, function(err, body) {

    studentDB.destroy(req.body.id, body._rev, function(err, bod) {
       err ? res.send(err) : res.send("Sucessfully Deleted: " + req.body.id + " from student$" + req.params.student);
    });

  });
}

exports.getEvents = function(req, res) {
  var arr = [];
  var eventsDB = nano.db.use("events");

  eventsDB.view("events", "start", function(err, body) {

    async.each(body.rows, function(doc, callback) {
      doc.value.id = doc.id;
      arr.push(doc.value);
      callback();
    },
    function(err) { err ? res.send(err) : res.send(arr.sort(dateSort)); });

  });
}

exports.addEvent = function(req, res) {
  var eventsDB = nano.db.use("events");

  eventsDB.insert({ title: req.body.title, start: req.body.start, end: req.body.end }, function(err, body) {
      err ? res.send(err) : res.send("Sucessfully added event: " + req.body.title);
  });
}

exports.deleteEvent = function(req, res) {
  var eventsDB = nano.db.use("events");

  eventsDB.view("events", "start", { key: req.body.start }, function(err, body) {

    eventsDB.get(body.rows[0].id, function(err, bod) {

      eventsDB.destroy(body.rows[0].id, bod._rev, function(err, b) {
         err ? res.send(err) : res.send("Sucessfully Deleted: " + body.rows[0].id);
      });

    });

  });
}

exports.getNews = function(req, res) {
  var arr = [];
  var newsDB = nano.db.use("news");

  newsDB.list({include_docs: true}, function(err, body) {
    body.rows.forEach(function(doc) {
      arr.push(doc);
    });
    res.send(arr);
  });
}

exports.addNews = function(req, res) {
  var newsDB = nano.db.use("news");

  newsDB.insert({ title: req.body.title, desc: req.body.desc }, function(err, body) {
     err ? res.send(err) : res.send("Sucessfully added announcement: " + req.body.title);
  });
}

exports.deleteNews = function(req, res) {
  var newsDB = nano.db.use("news");

  newsDB.destroy(req.body.id, req.body.rev, function(err, body) {
     err ? res.send(err) : res.send("Sucessfully Deleted: " + req.body.id);
  });
}
