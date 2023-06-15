import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import DownArrowIcon from '../assets/images/icn_down_arrow.svg';
import * as Colors from '../res/colors';
import * as Constants from '../res/strings';

export default class TitleMenuBar extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => { this.props.action() }}>
          <View style={{ padding: RFValue(15), backgroundColor: "" }}>
            <DownArrowIcon height={RFValue(20)} width={RFValue(20)} />
          </View>
        </TouchableOpacity>
        <Text style={styles.textStyle} numberOfLines={1}>{this.props.title}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: RFValue(60),
    backgroundColor: Colors.color_black,
    flexDirection: 'row',
    alignItems: 'center',
    padding: RFValue(10)
  },
  textStyle: {
    fontSize: RFValue(20),
    fontFamily: Constants.font_regular,
    color: Colors.color_user_bg,
    flex: 1,
    textAlign: 'center',
    marginRight: RFValue(20)
  }
});
