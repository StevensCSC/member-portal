import React from 'react';

export default class Suggestion extends React.Component {
  render() {
    var upvoteArrowClass = this.props.userUpvoted ? "upvote-arrow active" : "upvote-arrow inactive";

    return (
      <div className="suggestion">
        <div className="voteBox">
          <a className={upvoteArrowClass} onClick={() => this.props.handleVoteChange(this.props.id, !this.props.userUpvoted)}>▲</a>
          <div className="voteCount">{ this.props.voteCount }</div>
        </div>
        <div className="suggestionInfo">
          <a target="_blank" href={ this.props.link }>{ this.props.title }</a>
          <p>{ this.props.desc }</p>
        </div>
      </div>
    );
  }
}
