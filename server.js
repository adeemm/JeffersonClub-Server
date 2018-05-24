var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var logger = require('morgan');
var cors = require('cors');
var SuperLogin = require('superlogin');
var path = require('path');
var api = require('./routes/couch');
var session = require('express-session');


var config = {
  dbServer: {
    protocol: 'http://',
    host: 'localhost:5984',
    user: '',
    password: '',
    userDB: 'sl-users',
    couchAuthDB: '_users'
  },
  mailer: {
    fromEmail: 'noreply@example.com',
  },
  testMode: {
    noEmail: true,
  },
  security: {
    maxFailedLogins: 10,
    lockoutTime: 600,
    tokenLife: 604800,
    loginOnRegistration: true,
  },
  userDBs: {
    defaultDBs: {
      private: ['student'],
      shared: ['events', 'news']
    },
    model: {
      student: {
        designDocs: ['hours'],
        permissions: ['_reader', '_writer', '_replicator']
      }
    },
    designDocDir: path.join(__dirname, './design-docs')
  },
  providers: {
    local: true
  },
  userModel: {
    whitelist: ['firstName', 'lastName'],
    validate: {
      firstName: {
        presence: true,
      },
      lastName: {
        presence: true,
      }
    }
  }
}

var superlogin = new SuperLogin(config);


var app = express();
app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use(function(req, res, next) {
   res.header('Access-Control-Allow-Origin', '*');
   res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
   res.header('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept');
   next();
});

// handle client app auth
app.use('/auth', superlogin.router);

app.use(session({
    secret: 'secret', //change this
    resave: false,
    saveUninitialized: true
}));

var auth = function(req, res, next) {
  if (req.session && req.session.admin)
    return next();
  else
    return res.redirect('/login');
};

// handle backend admin panel auth
app.get('/login', function (req, res) {
  if(req.query.username === 'username' || req.query.password === 'password') {
    req.session.user = 'username';
    req.session.admin = true;
    res.redirect('/index.html');
  }
  else {
    res.sendFile(path.join(__dirname, './www/login.html'));
  }
});

app.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/login');
});

app.use(auth);

// serve admin panel backend
app.use(express.static(path.join(__dirname, './www')));

// setup api routes
app.get('/api/everyone/hours', api.getAllHours);

app.get('/api/everyone/events', api.getEvents);

app.get('/api/everyone/news', api.getNews);

app.put('/api/everyone/news', api.addNews);

app.put('/api/everyone/events', api.addEvent);

app.delete('/api/everyone/news', api.deleteNews);

app.delete('/api/everyone/events', api.deleteEvent);

app.delete('/api/:student/deleteDoc', api.deleteDoc);


app.listen(app.get('port'));
console.log('listening on port ' + app.get('port'));
