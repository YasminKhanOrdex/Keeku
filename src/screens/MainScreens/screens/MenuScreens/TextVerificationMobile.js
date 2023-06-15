import React, { Component } from 'react';
import { Text, TouchableOpacity, View, StyleSheet, Alert } from 'react-native';
import * as Constants from '../../../../res/strings';
import { RFValue } from 'react-native-responsive-fontsize';
import TextVerification from '../../../../assets/images/icn_text_verification.svg';
import RightArrow from '../../../../assets/images/icn_black_right_arrow.svg';
import IdentitiyIcon from '../../../../assets/images/icn_id_card.svg';
import DropDownIcon from '../../../../assets/images/icn_drop_down.svg';
import * as Colors from '../../../../res/colors';
import BackMenuBar from '../../../../sharedComponents/BackMenuBar';
import * as UserData from '../../../../localStorage/UserData';
import NetInfo from '@react-native-community/netinfo';
import * as ApiManager from '../../../../apiManager/ApiManager';
import Loader from '../../../../sharedComponents/Loader';
import globalStyles from '../../../../res/styles';
import { Button, TextInput } from 'react-native-paper';
import { TextInputMask } from 'react-native-masked-text';
import * as Utils from '../../../../utils/Utils';
import CountryPicker from 'react-native-country-picker-modal';

const myCountryCodeList = ['US', 'IN'];

export default class TextVerificationMobile extends Component {
  constructor(props) {
    super(props);
    this.onBackPress = this.onBackPress.bind(this);
    this.state = {
      isLoaderVisible: false,
      mobileNumber: '',
      selectedCountryCode: 'US',
      showCountryList: false
    };
  }

  render() {
    this.props.route.params?.hideBottomBar();
    return (
      <View style={styles.mainContainer}>
        {this.state.isLoaderVisible && <Loader />}
        <BackMenuBar title={Constants.text_verification}
          action={this.onBackPress} />
        <View style={styles.subContainer}>
          <Text style={styles.textStyle}>{Constants.enter_your_mobile}</Text>
          <TextInput
            ref={(input) => { this.countryPicker = input; }}
            style={styles.countryTextInputStyle}
            selectionColor={Colors.color_black}
            label={Constants.country_code}
            mode='outlined'
            dense={true}
            pointerEvents='none'
            editable={false}
            blurOnSubmit={false}
            value={'   '}
          />

          <View style={styles.countryPickerContainerStyle}>
            <View style={{ marginHorizontal: RFValue(10) }}>
              <CountryPicker
                visible={this.state.showCountryList}
                countryCode={this.state.selectedCountryCode}
                withFilter={false}
                countryCodes={myCountryCodeList}
                withFlag={true}
                withCountryNameButton={false}
                withCallingCodeButton={true}
                withAlphaFilter={false}
                withCallingCode={true}
                withEmoji={true}
                onSelect={(country) => {
                  this.setState({
                    selectedCountryCode: country.cca2
                  })
                }}
                onClose={() => {
                  this.setState({
                    showCountryList: false
                  })
                }}
              />
            </View>
          </View>

          <TouchableOpacity activeOpacity={1} style={styles.dropdownIconContainer} onPress={() => {
            this.setState({
              showCountryList: true
            })
          }}>
            <DropDownIcon height={RFValue(10)} width={RFValue(12)} />
          </TouchableOpacity>

          <TextInput
            style={styles.textInputPhoneNumberStyle}
            selectionColor={Colors.color_black}
            label={Constants.phone_number}
            render={props =>
              <TextInputMask
                {...props}
                type={"custom"}
                options={{ mask: "(999) 999-9999" }}
                maxLength={14}
              />
            }
            dense={true}
            mode='outlined'
            returnKeyType='done'
            textContentType='telephoneNumber'
            keyboardType='number-pad'
            onChangeText={(text) => { this.state.mobileNumber = text.trim() }}
          />
        </View>
        <Button
          style={[{ ...globalStyles.btnStyle, position: 'absolute', bottom: RFValue(15), right: RFValue(15), left: RFValue(15) }]}
          labelStyle={globalStyles.btnLabelStyle}
          uppercase={true}
          mode="contained"
          onPress={() => { this.validateFields() }}>
          {Constants.send_code}
        </Button>
      </View>
    );
  }

  validateFields() {
    let mobile = Utils.getNumericString(this.state.mobileNumber);
    if (mobile.length < 10) {
      this.showAlert(Constants.invalid, Constants.enter_registered_number);
    } else {
      this.checkExistingNumber(mobile);
    }
  }

  gotoTextVerificationScreen(data) {
    setTimeout(() => {
      this.props.navigation.navigate(Constants.screen_text_verification, data);
    }, 0);
  }

  checkExistingNumber = (mobile) => {
    const onSuccess = (response) => {
      if (response.success === 0) {
        UserData.getUserData().then((data) => {
          this.sendOTP(mobile, data.userId);
        });
      } else {
        this.hideIndicator();
        this.showAlert('', Constants.existing_number_error);
      }
    };

    const onFailure = (message) => {
      this.hideIndicator();
    };

    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        this.showIndicator();
        ApiManager.checkExistingNumber(mobile, true)
          .then(onSuccess)
          .catch(onFailure);
      } else {
        this.showAlert(Constants.network, Constants.please_check_internet);
      }
    });
  }

  sendOTP = (mobile, userId) => {
    let data = {
      userId: userId,
      countryCode: this.state.selectedCountryCode.toLowerCase(),
      phoneNumber: mobile
    };
    const onSuccess = (response) => {
      if (response.success === 0) {
        this.hideIndicator();
        this.gotoTextVerificationScreen(data);
      } else {
        this.hideIndicator();
        this.showAlert('', Constants.invalid_phone_number);
      }
    };

    const onFailure = (message) => {
      this.hideIndicator();
    };

    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        ApiManager.sendOTP(data, true)
          .then(onSuccess)
          .catch(onFailure);
      } else {
        this.showAlert(Constants.network, Constants.please_check_internet);
      }
    });
  }

  showAlert(title, msg) {
    Alert.alert(title, msg);
  }

  setShowDropDown(value) {
    this.setState({
      isDropDownVisible: value
    })
  }

  onBackPress() {
    this.props.route.params?.callBack();
    this.props.navigation.goBack();
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
}
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.color_white
  },
  subContainer: {
    padding: RFValue(15)
  },
  textStyle: {
    fontFamily: Constants.font_regular,
    fontSize: RFValue(14),
    color: Colors.color_black,
    marginBottom: RFValue(10)
  },
  countryTextInputStyle: {
    backgroundColor: Colors.color_white,
    height: 40,
    position: 'absolute',
    left: RFValue(15),
    right: RFValue(15),
    fontSize: RFValue(14),
    top: 60
  },
  countryPickerContainerStyle: {
    height: 40,
    position: 'absolute',
    justifyContent: 'center',
    left: RFValue(15),
    right: RFValue(15),
    top: 68
  },
  textInputPhoneNumberStyle: {
    minHeight: 40,
    position: 'absolute',
    fontSize: RFValue(14),
    backgroundColor: Colors.color_white,
    left: RFValue(15),
    right: RFValue(15),
    justifyContent: 'center',
    alignContent: 'center',
    top: 125
  },
  dropdownIconContainer: {
    position: 'absolute',
    top: 67,
    right: RFValue(25),
    height: 40,
    justifyContent: 'center'
  }
});