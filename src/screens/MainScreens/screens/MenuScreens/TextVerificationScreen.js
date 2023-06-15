import React, {Component, useState} from 'react';
import {Text, TouchableOpacity, View, StyleSheet, Alert} from 'react-native';
import * as Constants from '../../../../res/strings';
import {RFValue} from 'react-native-responsive-fontsize';
import {Button} from 'react-native-paper';
import * as Colors from '../../../../res/colors';
import BackMenuBar from '../../../../sharedComponents/BackMenuBar';
import NetInfo from '@react-native-community/netinfo';
import globalStyles from '../../../../res/styles';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import * as ApiManager from '../../../../apiManager/ApiManager';
import Loader from '../../../../sharedComponents/Loader';
import * as UserData from '../../../../localStorage/UserData';
const CELL_COUNT = 4;
let propsData;

const TextVerificationScreen = props => {
  propsData = props.route.params;
  const [value, setValue] = useState('');
  const [isLoaderVisible, setLoaderVisible] = useState(false);
  const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
  const [dataProps, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  return (
    <View style={{flex: 1,backgroundColor:Colors.color_white}}>
      { isLoaderVisible && <Loader/> }
      <BackMenuBar title={Constants.text_verification}
      action={() => {
        props.navigation.goBack();
      }}  
      />
      <View style={styles.maincontainer}>
        <Text style={styles.codeText}>{Constants.enter_code}</Text>
        <View style={{marginRight:RFValue(110)}}>
        <CodeField
          value={value}
          onChangeText={setValue}
          cellCount={CELL_COUNT}
          rootStyle={styles.codeFieldRoot}
          autoFocus={true}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          renderCell={({index, symbol, isFocused}) => (
            <Text
              
              key={index}
              style={[styles.cell, isFocused && styles.focusCell]}
              onLayout={getCellOnLayoutHandler(index)}>
              {symbol || (isFocused ? <Cursor /> : null)}
            </Text>
          )}
        /></View>
        <Button
          style={[{...globalStyles.btnStyle, marginTop: RFValue(45), marginHorizontal : RFValue(14)}]}
          uppercase={true}
          mode="contained"
          onPress={() => {
            validateFields();
          }}
          labelStyle={globalStyles.btnLabelStyle}>
          {Constants.continues}
        </Button>

        <Text style={styles.textStyle}>
          {Constants.didnt_get_code_verification}
          <Text
            style={{...styles.textStyle, fontFamily: Constants.font_bold}}
            onPress={() => sendOTP()}>
            {Constants.resend_now}
          </Text>
        </Text>
      </View>
    </View>
  );

  function validateFields() {
    let code = value.toString();
    if (code.length < 1) {
      showAlert('', Constants.verification_code_is_required);
    } else if (code.length < 4) {
      showAlert('', Constants.invalid_otp);
    } else {
      verifyActivationCode(code);
    }
  }

  function showAlert(title, msg) {
    Alert.alert(title, msg);
  }

  function sendOTP() {
    NetInfo.fetch().then(state => {
      if(state.isConnected){
        showIndicator();
        ApiManager.sendOTP(propsData, true)
        .then((response) => {
          clearCode();
          hideIndicator();
          response.success === 0 ? showAlert('', Constants.otp_sent_again) : showAlert('', Constants.invalid_phone_number);
        })
        .catch(() => {
          hideIndicator();
        });
      } else {
        showAlert(Constants.network, Constants.please_check_internet);
      }
    });
  }

  function clearCode (){
    setValue('');
  }

  function verifyActivationCode(code){
    const onSuccess = (response) => {
      if(response.success === 0){
        getUserDetails(propsData.userId);
      } else {
        hideIndicator();
        clearCode();
        showAlert('', Constants.invalid_otp);
      }
    };

    const onFailure = (message) => {
      clearCode();
      hideIndicator();
    };

    NetInfo.fetch().then(state => {
      if(state.isConnected){
          showIndicator();
          ApiManager.verifyOTP(propsData.userId, code, true)
            .then(onSuccess)
            .catch(onFailure);
      } else {
          showAlert(Constants.network, Constants.please_check_internet);
      }
    });
  }

  function showIndicator(){
    setLoaderVisible(true);
  }

  function hideIndicator(){
    setLoaderVisible(false);
  }

  function getUserDetails(userId){
    const onSuccess = (response) => {
      hideIndicator();
      if(response.success === 0){
        let userData = response.data;
        UserData.saveUserData(userData);
        let textVerified = userData.textVerified;
        let identityVerified = userData.veriffFlag;
        let showCongratsScreen = userData.showCongratsScreen;
        if(textVerified && identityVerified && showCongratsScreen){
          gotoCongratulationScreen();
        } else {
          gotoVerifyIdentityScreen();
        }
      }
    };

    const onFailure = (message) => {
      hideIndicator();
    };

    NetInfo.fetch().then(state => {
      if(state.isConnected){
          ApiManager.fetchUserDetails(userId, true)
            .then(onSuccess)
            .catch(onFailure);
      } else {
          showAlert(Constants.network, Constants.please_check_internet);
      }
    });
  }

  function gotoCongratulationScreen(){
    props.navigation.navigate(Constants.screen_congratulation, {isTextVerification : true});
  }

  function gotoVerifyIdentityScreen(){
    props.navigation.navigate(Constants.screen_verify_identity);
  }
};

const styles = StyleSheet.create({
  codeText: {
    fontFamily: Constants.font_regular,
    color: Colors.color_black,
    fontSize: RFValue(14),
    marginTop: RFValue(16),
    marginHorizontal : RFValue(14)
  },
  maincontainer: {
    flex: 1
  },
  codeFieldRoot: {marginTop: RFValue(25), marginHorizontal : RFValue(8)},
  cell: {
    width: RFValue(48),
    height: RFValue(48),
    fontSize: RFValue(20),
    borderWidth: RFValue(1),
    borderColor: Colors.color_light_grey,
    textAlign: 'center',
    paddingVertical:RFValue(8),
    borderRadius: RFValue(3),
    fontFamily: Constants.font_regular,
    marginHorizontal : RFValue(6)
  },
  focusCell: {
    borderColor: Colors.color_black,
  },
  textStyle: {
    marginTop: RFValue(17),
    fontSize: RFValue(14),
    fontFamily: Constants.font_regular,
    color: Colors.color_black,
    textAlign: 'center',
    marginHorizontal : RFValue(14)
  },
});

export default TextVerificationScreen;
