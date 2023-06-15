import React, { Component } from 'react';
import { Modal, Platform, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {Button} from 'react-native-paper';
import { RFValue } from 'react-native-responsive-fontsize';
import * as Constants from '../../res/strings';
import * as Colors from '../../res/colors';
import {WebView} from 'react-native-webview';
//const termsAndConditions = require('../../assets/others/terms_condition.html');
import HTML_FILE from '../../../resources/index.html';
const isAndroid = Platform.OS === 'android';

export default class TermsAndCondition extends Component {

constructor(props){
    super(props);
}

  render() {
    return (  
      <Modal
      animationType={'fade'}
        visible={this.props.isVisible}
        transparent= {true}>
        <SafeAreaView style={{flex : 1, backgroundColor : 'rgba(0, 0, 0, 0.3)'}}>
          <View style = {styles.container}>
            <Text style={styles.textStyle}>{Constants.terms_and_condition}</Text>
            <View style={{height : 1, backgroundColor : Colors.color_light_grey}}/>

            {this.loadWebView()}
          
            <View style = {styles.bottomContainer}>
              <View style={{height : 1, backgroundColor : Colors.color_light_grey}}/>
              <Button 
                  style = {styles.closeBtnStyle}
                  labelStyle = {{fontSize : RFValue(12)}}
                  uppercase={true}
                  mode = 'contained'
                  onPress={this.props.close}>{Constants.close}
              </Button>
            </View>
          </View>
        </SafeAreaView>
    </Modal>
    );
  }

  loadWebView = () => {
    return <WebView
      style={{flex : 1, marginBottom : RFValue(85)}}
      originWhitelist={['*']}
      source={isAndroid ? {uri: 'file:///android_asset/terms_condition.html'} : HTML_FILE}
      javaScriptEnabled={true}
      domStorageEnabled={true}/>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    margin : RFValue(25),
    borderRadius : RFValue(10)
  }, 
  textStyle: {
    margin : RFValue(20),
    fontFamily : Constants.font_regular, 
    fontSize : RFValue(15)
  },
  closeBtnStyle : {
    height : RFValue(35),
    marginVertical : RFValue(15),
    alignSelf : 'center'
  },
  bottomContainer : {
    position : "absolute",
    bottom : 0,
    width : '100%'
  }
});
