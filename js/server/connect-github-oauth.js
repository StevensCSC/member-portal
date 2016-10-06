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

  authenticate (accessToken) {
    this.github.authenticate({
      type: 'oauth',
      token: accessToken
    });
  }

  ifAuthenticated (req, res, next, f) {
    if (req.session.github &&  req.session.github.accessToken) {
      this.authenticate(req.session.github.accessToken);
      f();
    } else {
      res.status(401).send('NOT_LOGGED_IN');
    }
  }

  userInOrg(org) {
    let that = this;

    return (req, res, next) => {
      that.ifAuthenticated (req, res, next,
        () => {
          that.github.users.get({}, function (err, usersResponse) {
            if (err) {
              res.status(500).send();
            } else {
              that.github.orgs.checkMembership({
                org: org,
                user: usersResponse.login
              }, function (err, memershipResponse) {
                if (err) {
                  // user not in org
                  res.status(401).send('NOT_IN_ORG');
                } else {
                  // user is in org
                  req.session.github.username = usersResponse.login;
                  req.session.github.userId = usersResponse.id;
                  next();
                }
              });
            }
          });
        }
      );
    };
  }

  userIsAdmin(org, adminTeam) {
    let that = this;

    return (req, res, next) => {
      that.ifAuthenticated (req, res, next,
        () => {
          that.github.users.getTeams({}, function (err, teamsResponse) {
            if (err) {
              res.status(500).send();
            } else {
              if (teamsResponse.some((item) => {
                return item.name === adminTeam && item.organization.login === org;
              })) {
                next();
              } else {
                res.status(403).send();
              }
            }
          });
        }
      );
    };
  }

  userRole(org, adminTeam) {
    let that = this;

    return (req, res, next) => {
      that.ifAuthenticated (req, res, next,
        () => {
          that.github.users.getTeams({}, function (err, teamsResponse) {
            if (err) {
              res.status(500).send();
            } else {
              if (teamsResponse.some((item) => {
               return item.name === adminTeam && item.organization.login === org;
              })) {
                res.json({
                  role: 'admin'
                });
              } else {
                res.json({
                  role: 'member'
                });
              }
            }
          });
        }
      );
    };
  }

}
