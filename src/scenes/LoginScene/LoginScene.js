import React, { Component } from 'react';
import LoginStackNav from '../../navigation/LoginStackNav';


export default class LoginScene extends Component {
  constructor(props) {
    super(props);
    this.gotoSignUp = this.gotoSignUp.bind(this);
    this.gotoMain = this.gotoMain.bind(this);
  }

  gotoSignUp() {
    this.props.gotoSignUp();
  }

  gotoMain(token) {
    this.props.gotoMain(token);
  }

  render() {
    return (
      <LoginStackNav
        deviceToken={this.props.deviceToken}
        screenProps={{
          gotoMain: this.gotoMain,
          gotoSignUp: this.gotoSignUp
        }}
      />
    );
  }
}
