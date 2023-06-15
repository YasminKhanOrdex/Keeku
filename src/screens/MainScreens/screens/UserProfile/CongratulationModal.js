import React, {Component} from 'react';
import {Text, View, Modal, StyleSheet, TouchableOpacity} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import {Button} from 'react-native-paper';
import * as Colors from '../../../../res/colors';
import * as Constants from '../../../../res/strings';
export default class CongratulationModal extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log("congrats modal props >>>> ", this.props);
    return (
      <Modal transparent={true} visible={this.props.visible}>
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'center',
            alignContent: 'center',
            backgroundColor: '#131313aa',
            padding: RFValue(10),
          }}>
          <View style={styles.modelStyle}>
            <Text style={styles.txtStyle}>
              You have successfully claimed the profile.
            </Text>

            <View>
              <Button
                style={[styles.btnStyle, {marginRight: 5}]}
                labelStyle={{fontSize: RFValue(20)}}
                uppercase={false}
                mode="contained"
                onPress={() => this.props.navigation.navigate(Constants.screen_dashboard)}>
                ok
              </Button>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }
}
const styles = StyleSheet.create({
  txtStyle: {
    fontSize: RFValue(16),
    color: Colors.color_black,
    fontFamily: Constants.font_semibold,
    textAlign: 'center',
    marginBottom: RFValue(27),
  },
  modelStyle: {
    backgroundColor: Colors.color_white,
    borderRadius: RFValue(9),
    height: 'auto',
    width: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: RFValue(30),
    paddingHorizontal: RFValue(10),
  },
  btnStyle: {
    borderColor: Colors.color_black,
    borderWidth: 1,
  },
});
