import React, { Component } from 'react';
import MainStackNav from '../../navigation/MainStackNavigation';
import { TextInput } from 'react-native';

export default class MainScene extends Component {
  constructor(props) {
    super(props);
    TextInput.defaultProps = {
      ...(TextInput.defaultProps || {}),
      allowFontScaling: false,
    };
    this.gotoLogin = this.gotoLogin.bind(this);
    this.gotoSignUp = this.gotoSignUp.bind(this);
    this.logout = this.logout.bind(this);
  }

  gotoLogin() {
    this.props.gotoLogin();
  }

  gotoSignUp() {
    this.props.gotoSignUp();
  }

  logout() {
    this.props.logout();
  }

  render() {
    return (
      <MainStackNav
        screenProps={{
          gotoSignUp: this.gotoSignUp,
          gotoLogin: this.gotoLogin,
          logout: this.logout,
        }}
      />
    );
  }
}
