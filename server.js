var express    = require('express');
var session    = require('express-session');
var GitHubApi  = require('github');
var $          = require('jquery');

let app = express();

let github = new GitHubApi({
  debug: true,
  protocol: 'https',
  host: 'api.github.com',
  headers: {
    'user-agent': 'SCSC Member Portal'
  },
  timeout: 5000
});

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

app.get('/:id/upvote', function (req, res) {
  let id = req.params.id;
  console.log('Upvote id ' + id);
  console.log('Session id ' + req.sessionID);

  if (!req.session.votes) {
    req.session.votes = 0;
  }
  req.session.votes = req.session.votes + 1;
  console.log('Session upvotes ' + req.session.votes);
  res.end('{}');
});

app.get('/:id/resetVote', function (req, res) {
  let id = req.params.id;
  console.log('Reset id ' + id);
  console.log('Session id ' + req.sessionID);

  if (!req.session.resets) {
    req.session.resets = 0;
  }
  req.session.resets = req.session.resets + 1;
  console.log('Session resets ' + req.session.resets);
  res.end('{}');
});

app.post('/submit', function(req, res) {
  console.log('Submit');
  res.end('');
});

app.get('/callback', function(req, res) {
  console.log('GitHub callback');
  $.post({
    url: 'https://github.com/login/oauth/access_token',
    dataType: 'json',
    data: {
      client_id: process.env['GITHUB_CLIENTID'],
      client_secret: process.env['GITHUB_SECRET'],
      code: req.code
    },
    success: (data) => {
      req.session.accessToken = data.gitHubAccessToken
      res.end('{}');
    }
  });
});

app.listen('3000', function() {
  console.log('Example app listening on port 3000!');
});
