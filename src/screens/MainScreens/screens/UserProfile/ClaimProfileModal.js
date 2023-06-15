import React, { Component } from 'react';
import {
  Text,
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import CongratulationModal from '../../screens/UserProfile/CongratulationModal';
import { RFValue } from 'react-native-responsive-fontsize';
import { Button } from 'react-native-paper';

import * as Colors from '../../../../res/colors';
import * as Constants from '../../../../res/strings';
export default class ClaimProfileModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
     isVisible: false,
    }
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
               Are you sure you want to claim this profile?
              </Text>

              <View style={styles.buttonContainer}>
                <Button
                  style={[styles.btnStyle, { marginRight: 5 }]}
                  labelStyle={{ fontSize: RFValue(11) }}
                  uppercase={false}
                  mode="contained"
                  onPress={() => this.props.claim()}
                 >
                  Yes
                </Button>
                <Button
                  style={[styles.btnStyle, { marginLeft: 15 }]}
                  labelStyle={{ fontSize: RFValue(11) }}
                  uppercase={false}
                  mode="outlined"
                  onPress={() => this.props.close()}
                >
                 No
                </Button>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
        <CongratulationModal visible={this.state.isVisible}
        close={this.hideModal.bind(this)}/>
      </Modal>
      
    );
  }
    hideModal() {
    this.setState({ isVisible: false });
  }
   showModal() {
    this.setState({ isVisible: true });
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