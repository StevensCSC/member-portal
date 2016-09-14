import React from 'react';

export default class Suggestion extends React.Component {
  render() {
    var upvoteArrowClass = this.props.userUpvoted ? "btn btn-secondary btn-sm active" : "btn btn-secondary btn-sm";

    return (
      <div className="suggestion">
        <div className="voteBox">
          <button type="button" className={upvoteArrowClass} onClick={() => this.props.handleVoteChange(this.props.id, !this.props.userUpvoted)}>^</button>
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
