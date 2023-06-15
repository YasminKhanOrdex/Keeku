import NetInfo from '@react-native-community/netinfo';
import React, { Component } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { RFValue } from "react-native-responsive-fontsize";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ApiManager from '../../apiManager/ApiManager';
import EmailImage from '../../assets/images/email_tempelate.svg';
import * as Colors from '../../res/colors';
import * as Constants from '../../res/strings';
import Loader from '../../sharedComponents/Loader';
import {openInbox} from 'react-native-email-link';
import globalStyles from '../../res/styles';
let propsData;

class OpenEmailScreen extends Component {

    constructor(props){  
        super(props);
        propsData = props.route.params; 
        this.state = {  
            isLoaderVisible : false
        }  
    }  

    render() {
        return (
            <SafeAreaView style={globalStyles.container}>
                <View style = {{flex : 1, alignItems : 'center'}}>
                <EmailImage/>
                <Text style={[{...globalStyles.titleStyle, marginTop : RFValue(40)}]}>{Constants.check_your_mail}</Text>

                    
                    <Text style={[{...globalStyles.instructionStyle, marginTop : RFValue(5), textAlign : 'center'}]}>{Constants.check_your_mail_instruction}</Text>
                    
                    <Button 
                        style = {[{...globalStyles.btnStyle, marginVertical : RFValue(25), width : '100%'}]}
                        labelStyle = {globalStyles.btnLabelStyle}
                        uppercase={true}
                        mode = 'contained'
                        onPress={() => {openInbox()}}>{Constants.open_email_app}
                    </Button>

                    <Text style={styles.textStyle}> {Constants.didnt_get_link}
                        <Text
                            style={{...styles.textStyle, fontFamily: Constants.font_bold}}
                            onPress={() => {this.callResetPasswordLink()}}> {Constants.resend_now}
                        </Text>
                    </Text>


                    <View style={styles.bottomContainer}>
                        <Text style={styles.textStyle}>
                            {Constants.didn_remember_password}
                            <Text
                            style={{...styles.textStyle, fontFamily: Constants.font_bold}}
                            onPress={() => this.goToSignIn()}
                            >
                            {Constants.try_signin}
                            </Text>
                        </Text>
                    </View>

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

    callResetPasswordLink = () => {
        const onSuccess = (response) => {
            this.hideIndicator();
            this.showAlert('', response.message);
        };
  
        const onFailure = (message) => {
            this.hideIndicator();
        };

        NetInfo.fetch().then(state => {
            if(state.isConnected){
                this.showIndicator();
                ApiManager.resetPasswordLink(propsData, true)
                .then(onSuccess)
                .catch(onFailure);
            } else {
                this.showAlert(Constants.network, Constants.please_check_internet);
            }
        });
    }

    goToSignIn = () => {
        this.props.navigation.navigate(Constants.screen_login);
    }
}

const styles = StyleSheet.create({
    bottomContainer: {
        position: 'absolute',
        bottom: RFValue(10),
        flexDirection: 'column',
        width: '100%',
    },
    textStyle: {
        fontSize: RFValue(13),
        fontFamily: Constants.font_regular,
        color: Colors.color_black,
        textAlign: 'center',
    },
});
  
export default OpenEmailScreen;