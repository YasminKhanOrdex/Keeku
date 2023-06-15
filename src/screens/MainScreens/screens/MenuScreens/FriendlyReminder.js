import React, { Component } from 'react';
import {
  Text,
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import * as Constants from '../../../../res/strings';
import { RFValue } from 'react-native-responsive-fontsize';
import { Button } from 'react-native-paper';
import * as Colors from '../../../../res/colors';
import Email from '../../../../assets/images/icn_friendly_reminder';

export default class FriendliReminder extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Modal transparent={true} visible={this.props.visible}>
        <TouchableOpacity
          onPress={() => this.props.close()}
          style={{
            flex: 1,
            justifyContent: 'center',
            alignContent: 'center',
            backgroundColor: '#131313aa',
          }}>
          <TouchableWithoutFeedback>
            <View style={styles.modelStyle}>
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: RFValue(30),
                }}>
                <Email
                  width={RFValue(62)}
                  height={RFValue(58)}
                  style={styles.iconStyle}
                />
              </View>
              <Text style={styles.txtStyle}>{Constants.friendly_reminder}</Text>
              <Text style={styles.styleText}>
                {Constants.keeku_does_not_censor_content}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    );
  }
}
const styles = StyleSheet.create({
  btnStyle: {
    height: RFValue(40),
    borderColor: Colors.color_black,
    borderWidth: RFValue(1.5),
    justifyContent: 'center',
    marginHorizontal: RFValue(70),
    marginBottom: RFValue(10),
  },
  iconStyle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  txtStyle: {
    fontSize: RFValue(14),
    color: Colors.color_black,
    fontFamily: Constants.font_semibold,
    textAlign: 'center',
    marginTop: RFValue(19),
  },
  styleText: {
    fontSize: RFValue(12),
    color: Colors.color_black,
    fontFamily: Constants.font_light,
    textAlign: 'justify',
    marginTop: RFValue(10),
    marginHorizontal: RFValue(24),
    marginBottom: RFValue(25),
  },
  modelStyle: {
    backgroundColor: Colors.color_white,
    borderRadius: RFValue(9),
    marginHorizontal: RFValue(20),
    //marginVertical: RFValue(210),
    height: 'auto',
    width: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
