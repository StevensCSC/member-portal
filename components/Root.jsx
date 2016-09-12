import SuggestionBox from './SuggestionBox.jsx'
import React from 'react'
import API from '../api.js'

export default class Root extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      userLoggedIn: false
    }
  }

  componentDidMount () {
    API.userPermissions(
      (data) => {
        console.log('got data: ' + data);
        this.setState(data);
      },
      (data) => { console.log("error getting user credentials"); }
    );
  }

  render() {
    if (this.state.userLoggedIn) {
      return <SuggestionBox />;
    } else {
      return <a href="https://github.com/login/oauth/authorize?scope=read:org&client_id=0ffffd652180d6e16381">Log in first!</a>;
    }
  }

}
