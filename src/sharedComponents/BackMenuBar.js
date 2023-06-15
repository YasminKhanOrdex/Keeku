import React, {Component} from 'react';
import {View,Text, StyleSheet, TouchableOpacity} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import * as Colors from '../res/colors';
import * as Constants from '../res/strings';
import BackArrow from '../assets/images/icn_white_back_arrow.svg';

export default class BackMenuBar extends Component {

    constructor(props){
      super(props);   
    }

    render () {
        return (
        <View style={styles.container}>
          <TouchableOpacity onPress={() => this.props.action()}>
              <View style={{ padding: RFValue(15) }}>
                <BackArrow width={RFValue(12)} height={RFValue(20)} />
              </View>
          </TouchableOpacity>
          <Text style={styles.textStyle} numberOfLines={1}>{this.props.title}</Text>    
        </View>
        ); 
    }
}

const styles = StyleSheet.create({
  container: {
    height : RFValue(60),
    backgroundColor : Colors.color_black,
    flexDirection : 'row',
    alignItems : 'center'
  },
  textStyle : {
    fontSize : RFValue(19),
    fontFamily : Constants.font_regular,
    color : Colors.color_user_bg,
    paddingVertical : RFValue(15),
    flex : 1,
  }
});
