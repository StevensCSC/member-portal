import express from 'express';
import session from 'express-session';
import GitHubApi from 'github';
import ReactServer from 'react-dom/server';
import React from 'react';
import ReactDOM from 'react-dom';
import request from 'request';
import bodyParser from 'body-parser';
import * as db from './db.js';
let app = express();

let github = new GitHubApi({
  debug: true,
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
  secret: "blah",
  resave: true,
  saveUninitialized: true
}));

app.use(express.static('./public'));

// parse POST body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/:id/upvote', function (req, res) {
  if (req.session.userLoggedIn) {
    let id = req.params.id;
    console.log('Upvote id ' + id);
    console.log('Session id ' + req.sessionID);

    if (!req.session.votes) {
      req.session.votes = 0;
    }
    req.session.votes = req.session.votes + 1;
    console.log('Session upvotes ' + req.session.votes);
  }
  res.end('{}');
});

app.get('/:id/resetVote', function (req, res) {
  if (req.session.userLoggedIn) {
    let id = req.params.id;
    console.log('Reset id ' + id);
    console.log('Session id ' + req.sessionID);

    if (!req.session.resets) {
      req.session.resets = 0;
    }
    req.session.resets = req.session.resets + 1;
    console.log('Session resets ' + req.session.resets);
  }
  res.end('{}');
});

app.post('/submit', function(req, res) {
  console.log('Submit, body: ' + JSON.stringify(req.body));
  console.log('session: ' + JSON.stringify(req.session));
  let suggestion = req.body;
  if (suggestion.title && suggestion.desc && suggestion.link && req.session.userLoggedIn) {
    console.log('In if');
    suggestion.suggester = req.session.ghUser;
    db.createSuggestion(suggestion)
      .then((val) => {
        console.log('Success: ' + JSON.stringify(val));
        res.json(val);
      })
      .catch((err) => {
        console.log('Error: ' + err);
        res.end('{}');
      });
  } else {
    res.end('');
  }
});

app.get('/getSuggestionsForCurrentUser', function(req, res) {
  if (req.session.userLoggedIn && req.session.ghUser) {
    db.getSuggestionsForUser(req.session.ghUser)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        console.log('Error getting suggestions for current user: ' + err);
        res.end('{}');
      });
  } else {
    res.end('{}');
  }
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
        console.log('Got access token: ' + req.session.accessToken);
        github.authenticate({
          type: 'oauth',
          token: req.session.accessToken
        });
        console.log('authenticated');
        github.users.get({}, function (err, usersReponse) {
          console.log('got user: ' + usersReponse.login);
          req.session.ghUser = usersReponse.login;
          res.redirect('/');
        });
      } else {
        res.redirect('/');
      }
    }
  );
});

app.get('/userPermissions', function(req, res) {
  if (req.session.accessToken) {
    github.authenticate({
      type: 'oauth',
      token: req.session.accessToken
    });
    github.orgs.checkMembership({
      org: "StevensCSC",
      user: req.session.ghUser
    }, function (err, membershipRes) {
      if (err) {
        res.json({
          userLoggedIn: false
        });
      } else {
         req.session.userLoggedIn = true;
         res.json({
          userLoggedIn: true
        });
      }
    });
  } else {
    res.json({
      userLoggedIn: false
    });
  }
});

app.listen('3000', function() {
  console.log('Example app listening on port 3000!');
});
