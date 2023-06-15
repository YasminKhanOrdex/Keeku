import React, { Component } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { RFValue } from 'react-native-responsive-fontsize';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppLogo from '../../assets/images/keeku_logo.svg';
import * as Colors from '../../res/colors';
import * as Constants from '../../res/strings';
import Loader from '../../sharedComponents/Loader';
import NetInfo from '@react-native-community/netinfo';
import * as ApiManager from '../../apiManager/ApiManager';
import * as ManageUserData from '../../localStorage/UserData';
import globalStyles from '../../res/styles';
import dynamicLinks from '@react-native-firebase/dynamic-links';

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.deviceToken = this.props.extraData.deviceToken;
    this.state = {
      rememberMe: false,
      email: '',
      password: '',
      isLoaderVisible: false,
    };
  }

  getParameterFromUrl = (url, parm) => {
    var re = new RegExp('.*[?&]' + parm + '=([^&]+)(&|$)');
    var match = url.match(re);
    return match ? match[1] : '';
  };

  handleDynamicLink = link => {
    if (link?.url) {
      const post_id = this.getParameterFromUrl(link?.url, 'post_id');
      const response_id = this.getParameterFromUrl(link?.url, 'response_id');
      console.log('response_id', post_id, response_id)
      if (response_id) {
        let paramsReview = {
          reviewId: post_id,
          responseId: response_id
        }
        console.log('paramsReview', paramsReview)
        NetInfo.fetch().then(state => {
          if (state.isConnected) {
            var myHeaders = new Headers();
            myHeaders.append("Content-type", "application/json");
            ApiManager.getReviewDetails(paramsReview, myHeaders)
              .then(success => {
                let data = success.data;
                console.log('data', data)
                this.props.navigation.push(Constants.screen_nested_review, { item: data, responce1: data?.response, responce2: data?.response?.response, responce3: data?.response?.response?.response, responce4: data?.response?.response?.response?.response });
              }).catch(error => {
                console.log(error);
              });
          } else {
            Alert.alert(Constants.network, Constants.please_check_internet);
          }
        });
      } else {
        this.props.navigation.navigate(Constants.screen_review_detail, { item: { id: post_id } })
      }
    }
  };

  componentDidMount() {
    const unsubscribe = dynamicLinks().onLink(this.handleDynamicLink);
    return () => unsubscribe();
  }

  render() {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={{ flex: 1 }}>
          <AppLogo style={globalStyles.appLogoStyle} />
          <Text style={globalStyles.titleStyle}>{Constants.welcome}</Text>
          <Text style={globalStyles.instructionStyle}>
            {Constants.please_enter_your}
          </Text>
          <TextInput
            style={[{ ...globalStyles.textInputStyle, marginTop: RFValue(12) }]}
            selectionColor={Colors.color_black}
            label={Constants.username_or_email}
            mode="outlined"
            dense={true}
            returnKeyType="next"
            textContentType="emailAddress"
            onSubmitEditing={() => {
              this.passwordTextInput.focus();
            }}
            blurOnSubmit={false}
            onChangeText={text => {
              this.state.email = text.trim();
            }}
          />
          <TextInput
            ref={input => {
              this.passwordTextInput = input;
            }}
            style={[{ ...globalStyles.textInputStyle, marginTop: RFValue(12) }]}
            selectionColor={Colors.color_black}
            label={Constants.password}
            mode="outlined"
            dense={true}
            returnKeyType="done"
            textContentType="password"
            secureTextEntry={true}
            onChangeText={text => {
              this.state.password = text;
            }}
          />
          <Text style={styles.forgotPasswordStyle}
            onPress={() => { this.goToForgotPassword() }}>
            {Constants.forgot_password}
          </Text>
          <Button
            style={[{ ...globalStyles.btnStyle, marginTop: RFValue(12) }]}
            labelStyle={globalStyles.btnLabelStyle}
            uppercase={true}
            mode="contained"
            onPress={() => {
              this.validateFields();
            }}>
            {Constants.sign_in}
          </Button>

          {/* <View style={styles.checkboxContainer}>
            <CheckBox
              isChecked={this.state.rememberMe}
              onClick={() =>
                this.setState({rememberMe: !this.state.rememberMe})
              }
              style={styles.checkbox}
              uncheckedCheckBoxColor={Colors.color_gray}
              checkedCheckBoxColor={Colors.color_black}
              tintColors={{true: Colors.color_black}}
            />
            <Text style={styles.textStyle} onPress={() => {this.setState({rememberMe: !this.state.rememberMe})}}>{Constants.remember_me}</Text> 
          </View> */}

          <View style={styles.bottomContainer}>
            <Text style={styles.rememberMeStyle}>
              {Constants.dont_have_acccount}
              <Text
                style={{
                  ...styles.rememberMeStyle,
                  fontFamily: Constants.font_bold,
                }}
                onPress={() => this.goToSignup()}>
                {Constants.create_your_now}
              </Text>
            </Text>
            <Text
              style={{
                ...styles.rememberMeStyle,
                fontFamily: Constants.font_bold,
                marginTop: 5,
              }}
              onPress={() => { this.continueAsGuest() }}>
              {Constants.continue_as_guest}
            </Text>
          </View>
          {this.state.isLoaderVisible && <Loader />}
        </View>
      </SafeAreaView>
    );
  }

  continueAsGuest = () => {
    this.props.extraData.screenProps.gotoMain();
  }

  goToSignup = () => {
    this.props.extraData.screenProps.gotoSignUp();
  };

  validateFields = () => {
    let title = Constants.invalid;
    if (this.state.email.length < 1) {
      this.showAlert(title, Constants.username_is_required);
    } else if (this.state.password.length < 1) {
      this.showAlert(title, Constants.password_is_required);
    } else if (this.state.password.length < 8) {
      this.showAlert(title, Constants.password_must_be_eight_chars);
    } else {
      this.authenticateUser();
    }
  };

  showAlert = (title, msg) => {
    Alert.alert(title, msg);
  };

  authenticateUser = () => {
    let dataToPass = {
      userName: this.state.email.toLowerCase(),
      email: this.state.email.toLowerCase(),
      password: this.state.password,
      deviceToken: this.deviceToken
    };
    const onSuccess = (response) => {
      this.hideIndicator();
      if (response.success === 0) {
        ManageUserData.saveUserData(response.data);
        this.gotoMainScreen(response.token);
      } else {
        this.showAlert(Constants.invalid, Constants.invalid_username_password);
      }
    };

    const onFailure = (message) => {
      this.hideIndicator();
    };

    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        this.showIndicator();
        ApiManager.authenticate(dataToPass, true)
          .then(onSuccess)
          .catch(onFailure);
      } else {
        this.showAlert(Constants.network, Constants.please_check_internet);
      }
    });
  };

  gotoMainScreen = (token) => {
    this.props.extraData.screenProps.gotoMain(token);
  }

  showIndicator = () => {
    this.setState({
      isLoaderVisible: true
    })
  };

  hideIndicator = () => {
    this.setState({
      isLoaderVisible: false
    })
  };

  goToForgotPassword = () => {
    this.props.navigation.navigate(Constants.screen_forgot_password);
  }
}

const styles = StyleSheet.create({
  forgotPasswordStyle: {
    marginTop: RFValue(5),
    textAlign: 'right',
    color: Colors.color_black,
    fontSize: RFValue(12),
    fontFamily: Constants.font_semibold,
    alignSelf: 'flex-end'
  },
  checkboxContainer: {
    flexDirection: "row",
    marginTop: RFValue(10),
    alignItems: "center",
  },
  checkbox: {
    alignSelf: "center"
  },
  rememberMeStyle: {
    fontSize: RFValue(13),
    fontFamily: Constants.font_regular,
    color: Colors.color_black,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: RFValue(10),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    width: '100%',
  },
  textStyle: {
    fontSize: RFValue(13),
    fontFamily: Constants.font_regular,
    color: Colors.color_black,
    textAlign: "center",
    paddingLeft: RFValue(5)
  },
});
