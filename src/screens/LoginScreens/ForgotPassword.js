import NetInfo from '@react-native-community/netinfo';
import React, { Component } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { RFValue } from "react-native-responsive-fontsize";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ApiManager from '../../apiManager/ApiManager';
import BackArrow from '../../assets/images/back_arrow.svg';
import * as Colors from '../../res/colors';
import * as Constants from '../../res/strings';
import Loader from '../../sharedComponents/Loader';
import globalStyles from '../../res/styles';

class ForgotPassword extends Component {

    constructor(props){  
        super(props);  
        this.state = {  
            username : '',
            isLoaderVisible : false
        }  
    }  

    render() {
        return (
            <SafeAreaView style={globalStyles.container}>
                <View style = {{flex : 1}}>
                    <TouchableOpacity style={globalStyles.backArrowStyle} onPress={() => {this.goBack()}}>
                        <BackArrow/>
                    </TouchableOpacity>
                    <Text style={globalStyles.titleStyle}>{Constants.forgot_password_label}</Text>
                    <Text style={globalStyles.instructionStyle}>{Constants.forgot_password_instruction}</Text>
                    <TextInput
                        style = {[{...globalStyles.textInputStyle, marginTop : RFValue(15)}]}
                        selectionColor = {Colors.color_black}
                        label = {Constants.username_or_email}
                        mode = 'outlined'
                        dense={true}
                        returnKeyType='done'
                        textContentType = 'name'
                        onChangeText={(text) => {this.state.username = text.trim()}}
                    />
                    
                    <Button 
                        style = {[{...globalStyles.btnStyle, marginTop : RFValue(25)}]}
                        labelStyle = {{fontSize : RFValue(13)}}
                        uppercase={true}
                        mode = 'contained'
                        onPress={() => {this.validateFields()}}>{Constants.send}
                    </Button>

                    {this.state.isLoaderVisible && <Loader/>}

                </View>
            </SafeAreaView>
        );
    }

    goBack = () =>{
        this.props.navigation.goBack();
    }

    validateFields = () => {
         let title = Constants.invalid;
         if(this.state.username.length < 1){
            this.showAlert(title, Constants.username_or_email_required);
         } else {
            this.callResetPasswordLink();
         }
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

    callResetPasswordLink = () => {
        let dataToPass = {userName : this.state.username, email : this.state.username};
        const onSuccess = (response) => {
            this.hideIndicator();
            if(response.success === 0){
                this.goToEmailScreen(dataToPass);
            } else {
                this.showAlert('', response.message);
            }
        };
  
        const onFailure = (message) => {
            this.hideIndicator();
        };

        NetInfo.fetch().then(state => {
            if(state.isConnected){
                this.showIndicator();
                ApiManager.resetPasswordLink(dataToPass, true)
                .then(onSuccess)
                .catch(onFailure);
            } else {
                this.showAlert(Constants.network, Constants.please_check_internet);
            }
        });
    }

    goToEmailScreen = (data) => {
        this.props.navigation.navigate(Constants.screen_open_email, data);
    }
}
  
export default ForgotPassword;