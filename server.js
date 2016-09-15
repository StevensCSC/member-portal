import express from 'express';
import session from 'express-session';
import connectRedis from 'connect-redis';
import GitHubApi from 'github';
import ReactServer from 'react-dom/server';
import React from 'react';
import ReactDOM from 'react-dom';
import request from 'request';
import bodyParser from 'body-parser';
import * as db from './db.js';
import redis from 'redis';
let app = express();

let github = new GitHubApi({
  protocol: 'https',
  host: 'api.github.com',
  headers: {
    'user-agent': 'SCSC Member Portal'
  },
  timeout: 5000 });

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', "http://localhost:8080");
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

let RedisStore = connectRedis(session);
let redisClient = redis.createClient();
db.setClient(redisClient);

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new RedisStore({
    client: redisClient
  })
}));

app.use(express.static('./public'));

// routes requiring authentication
app.use(['/:id/upvote', '/:id/resetVote/', '/submit/', '/getSuggestionsForCurrentUser'], function (req, res, next) {
  if (!req.session.accessToken) {
    res.status(401).send('User not logged in');
  } else {
    github.authenticate({
      type: 'oauth',
      token: req.session.accessToken
    });
    github.users.get({}, function (err, usersReponse) {
      if (err) {
        res.status(500).send('Failed to load user GitHub username');
      } else {
        req.session.ghUser = usersReponse.login;
        github.orgs.checkMembership({
          org: "StevensCSC",
          user: req.session.ghUser
        }, function (err, membershipRes) {
          if (err) {
            res.status(403).send('User does not have permissions to view this page');
          } else {
            next();
          }
        });
      }
    });
  }
});

// parse POST body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/:id/upvote', function (req, res) {
  let id = req.params.id;
  console.log('User ' + req.session.ghUser + ' upvoting suggestion #' + id);
  db.upvoteSuggestionForUser(id, req.session.ghUser)
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.end('{}');
    });
});

app.get('/:id/resetVote', function (req, res) {
  let id = req.params.id;
  console.log('User ' + req.session.ghUser + ' reseting vote for suggestion #' + id);
  db.resetVoteSuggestionForUser(id, req.session.ghUser)
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.end('{}');
    });
});

app.post('/submit', function(req, res) {
  console.log('User ' + req.session.ghUser + ' submitting suggestion: ' + JSON.stringify(req.body));
  let suggestion = req.body;
  if (suggestion.title && suggestion.desc && suggestion.link) {
    suggestion.suggester = req.session.ghUser;
    db.createSuggestion(suggestion)
      .then((val) => {
        console.log('Success: ' + JSON.stringify(val));
        res.json(val);
      })
      .catch((err) => {
        console.log('Error: ' + err);
        res.end('[]');
      });
  } else {
    res.end('');
  }
});

app.get('/getSuggestionsForCurrentUser', function(req, res) {
  console.log('Loading suggestions for ' + req.session.ghUser);
  db.getSuggestionsForUser(req.session.ghUser)
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.log('Error getting suggestions for current user: ' + err);
      res.end('{}');
    });
});

app.get('/callback', function(req, res) {
  request.post('https://github.com/login/oauth/access_token',
    {
      json: {
        client_id: process.env.GH_CLIENT_ID,
        client_secret: process.env.GH_CLIENT_SECRET,
        code: req.query.code
      }
    },
    function (error, response, body) {
      if (!error && response.statusCode === 200) {
        req.session.accessToken = body.access_token;
        github.authenticate({
          type: 'oauth',
          token: req.session.accessToken
        });
        github.users.get({}, function (err, usersReponse) {
          req.session.ghUser = usersReponse.login;
          res.redirect('/');
        });
      } else {
        res.redirect('/');
      }
    }
  );
});

app.get('/logout', function(req, res) {
  console.log('Logging out user ' + req.session.ghUser);
  req.session.destroy();
  res.end('Logged out');
});

app.listen('3000', function() {
  console.log('Example app listening on port 3000!');
});
