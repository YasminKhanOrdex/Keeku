import NetInfo from '@react-native-community/netinfo';
import React, { Component } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, BackHandler, Platform } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { RFValue } from "react-native-responsive-fontsize";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ApiManager from '../../apiManager/ApiManager';
import * as Colors from '../../res/colors';
import * as Constants from '../../res/strings';
import Loader from '../../sharedComponents/Loader';
import Utils from '../../utils/Utils';
import BackArrow from '../../assets/images/back_arrow.svg';
import InfoIcon from '../../assets/images/info_icon.svg';
import * as ManageUserData from '../../localStorage/UserData';
import { StackActions } from '@react-navigation/native';
import globalStyles from '../../res/styles';
let userData;

class SetCredentials extends Component {

    constructor(props){  
        super(props);  
        userData = props.route.params;
        this.state = {  
            username : '',
            password : '',
            confirmPassword : ''
        }  
    }  

    render() {
        return (
            <SafeAreaView style={globalStyles.container}>
                <View style = {{flex : 1}}>
                    <TouchableOpacity style={globalStyles.backArrowStyle} onPress={() => {this.goBack()}}>
                        <BackArrow/>
                    </TouchableOpacity>
                    <Text style={globalStyles.titleStyle}>{Constants.set_your_credentials}</Text>
                    <Text style={globalStyles.instructionStyle}>{Constants.you_will_need}</Text>

                    <View style={styles.textInputViewStyle}>
                        <TextInput
                            style={Platform.OS === 'ios' ? globalStyles.textInputStyle : this.getAndroidTextInputStyle()}
                            selectionColor = {Colors.color_black}
                            label = {Constants.username}
                            mode = 'outlined'
                            dense={true}
                            returnKeyType='next'
                            textContentType = 'name'
                            onSubmitEditing={() => { this.passwordTextInput.focus(); }}
                            blurOnSubmit={false}
                            onBlur={() => {this.checkUsername()}}
                            onChangeText={(text) => {this.state.username = text.trim()}}
                        />
                    </View>
                    
                    <View style={styles.textInputViewStyle}>
                        <TextInput
                            ref={input => {
                                this.passwordTextInput = input;
                            }}
                            style={Platform.OS === 'ios' ? globalStyles.textInputStyle : this.getAndroidTextInputStyle()}
                            selectionColor={Colors.color_black}
                            label={Constants.password}
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
                            right={<TextInput.Affix text={Constants.space_five_times} textStyle={{fontSize : RFValue(13)}}/>} // used for set padding
                        />
                        {this.getImageComponent()}
                        
                    </View>

                    <View style={styles.textInputViewStyle}>
                        <TextInput
                            ref={input => {
                                this.confirmPasswordTextInput = input;
                            }}
                            style={Platform.OS === 'ios' ? globalStyles.textInputStyle : this.getAndroidTextInputStyle()}
                            selectionColor={Colors.color_black}
                            label={Constants.confirm_password}
                            mode="outlined"
                            dense={true}
                            textContentType="password"
                            secureTextEntry={true}
                            onChangeText={text => {
                                this.state.confirmPassword = text;
                            }}
                            right={<TextInput.Affix text={Constants.space_five_times} textStyle={{fontSize : RFValue(13)}}/>}  // used for set padding
                        />

                        {this.getImageComponent()}
                    </View>

                    <Button 
                        style = {[{...globalStyles.btnStyle, marginTop : RFValue(25)}]}
                        labelStyle = {globalStyles.btnLabelStyle}
                        uppercase={true}
                        mode = 'contained'
                        onPress={() => {this.validateFields()}}>{Constants.sign_up}
                    </Button>

                    {this.state.isLoaderVisible && <Loader/>}

                </View>
            </SafeAreaView>
        );
    }

    getAndroidTextInputStyle(){
        return {
            height: RFValue(35),
            fontSize: RFValue(14),
            backgroundColor: Colors.color_white,
        }
    }

