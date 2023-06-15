import React, {Component} from 'react';
import {TouchableOpacity, View, StyleSheet, Image, Text} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import * as Constants from '../../../../res/strings';
import * as Colors from '../../../../res/colors';
import {RFValue} from 'react-native-responsive-fontsize';
import BackArrow from '../../../../assets/images/back_arrow.svg';
import MoreOption from '../../../../assets/images/icn_menu.svg';
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
export default class ViewMedia extends Component {

  renderItem = ({item}) => {
    return (
      <View style={styles.ImgMain}>
         
        <Image
          source={{uri: item.pic}}
          style={{height: RFValue(300), width: 'auto'}}
        />
        </View>
      
    );
  };

  render() {
    return (
      <View style={styles.main}>
        <View style={{marginTop: RFValue(30), marginHorizontal: RFValue(16)}}>
          <BackArrow height={22} width={14} />
          <MoreOption width={22} height={22} style={styles.iconStyle} />
        </View>

        <View style={styles.viewPagerContainer}>
          <AppIntroSlider
            activeDotStyle={{backgroundColor: Colors.color_black}}
            renderItem={this.renderItem}
            data={photos}
            showDoneButton={false}
            showNextButton={false}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  main: {
    backgroundColor: Colors.color_white,
    flex: 1,
  },
  iconStyle: {
    position: 'absolute',
    right: RFValue(0),
  },
  viewPagerContainer: {
    flex: 1,
    marginHorizontal: RFValue(16),
    justifyContent: 'center',
    paddingVertical: RFValue(30),
  },
  ImgMain: {
    justifyContent: 'center',
    flex: 1,
  },
});
