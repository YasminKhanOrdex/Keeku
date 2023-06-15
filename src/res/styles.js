import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import * as Colors from '../res/colors';
import * as Constants from '../res/strings';

export default StyleSheet.create({
  container: {
    padding: RFValue(20),
    flex: 1,
    backgroundColor: Colors.color_white,
  },
  textInputStyle : {
    minHeight: RFValue(40),
    fontSize: RFValue(14),
    backgroundColor: Colors.color_white,
  },
  btnStyle : {
    height: RFValue(40),
    justifyContent : 'center'
  },
  btnLabelStyle : {
    fontSize : RFValue(15)
  },
  titleStyle : {
    color: Colors.color_black,
    fontSize: RFValue(24),
    fontFamily: Constants.font_regular,
  },
  instructionStyle : {
    color: Colors.color_black,
    fontSize: RFValue(12),
    fontFamily: Constants.font_light,
  },
  appLogoStyle: {
    alignSelf: 'center',
    marginVertical: RFValue(25),
  },
  backArrowStyle: {
    marginTop : RFValue(15),
    marginBottom : RFValue(35),
    width : RFValue(20),
    height : RFValue(20)
  }, 
  errorTextStyle : {
    color : Colors.color_red_border,
    fontFamily : Constants.font_regular,
    fontSize : RFValue(14),
    marginTop : RFValue(5)
  },
  customComponentContainer : {
    marginVertical : RFValue(5),
    zIndex : -1
  }
});
