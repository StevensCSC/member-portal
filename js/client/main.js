import Suggestion from './components/Suggestion.jsx';
import SuggestionList from './components/SuggestionList.jsx';
import SuggestionBox from './components/SuggestionBox.jsx';
import Root from './components/Root.jsx';
import API from './api.js';
import React from 'react';
import ReactDOM from 'react-dom';

let ghClientId = process.env.NODE_ENV === 'production' ? '0ffffd652180d6e16381' : 'e6ee50c78c3897414fff';

ReactDOM.render(<Root ghClientId={ghClientId} />, document.getElementById('content'));
