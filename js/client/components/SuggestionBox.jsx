import SuggestionList from './SuggestionList.jsx'
import SuggestionForm from './SuggestionForm.jsx'
import React from 'react';
import API from '../api.js'

export default class SuggestionBox extends React.Component {
    render() {
    return (
      <div>
        <SuggestionList suggestions={this.props.suggestions} handleVoteChange={this.props.handleVoteChange} />
        <SuggestionForm onSuggestionSubmit={ this.props.onSuggestionSubmit }/>
      </div>
    );
  }
}
