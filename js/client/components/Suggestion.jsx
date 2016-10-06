import React from 'react';

export default class Suggestion extends React.Component {

  getControls() {
    if (this.props.userRole === 'admin') {
      return (
        <div className="controls">
          <a className="removeButton" onClick={() => this.props.handleRemove(this.props.id)}>x</a>
          <a className="archiveButton" onClick={() => this.props.handleArchive(this.props.id)}>a</a>
        </div>
      );
    } else {
      return (
        <div className="controls">
        </div>
      );
    }
  }

  render() {
    var upvoteArrowClass = this.props.userUpvoted ? "upvote-arrow active" : "upvote-arrow inactive";

    return (
      <div className="suggestion">
        {this.getControls()}
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
