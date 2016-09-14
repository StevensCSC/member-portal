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
      suggestions: []
    }

    this.onRequestError = (err) => {
      if (err.status === 401) {
        this.setState({
          loginStatus: LOGIN_STATUS.NOT_LOGGED_IN,
          suggestions: []
        });
      } else if (err.status === 403) {
        this.setState({
          loginStatus: LOGIN_STATUS.NOT_IN_ORG,
          suggestions: []
        });
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

    this.logout = () => {
      API.logout(
        (data) => {
          this.setState({
            loginStatus: LOGIN_STATUS.LOGGED_OUT,
            suggestions: []
          });
        },
        (err) => {

        }
      );
    }

  }

  componentDidMount () {
    API.getSuggestionsForCurrentUser(
      (suggestions) => {
        console.log("suggestions: " + JSON.stringify(suggestions));
        this.setState({
          loginStatus: LOGIN_STATUS.LOGGED_IN,
          suggestions: suggestions
        });
      },
      this.onRequestError
    );
  }

  getMainContent () {
    if (this.state.loginStatus === LOGIN_STATUS.LOGGED_IN) {
      return <SuggestionBox onSuggestionSubmit={this.onSuggestionSubmit} handleVoteChange={this.handleVoteChange} suggestions={this.state.suggestions} />;
    } else if (this.state.loginStatus === LOGIN_STATUS.NOT_IN_ORG) {
      return <a href="https://github/com/stevenscsc">Join the SCSC GitHub organization for access</a>;
    } else {
      return <a href="https://github.com/login/oauth/authorize?scope=read:org&client_id=0ffffd652180d6e16381">Log in first!</a>;
    }
  }

  render() {
    return (
      <div className="react-root">
        <NavBar loginStatus={this.state.loginStatus} logout={this.logout} />
        {this.getMainContent()}
      </div>
    );
  }

}
