import React, { Component } from 'react';
import {
  Text,
  View,
  Modal,
  Image,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import * as Constants from '../../../../res/strings';
import { RFValue } from 'react-native-responsive-fontsize';
import { Button } from 'react-native-paper';
import * as Colors from '../../../../res/colors';
const photos = [
  {
    key: 1,
    pic: 'https://cdn2.thecatapi.com/images/3si.jpg',
  },
  {
    key: 2,
    pic: 'https://cdn2.thecatapi.com/images/73n.jpg',
  },
  {
    key: 3,
    pic: 'https://randomuser.me/api/portraits/men/42.jpg',
  },
  {
    key: 4,
    pic: 'https://cdn2.thecatapi.com/images/3si.jpg',
  },
];
export default class SearchScreenModel extends Component {
  constructor(props) {
    super(props);

  }
  renderItem = ({ item }) => {
    return (
      <View style={styles.ImgMain}>

        <Image
          source={{ uri: item.pic }}
          style={{ height: '50%', width: 'auto' }}
        />
      </View>

    );
  };
  render() {
    return (
      <Modal transparent={true} visible={this.props.isVisible}>
        <TouchableOpacity
          onPress={this.props.close}
          style={{
            flex: 1,
            justifyContent: 'center',
            alignContent: 'center',
            backgroundColor: '#131313aa',
          }}>

          <View style={styles.modelStyle}>
            {/* <View
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
              </Text> */}
            <View style={styles.viewPagerContainer}>
              <AppIntroSlider
                activeDotStyle={{ backgroundColor: Colors.color_black }}
                renderItem={this.renderItem}
                data={photos}
                showDoneButton={false}
                showNextButton={false}
              />


              <Button
                style={styles.closeBtnStyle}
                labelStyle={{ fontSize: RFValue(12) }}
                uppercase={true}
                mode='contained'
                onPress={this.props.close}>{Constants.close}
              </Button>
            </View>
          </View>

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
    // height: 'auto',
    // width: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  viewPagerContainer: {

    // marginHorizontal: RFValue(16),
    justifyContent: 'center',
    paddingVertical: RFValue(30),
  },
  ImgMain: {
    justifyContent: 'center',
    // flex: 1,
  },
});
