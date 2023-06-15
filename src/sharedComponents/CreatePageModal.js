import React, { Component } from 'react';
import {
  Text,
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import * as Constants from '../res/strings';
import { RFValue } from 'react-native-responsive-fontsize';
import { Button } from 'react-native-paper';
import * as Colors from '../res/colors';

export default class CreatePageModal extends Component {
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
            padding: RFValue(10)
          }}>
          <TouchableWithoutFeedback>
            <View style={styles.modelStyle}>
              <Text style={styles.txtStyle}>
                {
                  Constants.create_or_claim_text
                }
              </Text>

              <View style={styles.buttonContainer}>
                <Button
                  style={[styles.btnStyle, { marginRight: 5 }]}
                  labelStyle={{ fontSize: RFValue(11) }}
                  uppercase={false}
                  mode="contained"
                  onPress={() => this.props.close(Constants.JUST_CREATE)}>
                  {Constants.just_create_it}
                </Button>
                <Button
                  style={[styles.btnStyle, { marginLeft: 15 }]}
                  labelStyle={{ fontSize: RFValue(11) }}
                  uppercase={false}
                  mode="outlined"
                  onPress={() => this.props.close(Constants.CREATE_AND_CLAIM)}>
                  {Constants.create_and_claim}
                </Button>
              </View>
            </View>
          </TouchableWithoutFeedback>
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
    marginBottom: RFValue(27)
  },
  modelStyle: {
    backgroundColor: Colors.color_white,
    borderRadius: RFValue(9),
    height: 'auto',
    width: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: RFValue(30),
    paddingHorizontal: RFValue(10)
  },
  buttonContainer: {
    flexDirection: 'row'
  },
  btnStyle: {
    flex: 1,
    borderColor: Colors.color_black,
    borderWidth: 1,
  },
});