import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppLogo from '../../assets/images/keeku_logo.svg';
import * as Colors from '../../res/colors';
import DeviceInfo from 'react-native-device-info';
import { RFValue } from 'react-native-responsive-fontsize';
import * as Constants from '../../res/strings';
import * as Animatable from 'react-native-animatable'
class Splash extends Component {
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Animatable.View animation="zoomIn">
          <AppLogo />
        </Animatable.View>
        <Text style={styles.versionTextStyle}>{getVersionNumber()}</Text>
      </SafeAreaView>
    );
  }
}

function getVersionNumber() {
  if (Platform.OS === 'ios') {
    return 'v' + DeviceInfo.getVersion() + ' (' + DeviceInfo.getBuildNumber() + ')';
  } else {
    return 'v' + DeviceInfo.getVersion();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.color_white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  versionTextStyle: {
    bottom: RFValue(20),
    position: 'absolute',
    fontSize: RFValue(17),
    fontFamily: Constants.font_regular
  }
});

export default Splash;
