import express from 'express';
import session from 'express-session';
import GitHubApi from 'github';
import ReactServer from 'react-dom/server';
import React from 'react';
import ReactDOM from 'react-dom';
import request from 'request';
import bodyParser from 'body-parser';
import * as db from './db.js';
import logger from './logger.js';
import connectPg from 'connect-pg-simple';
import pg from 'pg';

let app = express();

let pgSession = connectPg(session);

let PORT = process.env.PORT || 3000;

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

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new pgSession({
    pg: pg
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
  logger.info('User ' + req.session.ghUser + ' upvoting suggestion #' + id);
  db.upvoteSuggestionForUser(id, req.session.ghUser)
    .then(() => {
      db.getSuggestionsForUser(req.session.ghUser)
        .then((result) => {
          res.json(result);
        })
        .catch((err) => {
          res.end('{}');
        });
    })
    .catch((err) => {
      res.end('{}');
    });
});

app.get('/:id/resetVote', function (req, res) {
  let id = req.params.id;
  logger.info('User ' + req.session.ghUser + ' reseting vote for suggestion #' + id);
  db.resetVoteSuggestionForUser(id, req.session.ghUser)
    .then(() => {
      db.getSuggestionsForUser(req.session.ghUser)
        .then((result) => {
          res.json(result);
        })
        .catch((err) => {
          res.end('{}');
        });

    })
    .catch((err) => {
      res.end('{}');
    });
});

app.post('/submit', function(req, res) {
  logger.info('User ' + req.session.ghUser + ' submitting suggestion: ' + JSON.stringify(req.body));
  let suggestion = req.body;
  if (suggestion.title && suggestion.desc && suggestion.link) {
    suggestion.suggester = req.session.ghUser;
    db.createSuggestion(suggestion)
      .then(() => {
        db.getSuggestionsForUser(req.session.ghUser)
         .then((result) => {
           res.json(result);
         })
         .catch((err) => {
           res.end('{}');
         });
      })
      .catch((err) => {
        logger.info('Error: ' + err);
        res.end('[]');
      });
  } else {
    res.end('');
  }
});

app.get('/getSuggestionsForCurrentUser', function(req, res) {
  logger.info('Loading suggestions for ' + req.session.ghUser);
  db.getSuggestionsForUser(req.session.ghUser)
    .then((result) => {
      logger.info('Got suggestions for current user: ' + JSON.stringify(result));
      res.json(result);
    })
    .catch((err) => {
      logger.info('Error getting suggestions for current user: ' + err);
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
  logger.info('Logging out user ' + req.session.ghUser);
  req.session.destroy();
  res.end('Logged out');
});

app.listen(PORT, function() {
  logger.info('Example app listening on port ' + PORT + '!');
});
