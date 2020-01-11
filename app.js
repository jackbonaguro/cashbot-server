var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var admin = require('firebase-admin');
var mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1/cashbot', { useNewUrlParser: true });
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var app = express();

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://cashbot-59ed2.firebaseio.com'
});

const registrationTokens = require('./device-tokens');

const message = {
  data: {
    score: '850',
    time: '2:45'
  },
  tokens: registrationTokens
};

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  req.db = db;
  next();
});

app.get('/status', (req, res) => {
  res.status(200).end('OK');
});

app.post('/notify', (req, res, next) => {
  console.log(req.body);
  return admin.messaging().sendMulticast(message)
    .then((response) => {
      const failedTokens = [];
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(registrationTokens[idx]);
          }
        });
      }
      console.log(`List of tokens that caused failures: ${JSON.stringify(failedTokens)}`);
      return res.status(200).end(`List of tokens that caused failures: ${JSON.stringify(failedTokens)}`);
    }).catch((err) => {
      console.error(err);
      return res.status(500).end();
    });
});

app.post('/notifyhp', (req, res, next) => {
  console.log(req.body);
  return admin.messaging().sendMulticast({
    data: {
      method: 'addressRequest'
    },
    android: {
      priority: 'high'
    },
    tokens: registrationTokens
  })
    .then((response) => {
      const failedTokens = [];
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(registrationTokens[idx]);
          }
        });
      }
      console.log(`List of tokens that caused failures: ${JSON.stringify(failedTokens)}`);
      return res.status(200).end(`List of tokens that caused failures: ${JSON.stringify(failedTokens)}`);
    }).catch((err) => {
      console.error(err);
      return res.status(500).end();
    });
});

app.post('/respond', (req, res) => {
  console.log(req.body);
  res.status('200').json(req.body).end();
});

// User Routes
const User = require('./schema/User');

app.post('/createuser', (req, res) => {
  let {
    email,
    deviceToken,
    handle,
    passwordHash,
    apiKey,
  } = req.body;
  new User(req.body).save((err) => {

  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500).end(res.locals.err);
});

module.exports = app;
