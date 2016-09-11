import SuggestionList from './SuggestionList.jsx'
import SuggestionForm from './SuggestionForm.jsx'
import React from 'react';
import API from '../api.js'

export default class SuggestionBox extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      data: [
        {
          id: 1,
          title: "The Evolution of Javascript",
          desc: "Netflix talk on ES6 & ES7.",
          link: "https://www.youtube.com/watch?v=DqMFX91ToLw",
          votes: 5,
          upvoted: true
        },
        {
          id: 2,
          title: "Another Talk",
          desc: "Description of talk",
          link: "https://www.youtube.com/watch?v=DqMFX91ToLh",
          votes: 10,
          upvoted: false
        }
      ],
      id: 3
    }

    this.onSuggestionSubmit = (suggestionJson) => {
      API.submit(
          suggestionJson,
          (data) => console.log(data),
          (data) => console.log('Failed to submit suggestion.')
      );
    }

    this.handleVoteChange = (id, upvote) => {
      if (upvote) {
        API.upvote(
            id,
            (data) => console.log(data),
            (data) => console.log('Failed to upvote suggestion')
        );
      } else {
        API.resetVote(
            id,
            (data) => console.log(data),
            (data) => console.log('Failed to reset suggestion')
        );
      }
    }

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
