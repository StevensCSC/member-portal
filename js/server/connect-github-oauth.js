import GitHubApi from 'github';
import request from 'request';

export default class ConnectGithubOAuth {

  constructor(options) {
    this.github = new GitHubApi(options);
    delete options.githubOptions;
    this.options = options;
  }

  callback(redirectUrl) {
    return (req, res) => {
      request.post('https://github.com/login/oauth/access_token',
        {
          json: {
            client_id: this.options.clientId,
            client_secret: this.options.clientSecret,
            code: req.query.code
          }
        },
        function (err, accessTokenResponse, body) {
          if (!err && accessTokenResponse.statusCode === 200) {
            req.session.github = { accessToken: body.access_token };
          }
          res.redirect(redirectUrl);
        });
    };
  }

  userInOrg(org) {
    let that = this;

    return (req, res, next) => {
      if (!req.session.github || !req.session.github.accessToken) {
        // user not authenticated
        res.status(401).send();
      } else {
        that.github.authenticate({
          type: 'oauth',
          token: req.session.github.accessToken
        });

        that.github.users.get({}, function (err, usersResponse) {
          if (err) {
            res.status(500).send();
          }
          that.github.orgs.checkMembership({
            org: org,
            user: usersResponse.login
          }, function (err, memershipResponse) {
            if (err) {
              // user not in org
              res.status(403).send();
            } else {
              // user is in org
              req.session.github.username = usersResponse.login;
              req.session.github.userId = usersResponse.id;
              next();
            }
          });
        });
      }
    };
  }
}
