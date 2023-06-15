import React, { Component } from 'react';
import ResetPasswordStackNav from '../../navigation/ResetPasswordStackNav';


export default class ResetPasswordScene extends Component {
  constructor(props) {
    super(props);
    this.gotoLogin = this.gotoLogin.bind(this);
  }

  gotoLogin () {
    this.props.gotoLogin();
  }

  render() {
    return (
      <ResetPasswordStackNav
        screenProps={{
          userId : this.props.userId,
          gotoLogin: this.gotoLogin,
        }}
      />
    );
  }
}
