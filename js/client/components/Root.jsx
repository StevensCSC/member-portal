import SuggestionBox from './SuggestionBox.jsx'
import NavBar from './NavBar.jsx'
import React from 'react'
import API from '../api.js'

let LOGIN_STATUS = {
  NOT_LOGGED_IN: 0,
  NOT_IN_ORG: 1,
  LOGGED_IN: 2
}

export default class Root extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      loginStatus: LOGIN_STATUS.NOT_LOGGED_IN,
      userRole: 'no_role',
      suggestions: []
    }

    this.onRequestError = (err) => {
      if (err.status === 401) {
        if (err.responseText === 'NOT_LOGGED_IN') {
          this.setState({
            loginStatus: LOGIN_STATUS.NOT_LOGGED_IN,
            suggestions: [],
            userRole: 'no_role'
          });
        }
        else if (err.responseText === 'NOT_IN_ORG') {
          this.setState({
            loginStatus: LOGIN_STATUS.NOT_IN_ORG,
            suggestions: [],
            userRole: 'no_role'
          });
        }
      }
    }

    this.onSuggestionSubmit = (suggestionJson) => {
      API.submit(
          suggestionJson,
          (suggestions) => {
            this.setState({ suggestions: suggestions });
          },
          this.onRequestError
      );
    }

    this.handleVoteChange = (id, upvote) => {
      if (upvote) {
        API.upvote(
            id,
            (suggestions) => {
              this.setState({ suggestions: suggestions });
            },
            this.onRequestError
        );
      } else {
        API.resetVote(
            id,
            (suggestions) => {
              this.setState({ suggestions: suggestions });
            },
            this.onRequestError
        );
      }
    }

    this.handleRemove = (id) => {
      API.deleteSuggestion(
        id,
        (suggestions) => {
          this.setState({ suggestions: suggestions });
        },
        this.onRequestError
      );
    }

    this.handleArchive = (id) => {
      API.archiveSuggestion(
        id,
        (suggestions) => {
          this.setState({ suggestions: suggestions });
        },
        this.onRequestError
      );
    }

    this.logout = () => {
      API.logout(
        (data) => {
          this.setState({
            loginStatus: LOGIN_STATUS.NOT_LOGGED_IN,
            suggestions: []
          });
        },
        this.onRequestError
      );
    }

  }

  componentDidMount () {
    API.getSuggestionsForCurrentUser(
      (suggestions) => {
        this.setState({
          loginStatus: LOGIN_STATUS.LOGGED_IN,
          suggestions: suggestions
        });
      },
      this.onRequestError
    );
    API.getUserRole(
      ({role}) => {
        this.setState({
          userRole: role
        });
      },
      this.onRequestError
    );
  }

  getMainContent () {
    if (this.state.loginStatus === LOGIN_STATUS.LOGGED_IN) {
      return <SuggestionBox
              onSuggestionSubmit={this.onSuggestionSubmit}
              handleVoteChange={this.handleVoteChange}
              handleRemove={this.handleRemove}
              handleArchive={this.handleArchive}
              suggestions={this.state.suggestions}
              userRole={this.state.userRole}
            />;
    } else if (this.state.loginStatus === LOGIN_STATUS.NOT_IN_ORG) {
      return <p>You need to be a member of the StevensCSC organization on GitHub for access. Please make a GitHub account and email your GitHub username to scsc@stevens.edu for access.</p>;
    } else {
      return;
    }
  }

  render() {
    return (
      <div className="react-root">
        <NavBar
          loginStatus={this.state.loginStatus}
          login={"https://github.com/login/oauth/authorize?scope=read:org&client_id=" + this.props.ghClientId}
          logout={this.logout} />
        {this.getMainContent()}
      </div>
    );
  }

}
