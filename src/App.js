import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import * as CustomPaperTheme from './customviews/CustomPaperTheme';
import SplashScreen from './screens/OtherScreens/Splash';
import Paginator from './screens/OtherScreens/Paginator';
import { Component } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScene from './scenes/LoginScene/LoginScene';
import SignUpScene from './scenes/SignUpScene/SignUpScene';
import MainScene from './scenes/MainScene/MainScene';
import ResetPasswordScene from './scenes/ResetPasswordScene/ResetPasswordScene';
import * as Constants from './res/strings';
import { Linking, LogBox, Text } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import environment from './environment/env';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import { storeDynamicLinkData } from './localStorage/UserData';

LogBox.ignoreLogs([
  'Animated: `useNativeDriver` was not specified.',
]);

LogBox.ignoreAllLogs()

const Screens = {
  Splash: 'Splash',
  OnBoarding: 'OnBoarding',
  Main: 'Main',
  Login: 'Login',
  SignUp: 'SignUp',
  ResetPassword: 'ResetPassword',
};

let forgotPasswordUserId;


class App extends Component {

  constructor(props) {
    super(props);
    this.disableSystemFontSize();
    this.gotoMain = this.gotoMain.bind(this);
    this.gotoLogin = this.gotoLogin.bind(this);
    this.gotoSignUp = this.gotoSignUp.bind(this);
    this.logout = this.logout.bind(this);
    this.state = {
      screen: Screens.Splash,
      deviceId: ""
    };
  }

  render() {
    let viewToShow = null;
    switch (this.state.screen) {
      case Screens.Splash:
        viewToShow = <SplashScreen />
        break;

      case Screens.OnBoarding:
        viewToShow = <Paginator
          gotoSignUp={this.gotoSignUp}
          gotoMain={this.gotoMain}
          gotoLogin={this.gotoLogin} />
        break;

      case Screens.Login:
        viewToShow = <LoginScene
          deviceToken={this.state.deviceId}
          gotoSignUp={this.gotoSignUp}
          gotoMain={this.gotoMain} />
        break;

      case Screens.SignUp:
        viewToShow = <SignUpScene
          gotoLogin={this.gotoLogin}
          gotoMain={this.gotoMain} />
        break;

      case Screens.ResetPassword:
        viewToShow = <ResetPasswordScene
          userId={forgotPasswordUserId}
          gotoLogin={this.gotoLogin} />
        break;

      case Screens.Main:
        viewToShow = <MainScene
          gotoSignUp={this.gotoSignUp}
          gotoLogin={this.gotoLogin}
          logout={this.logout} />
        break;

      default:
        break;
    }
    return (
      <PaperProvider theme={CustomPaperTheme.theme}>
        {viewToShow}
      </PaperProvider>
    );
  }

  async componentDidMount() {
    let url = await dynamicLinks().getInitialLink();
    url && storeDynamicLinkData(url.url)
    Linking.addEventListener("url", this.handleOpenURL);
    setTimeout(() => {
      this.handleDeepLinkingRequests();
    }, 2500)
  }

  handleOpenURL = (event) => {
    let url;
    if (event.url) {
      url = event.url;
    } else {
      url = event;
    }
    if (url) {
      let prefixUrl = environment.getResetPasswordPrefix();
      if (url.startsWith(prefixUrl)) {
        forgotPasswordUserId = url.replace(prefixUrl, '');
        this.setState({ screen: Screens.ResetPassword })
      }
    }
  }
  componentWillUnmount() {
    Linking.removeEventListener("url", this.handleOpenURL);
  }

  handleDeepLinkingRequests = () => {
    Linking.getInitialURL()
      .then(url => {
        if (url) {
          this.handleOpenURL(url);
        } else {
          this.checkOnBoardScreen();
        }
      })
      .catch(error => { });
  }

  gotoMain(token) {
    let tokenToStore = token || Constants.guestToken;
    AsyncStorage.setItem(Constants.token, tokenToStore);
    this.setState({ screen: Screens.Main });
  }

  gotoLogin() {
    this.setState({ screen: Screens.Login });
  }

  gotoSignUp() {
    this.setState({ screen: Screens.SignUp });
  }

  logout() {
    AsyncStorage.clear().then(() => {
      AsyncStorage.setItem(Constants.isAlreadyLaunched, 'yes');
      this.setState({ screen: Screens.Login });
    });
  }

  checkOnBoardScreen = () => {
    AsyncStorage.getItem(Constants.isAlreadyLaunched).then(value => {
      if (value == null) {
        AsyncStorage.setItem(Constants.isAlreadyLaunched, 'yes');
        this.setState({ screen: Screens.OnBoarding });
      } else {
        this.checkNextScreen();
      }
    })
  }

  checkNextScreen = () => {
    AsyncStorage.getItem(Constants.token).then((token) => {
      if (token) {
        this.setState({ screen: Screens.Main });
      } else {
        this.setState({ screen: Screens.Login });
      }
    })
  }

  disableSystemFontSize() {
    Text.defaultProps = {
      ...(Text.defaultProps || {}),
      allowFontScaling: false,
    };
    TextInput.defaultProps = {
      ...(TextInput.defaultProps || {}),
      allowFontScaling: false,
    };
    Button.defaultProps = {
      ...(Button.defaultProps || {}),
      allowFontScaling: false,
    };
    DateTimePickerModal.defaultProps = {
      ...(DateTimePickerModal.defaultProps || {}),
      allowFontScaling: false,
    };
  }

}

export default App;