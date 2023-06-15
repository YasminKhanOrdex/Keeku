import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { RFValue } from 'react-native-responsive-fontsize';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThankYouImage from '../../assets/images/thank_you_tempelate.svg';
import * as Colors from '../../res/colors';
import * as Constants from '../../res/strings';
import globalStyles from '../../res/styles';

class ThankYouScreen extends Component {

  constructor(props){  
    super(props);  
  }    

  render() {
    return (
      <SafeAreaView style={globalStyles.container}>
        <View style={styles.viewContainer}>
            <View style={{marginTop : RFValue(10)}}>
              <ThankYouImage/>
            </View>
            <Text style={styles.textStyle}>{Constants.thank_you_instruction}</Text>
            <Button
                style={[{...globalStyles.btnStyle, width : '100%'}]}
                labelStyle={globalStyles.btnLabelStyle}
                uppercase={true}
                mode="contained"
                onPress={() => {
                    this.goToSignIn()
                }}>
                {Constants.sign_in}
            </Button>
        </View>
      </SafeAreaView>
    );
  }

  goToSignIn(){
    this.props.extraData.screenProps.gotoLogin();
  }
}

const styles = StyleSheet.create({
  textStyle: {
    textAlign : 'center', 
    marginVertical : RFValue(35), 
    fontFamily : Constants.font_regular, 
    color : Colors.color_black,
    fontSize: RFValue(17)
  },
  viewContainer: {
    alignItems : 'center'
  }
});

export default ThankYouScreen;
