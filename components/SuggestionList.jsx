import React from 'react';
import Suggestion from './Suggestion.jsx'

export default class SuggestionList extends React.Component {

  render() {
    var that = this;

    var suggestionNodes = this.props.suggestions.map(function (suggestion) {
      return (
        <Suggestion
          id={suggestion.suggestion_id}
          title={suggestion.title}
          desc={suggestion.description}
          link={suggestion.link}
          userUpvoted={suggestion.userupvoted}
          voteCount={suggestion.votes}
          key={suggestion.suggestion_id}
          handleVoteChange={that.props.handleVoteChange} />
      );
    });

    return (
      <div className="suggestionList">
        {suggestionNodes}
      </div>
    );
  }
}

SuggestionList.defaultProps = {
    suggestions: []
}
