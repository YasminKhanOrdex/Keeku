import React, { Component } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import * as Colors from '../res/colors';
import * as Constants from '../res/strings';

export default class LoaderWithoutModal extends Component {
  render() {
    return (
        <View style={styles.container}>
            <View style={styles.subContainer}>
              <ActivityIndicator size="large" color={Colors.color_black} />
              <Text style={styles.textStyle}>{Constants.please_wait}</Text>
            </View>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  subContainer: {
    width: '80%',
    padding: 20,
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  textStyle: {
    fontSize: RFValue(20),
    marginLeft: 20,
    fontFamily: Constants.font_regular,
  },
});
