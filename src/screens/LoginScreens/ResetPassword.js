import React, { Component } from 'react';
import { Alert, Text, View } from 'react-native';
import { RFValue } from "react-native-responsive-fontsize";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Colors from '../../res/colors';
import * as Constants from '../../res/strings';
import Loader from '../../sharedComponents/Loader';
import AppLogo from '../../assets/images/keeku_logo.svg';
import { Button, TextInput } from 'react-native-paper';
import Utils from '../../utils/Utils';
import NetInfo from '@react-native-community/netinfo';
import * as ApiManager from '../../apiManager/ApiManager';
import globalStyles from '../../res/styles';

class ResetPassword extends Component {

    constructor(props){  
        super(props);  
        this.state = {  
            isLoaderVisible : false,
            password : '',
            confirmPassword : ''
        }
        this.userId = this.props.extraData.screenProps.userId;
    }  

    render() {
        return (
          <SafeAreaView style={globalStyles.container}>
            <View style={{flex : 1}}>
              <AppLogo style={globalStyles.appLogoStyle} />
              <Text style={[{...globalStyles.titleStyle, marginTop : RFValue(8)}]}>{Constants.reset_password}</Text>
              <Text style={globalStyles.instructionStyle}>
                {Constants.reset_password_instruction}
              </Text>

              <TextInput
                  ref={input => {
                      this.passwordTextInput = input;
                  }}
                  style={[{...globalStyles.textInputStyle, marginTop : RFValue(15)}]}
                  selectionColor={Colors.color_black}
                  label={Constants.new_password}
                  mode="outlined"
                  dense={true}
                  returnKeyType="next"
                  textContentType="password"
                  secureTextEntry={true}
                  onChangeText={text => {
                      this.state.password = text;
                  }}
                  onSubmitEditing={() => { this.confirmPasswordTextInput.focus(); }}
                  blurOnSubmit={false}
                />

              <TextInput
                  ref={input => {
                      this.confirmPasswordTextInput = input;
                  }}
                  style={[{...globalStyles.textInputStyle, marginTop : RFValue(15)}]}
                  selectionColor={Colors.color_black}
                  label={Constants.confirm_password}
                  mode="outlined"
                  dense={true}
                  textContentType="password"
                  secureTextEntry={true}
                  onChangeText={text => {
                      this.state.confirmPassword = text;
                  }}
              />

              <Button 
                  style={[{...globalStyles.btnStyle, marginTop : RFValue(30)}]}
                  labelStyle = {globalStyles.btnLabelStyle}
                  uppercase={true}
                  mode = 'contained'
                  onPress={() => {this.validateFields()}}>{Constants.reset_now}
              </Button>
              
              {this.state.isLoaderVisible && <Loader/>}
            </View>
          </SafeAreaView>
        );
      }

    showAlert = (title, msg) => {
        Alert.alert(title, msg);
    }

    showIndicator = () => {
        this.setState({
            isLoaderVisible : true
        })
    }

    hideIndicator = () => {
        this.setState({
            isLoaderVisible : false
        })
    }

    validateFields = () => {
      let title = Constants.invalid;
      if(this.state.password.length < 1){
         this.showAlert(title, Constants.empty_password);
      } else if(Utils.validateField(this.state.password, Constants.regex_password)) {
         this.showAlert(title, Constants.invalid_password_instruction);
      } else if(this.state.confirmPassword.length < 1){
         this.showAlert(title, Constants.empty_reenter_password);
      } else if(!(this.state.password.toString() === this.state.confirmPassword.toString())){
         this.showAlert(title, Constants.password_not_matched);
      } else {
         const data = {userId : this.userId, newPassword : this.state.password, forgotPasswordToken : this.userId};
         this.callResetPassword(data);
      }
    }

    componentDidUpdate(){
      //update data when user comes from background
      this.userId = this.props.extraData.screenProps.userId;
    }

    callResetPassword(data){
      const onSuccess = (response) => {
        if(response.success === 0){
            this.hideIndicator();
            this.props.navigation.navigate(Constants.screen_thank_you, data);
        } else {
            this.showAlert(Constants.invalid, response.message);
        }
      };

      const onFailure = (message) => {
          this.hideIndicator();
      };

      NetInfo.fetch().then(state => {
          if(state.isConnected){
              this.showIndicator();
              ApiManager.resetPassword(data, true)
              .then(onSuccess)
              .catch(onFailure);
          } else {
              this.showAlert(Constants.network, Constants.please_check_internet);
          }
      });
    }
}

export default ResetPassword;