    componentDidMount(){
        BackHandler.addEventListener('hardwareBackPress', this.goBack);
    }

    goBack = () =>{
        const popAction = StackActions.pop(2);
        this.props.navigation.dispatch(popAction);
        //this.props.navigation.goBack();
    }

    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPress', this.goBack);
    }

    validateFields = () => {
         let title = Constants.invalid;
         if(this.state.username.length < 1){
             this.showAlert(title, Constants.empty_username);
         } else if(Utils.validateField(this.state.username, Constants.regex_username)) {
            this.showAlert(title, Constants.invalid_username_instruction);
         } else if(this.state.password.length < 1){
            this.showAlert(title, Constants.empty_password);
         } else if(Utils.validateField(this.state.password, Constants.regex_password)) {
            this.showAlert(title, Constants.invalid_password_instruction);
         } else if(this.state.confirmPassword.length < 1){
            this.showAlert(title, Constants.empty_reenter_password);
         } else if(!(this.state.password.toString() === this.state.confirmPassword.toString())){
            this.showAlert(title, Constants.password_not_matched);
         } else {
            this.generateUserDTO();
         }
    }

    generateUserDTO = () => {
        let userDataDTO = userData;
        userDataDTO.userName = this.state.username.toLowerCase();
        userDataDTO.password = this.state.password;
        userDataDTO.signupStep = 4;
        this.signUpUser(userDataDTO);
    }

    showAlert = (title, msg) => {
        Alert.alert(title, msg);
    }

    signUpUser = (data) => {
        const onSuccess = (response) => {
            if(response.success === 0){
                this.authenticateUser();
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
                ApiManager.setUsernamePassword(data, true)
                .then(onSuccess)
                .catch(onFailure);
            } else {
                this.showAlert(Constants.network, Constants.please_check_internet);
            }
        });
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

    checkUsername = () => {
        let userName = this.state.username;
        if(userName.length > 0 && !Utils.validateField(userName, Constants.regex_username)){
            const onSuccess = (data) => {
                this.hideIndicator();
                if(data.success === 1){
                    this.showAlert(Constants.invalid, Constants.username_already_exist);
                }
            };
      
            const onFailure = (message) => {
                this.hideIndicator();
            };
    
            NetInfo.fetch().then(state => {
                if(state.isConnected){
                    this.showIndicator();
                    ApiManager.verifyUsername(userName)
                    .then(onSuccess)
                    .catch(onFailure);
                } else {
                    this.showAlert(Constants.network, Constants.please_check_internet);
                }
            });
        }
    }

    authenticateUser = () => {
        let dataToPass = {userName : this.state.username.toLowerCase(), email : this.state.username.toLowerCase(), password : this.state.password};
        const onSuccess = (response) => {
            this.hideIndicator();
            ManageUserData.saveUserData(response.data);
            this.gotoMainScreen(response.token);
        };
  
        const onFailure = (message) => {
            this.hideIndicator();
        };

        NetInfo.fetch().then(state => {
            if(state.isConnected){
                this.showIndicator();
                ApiManager.authenticate(dataToPass, false)
                .then(onSuccess)
                .catch(onFailure);
            } else {
                this.showAlert(Constants.network, Constants.please_check_internet);
            }
        });
    }

    gotoMainScreen = (token) => {
        this.props.extraData.screenProps.onSignupCompleted(token);
    }

    getImageComponent = () => {
        return <TouchableOpacity style={styles.iconContainer} onPress={() => {this.showAlert('',Constants.invalid_password_instruction)}}>
        <InfoIcon height={RFValue(15)} width={RFValue(15)}/>
    </TouchableOpacity>
    }
}

const styles = StyleSheet.create({
    textInputViewStyle : {
        height : RFValue(40),
        marginTop : RFValue(20)
    },
    iconContainer : {
        position : 'absolute', 
        justifyContent : 'center', 
        end : RFValue(10),
        height : RFValue(38), 
        marginTop : RFValue(5),
        zIndex : 1
    }
});
  
export default SetCredentials;