import React from 'react';

export default class SuggestionForm extends React.Component {

  constructor(props, context) {
    super(props,context);

    this.state = {
      title: "",
      link: "",
      desc: ""
    }

    this.handleTitleChange = (e) => {
      this.setState({ title: e.target.value });
    }

    this.handleLinkChange = (e) => {
      this.setState({ link: e.target.value });
    }

    this.handleDescChange = (e) => {
      this.setState({ desc: e.target.value });
    }

    this.handleSubmit = (e) => {
      e.preventDefault();
      var title = this.state.title.trim();
      var link = this.state.link.trim();
      var desc = this.state.desc.trim();
      if (!title || !link || !desc) {
        return;
      }

      this.props.onSuggestionSubmit({ title: title, link: link, desc: desc });
      this.setState({title: "", link: "", desc: ""});
    }

  }


  render() {
    return (
      <div className="suggestionFormContainer">
        <h1>Suggest a Talk</h1>
        <form className="suggestionForm" onSubmit={ this.handleSubmit }>
          <input
            type="text"
            placeholder="Talk Title"
            value={ this.state.title }
            onChange={ this.handleTitleChange } />
          <input
            type="text"
            placeholder="Link"
            value={ this.state.link }
            onChange={ this.handleLinkChange } />
          <input
            type="text"
            placeholder="Description"
            value={ this.state.desc }
            onChange={ this.handleDescChange } />
          <input type="submit" value="Submit"/>
        </form>
      </div>
    );
  }

}
