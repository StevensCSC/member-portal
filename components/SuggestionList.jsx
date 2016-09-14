import React from 'react';
import Suggestion from './Suggestion.jsx'

export default class SuggestionList extends React.Component {

  render() {
    var that = this;

    var suggestionNodes = this.props.data.map(function (suggestion) {
      return (
        <Suggestion
          id={suggestion.id}
          title={suggestion.title}
          desc={suggestion.desc}
          link={suggestion.link}
          userUpvoted={suggestion.userUpvoted}
          voteCount={suggestion.voteCount}
          key={suggestion.id}
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
    data: []
}
