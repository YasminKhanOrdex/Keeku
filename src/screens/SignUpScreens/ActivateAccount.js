import NetInfo from '@react-native-community/netinfo';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell
} from 'react-native-confirmation-code-field';
import { Button } from 'react-native-paper';
import { RFValue } from 'react-native-responsive-fontsize';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ApiManager from '../../apiManager/ApiManager';
import * as Colors from '../../res/colors';
import * as Constants from '../../res/strings';
import Loader from '../../sharedComponents/Loader';
import BackArrow from '../../assets/images/back_arrow.svg';
import globalStyles from '../../res/styles';
const CELL_COUNT = 6;
let userData;

const ActivateAccount = (props) => {
  userData = props.route.params.data;
  const [value, setValue] = useState('');
  const [isLoaderVisible, setLoaderVisible] = useState(false);
  const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
  const [dataProps, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={{flex : 1}}>
        <TouchableOpacity style={globalStyles.backArrowStyle} onPress={() => { goBack()}}>
          <BackArrow/>
        </TouchableOpacity>
        <Text style={globalStyles.titleStyle}>
          {Constants.activate_your_account}
        </Text>
        <Text style={globalStyles.instructionStyle}>
          {Constants.activate_code_instruction}
        </Text>

        <CodeField
          ref={ref}
          {...dataProps}
          value={value}
          onChangeText={setValue}
          cellCount={CELL_COUNT}
          rootStyle={styles.codeFieldRoot}
          keyboardType="number-pad"
          autoFocus={true}
          textContentType="oneTimeCode"
          renderCell={({index, symbol, isFocused}) => (
            <Text
              key={index}
              style={[styles.cell, isFocused && styles.focusCell]}
              onLayout={getCellOnLayoutHandler(index)}>
              {symbol || (isFocused ? <Cursor /> : null)}
            </Text>
          )}
        />

        <Button style={[{...globalStyles.btnStyle, marginTop: RFValue(25)}]} 
          uppercase={true} 
          mode="contained" 
          onPress={() => { validateFields()}}
          labelStyle = {globalStyles.btnLabelStyle}>
          {Constants.continues}
        </Button>

        <View style={styles.bottomContainer}>
          <Text style={styles.textStyle}>
            {Constants.didnt_get_code}
            <Text
              style={{...styles.textStyle, fontFamily: Constants.font_bold}}
              onPress={() => resendCode()
              }>
              {Constants.resend_now}
            </Text>
          </Text>
        </View>

        { 
          isLoaderVisible && <Loader/>
        }
         
      </View>
    </SafeAreaView>
  );

  function validateFields () {
    let code = value.toString();
    if(code.length < 1) {
      showAlert(Constants.invalid, Constants.activation_code_is_required);
    } else if(code.length < 6){
      showAlert(Constants.invalid, Constants.activation_code_must_be_six_chars);
    } else{
      verifyActivationCode(code);
    }
  }

  function showAlert (title, msg) {
    Alert.alert(title, msg);
  }

  function clearCode (){
    setValue('');
  }

  function resendCode(){
    const onSuccess = (data) => {
      clearCode();
      hideIndicator();
      showAlert(Constants.success, data.message);
    };

    const onFailure = (message) => {
      clearCode();
      hideIndicator();
    };

    NetInfo.fetch().then(state => {
      if(state.isConnected){
          showIndicator();
          ApiManager.resendActivationCode(userData.userId)
            .then(onSuccess)
            .catch(onFailure);
      } else {
          showAlert(Constants.network, Constants.please_check_internet);
      }
    });
  }

  function verifyActivationCode(code){
    const onSuccess = (response) => {
      hideIndicator();
      if(response.success === 0){
        gotoCredentialsScreen(response);
      } else {
        clearCode();
        showAlert(Constants.invalid, response.message);
      }
    };

    const onFailure = (message) => {
      clearCode();
      hideIndicator();
    };

    NetInfo.fetch().then(state => {
      if(state.isConnected){
          showIndicator();
          ApiManager.verifyActivationCode(userData.userId, code, true)
            .then(onSuccess)
            .catch(onFailure);
      } else {
          showAlert(Constants.network, Constants.please_check_internet);
      }
    });
  }

  function gotoCredentialsScreen() {
    props.navigation.navigate(Constants.screen_set_your_credentials, userData); 
  }

  function showIndicator(){
    setLoaderVisible(true);
  }

  function hideIndicator(){
    setLoaderVisible(false);
  }

  function goBack(){
    props.navigation.goBack();
  }
};

const styles = StyleSheet.create({
  textStyle: {
    fontSize: RFValue(13),
    fontFamily: Constants.font_regular,
    color: Colors.color_black,
    textAlign: 'center',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: RFValue(10),
    justifyContent: 'center',
    alignSelf: 'center',
    flexDirection: 'column',
    width: '100%',
  },
  codeFieldRoot: {marginTop: RFValue(25)},
  cell: {
    width: RFValue(35),
    height: RFValue(40),
    lineHeight: RFValue(33),
    fontSize: RFValue(20),
    borderWidth: RFValue(1),
    borderColor: Colors.color_light_grey,
    textAlign: 'center',
    borderRadius: RFValue(2),
    fontFamily: Constants.font_regular,
  },
  focusCell: {
    borderColor: Colors.color_black,
  }
});

export default ActivateAccount;
