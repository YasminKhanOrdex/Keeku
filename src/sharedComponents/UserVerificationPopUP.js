import React from 'react';
import { Modal, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import * as Colors from '../res/colors';
import * as Constants from '../res/strings';

export default function UserVerificationPopUP(props) {
  return (
    <Modal transparent visible={true}>
      <View style={styles.container}>
        <View style={styles.subContainer}>
          <Image
            source={require('../assets/images/exclamation.png')}
            style={{
              height: RFValue(30),
              margin: RFValue(4),
              aspectRatio: 1
            }}
            resizeMode={'contain'}
          />
          <Text style={styles.textTitleStyle}>{Constants.Sorry}</Text>
          <Text style={styles.textDesStyle}>{Constants.UserNotVerifiedAlert}</Text>
          <TouchableOpacity style={styles.btnStyle} onPress={props.verifyBtn}>
            <Text>{Constants.GetVerified}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  subContainer: {
    width: '70%',
    padding: RFValue(20),
    backgroundColor: 'white',
    alignItems: 'center',
    borderRadius: RFValue(15)
  },
  textTitleStyle: {
    fontSize: RFValue(18),
    fontFamily: Constants.font_bold
  },
  textDesStyle: {
    fontSize: RFValue(14),
    fontFamily: Constants.font_regular,
    textAlign: 'center',
    marginVertical: RFValue(10),
  },
  btnStyle: {
    borderWidth: 1,
    borderRadius: RFValue(5),
    marginTop: RFValue(10),
    paddingHorizontal: RFValue(10),
    paddingVertical: RFValue(5)
  }
});
