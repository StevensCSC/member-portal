import SuggestionList from './SuggestionList.jsx'
import SuggestionForm from './SuggestionForm.jsx'
import React from 'react';
import API from '../api.js'

export default class SuggestionBox extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      data: []
    }

    this.onSuggestionSubmit = (suggestionJson) => {
      API.submit(
          suggestionJson,
          (data) => {
            console.log(data);
            this.setState({ data: data });
          },
          (data) => console.log('Failed to submit suggestion.')
      );
    }

    this.handleVoteChange = (id, upvote) => {
      if (upvote) {
        API.upvote(
            id,
            (data) => {
              console.log(data);
              this.setState({ data: data });
            },
            (data) => console.log('Failed to upvote suggestion')
        );
      } else {
        API.resetVote(
            id,
            (data) => {
              console.log(data);
              this.setState({ data: data });
            },
            (data) => console.log('Failed to reset suggestion')
        );
      }
    }

  }

  componentDidMount() {
    API.getSuggestionsForCurrentUser(
      (data) => this.setState({ data: data }),
      (err) => console.log('Failed to load initial data.')
    );
  }

  render() {
    return (
      <div>
        <SuggestionList data={this.state.data} handleVoteChange={this.handleVoteChange} />
        <SuggestionForm onSuggestionSubmit={ this.onSuggestionSubmit }/>
      </div>
    );
  }

}
