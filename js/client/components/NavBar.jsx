import React from 'react';

export default class NavBar extends React.Component {

  getNavList() {
    switch (this.props.loginStatus) {
    case 0:
    case 1:
      return (
        <li>
          <a href={this.props.login}>Login</a>
        </li>
      );
    case 2:
      return (
        <li>
          <a onClick={this.props.logout}>Logout</a>
        </li>
      );
    }
  }

  render() {
    return (
      <nav className="navbar navbar-inverse navbar-fixed-top" role="navigation">
        <div className="container">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <a className="navbar-brand" href="#">SCSC</a>
          </div>
          <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
            <ul className="nav navbar-nav">
              {this.getNavList()}
            </ul>
          </div>
        </div>
      </nav>
    );
  }
}
