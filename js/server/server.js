import express from 'express';
import session from 'express-session';
import GitHubApi from 'github';
import React from 'react';
import ReactDOM from 'react-dom';
import request from 'request';
import bodyParser from 'body-parser';
import * as db from './db.js';
import logger from './logger.js';
import connectPg from 'connect-pg-simple';
import pg from 'pg';
import ConnectGithubOAuth from './connect-github-oauth.js';

let app = express();

let pgSession = connectPg(session);

let PORT = process.env.PORT || 3000;

var client_id;
var client_secret;
var session_store;

if (process.env.NODE_ENV === 'production') {
  client_id = process.env.GH_CLIENT_ID;
  client_secret = process.env.GH_CLIENT_SECRET;
  session_store = new pgSession({
    pg: pg
  });
} else {
  // for development, use OAuth app redirecting to localhost
  client_id = 'e6ee50c78c3897414fff';
  client_secret = '96561f9593a891deb8314e7468a4c89630f3fc5d';
  // for development, use MemoryStore for sessions
  session_store = undefined;
}

let connectGithubOAuth = new ConnectGithubOAuth({
  githubOptions: {
    protocol: 'https',
    host: 'api.github.com',
    headers: {
      'user-agent': 'SCSC Member Portal'
    },
    timeout: 5000
  },
  clientId: client_id,
  clientSecret: client_secret
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret',
  resave: false,
  saveUninitialized: false,
  store: session_store
}));

app.use(express.static('./public'));

// routes requiring authentication
app.use(['/:id/upvote', '/:id/resetVote/', '/submit/', '/getSuggestionsForCurrentUser', '/getUserRole'],
  connectGithubOAuth.userInOrg('StevensCSC')
);

// routes requiring admin
app.use(['/:id/delete', '/:id/archive'],
  connectGithubOAuth.userIsAdmin('StevensCSC', 'E-Board')
);

// parse POST body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/:id/upvote', function (req, res) {
  let id = req.params.id;
  logger.info('User ' + req.session.github.username + ' upvoting suggestion #' + id);
  db.upvoteSuggestionForUser(id, req.session.github.userId)
    .then(() => {
      db.getSuggestionsForUser(req.session.github.userId)
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
  logger.info('User ' + req.session.github.username + ' reseting vote for suggestion #' + id);
  db.resetVoteSuggestionForUser(id, req.session.github.userId)
    .then(() => {
      db.getSuggestionsForUser(req.session.github.userId)
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

app.delete('/:id/delete', function (req, res) {
  let id = req.params.id;
  logger.info('User ' + req.session.github.username + ' deleting suggestion #' + id);
  db.deleteSuggestion(id)
    .then(() => {
      db.getSuggestionsForUser(req.session.github.userId)
        .then((result) => {
          res.json(result);
        })
        .catch((err) => {
          logger.info('Error getting suggestions for current user: ' + err);
          res.json([]);
        });
    })
    .catch((err) => {
      logger.info('Error deleting suggestion #' + id);
      res.json([]);
    });
});

app.get('/:id/archive', function (req, res) {
  let id = req.params.id;
  logger.info('User ' + req.session.github.username + ' archiving suggestion #' + id);
  db.archiveSuggestion(id)
    .then(() => {
      db.getSuggestionsForUser(req.session.github.userId)
        .then((result) => {
          res.json(result);
        })
        .catch((err) => {
          logger.info('Error getting suggestions for current user: ' + err);
          res.json([]);
        });
    })
    .catch((err) => {
      logger.info('Error archiving suggestion #' + id + ": " + err);
      res.json([]);
    });
});

app.post('/submit', function(req, res) {
  logger.info('User ' + req.session.github.username + ' submitting suggestion: ' + JSON.stringify(req.body));
  let suggestion = req.body;
  if (suggestion.title && suggestion.desc && suggestion.link) {
    if (!suggestion.link.match(/^[a-zA-Z]+:\/\//)) {
      suggestion.link = "http://" + suggestion.link;
    }
    suggestion.suggester = req.session.github.userId;
    db.createSuggestion(suggestion)
      .then(() => {
        db.getSuggestionsForUser(req.session.github.userId)
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
  logger.info('Loading suggestions for ' + req.session.github.username);
  db.getSuggestionsForUser(req.session.github.userId)
    .then((result) => {
      logger.info('Got suggestions for current user: ' + JSON.stringify(result));
      res.json(result);
    })
    .catch((err) => {
      logger.info('Error getting suggestions for current user: ' + err);
      res.end('{}');
    });
});

app.get('/getUserRole',
  connectGithubOAuth.userRole('StevensCSC', 'E-Board')
);

app.get('/callback', connectGithubOAuth.callback('/'));

app.get('/logout', function(req, res) {
  logger.info('Logging out user ' + req.session.github.username);
  req.session.destroy();
  res.end('Logged out');
});

app.listen(PORT, function() {
  logger.info('Example app listening on port ' + PORT + '!');
});
