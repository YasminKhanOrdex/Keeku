import React, { Component } from 'react';
import SignUpStackNav from '../../navigation/SignUpStackNav';

export default class SignUpScene extends Component {
  constructor(props) {
    super(props);
    this.gotoLogin = this.gotoLogin.bind(this);
    this.gotoMain = this.gotoMain.bind(this);
    this.onSignupCompleted = this.onSignupCompleted.bind(this);
  }

  gotoMain() {
    this.props.gotoMain();
  }

  gotoLogin () {
    this.props.gotoLogin();
  }

  onSignupCompleted (token) {
    this.props.gotoMain(token);
  }

  render() {
    return (
      <SignUpStackNav
        screenProps={{
          gotoMain: this.gotoMain,
          gotoLogin: this.gotoLogin,
          onSignupCompleted: this.onSignupCompleted
        }}
      />
    );
  }
}
