import React, {Component} from 'react';
import {Text, View, Modal, StyleSheet, TouchableOpacity,Image} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import {Button} from 'react-native-paper';
import * as Colors from './../../../res/colors';
import * as Constants from './../../../res/strings';
export default class PostReviewRestrictModal extends Component {
  constructor(props) {
    super(props);
  }

  render() {
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
            <Image
            source={require('../../../assets/images/exclamation.png')}
            style={{
              height: RFValue(30),
              margin: RFValue(4),
              aspectRatio: 1
            }}
            resizeMode={'contain'}
          />
            <Text style={styles.txtStyle}>
                      
              {Constants.Sorry}
            </Text>
            <Text style={styles.textStyle}>
          {Constants.you_must_have_your_own_profile_on_keeku_to_post_a_review}
            </Text>

            <View>
              <Button
                style={styles.btnStyle}
                labelStyle={{fontSize: RFValue(14),color: Colors.color_black,fontFamily: Constants.font_bold}}
                uppercase={false}
                onPress={() => this.props.createPageBtn()}
                mode="outlined">
             {Constants.create_Your_page}
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
    fontSize: RFValue(18),
    color: Colors.color_black,
    fontFamily: Constants.font_bold,
    textAlign: 'center',
    marginBottom: RFValue(20),
  },
  textStyle: {
    fontSize: RFValue(16),
    color: Colors.color_black,
     paddingHorizontal:RFValue(10),
    fontFamily: Constants.font_regular,
    textAlign: 'center',
    marginBottom: RFValue(20),
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