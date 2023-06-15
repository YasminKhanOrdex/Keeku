import React, { Component } from 'react';
import AppIntroSlider from 'react-native-app-intro-slider';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import BoardingImageOne from '../../assets/images/onboarding_screen_one.svg';
import BoardingImageTwo from '../../assets/images/onboarding_screen_two.svg';
import BoardingImageThree from '../../assets/images/onboarding_screen_three.svg';
import * as Constants from '../../res/strings';
import * as Colors from '../../res/colors';
import { RFValue } from 'react-native-responsive-fontsize';
import { SafeAreaView } from 'react-native-safe-area-context';

const slides = [
  {
    key: 1,
    title: Constants.reviews,
    text: Constants.boarding_text_one,
  },
  {
    key: 2,
    title: Constants.know_your_representative,
    text: Constants.boarding_text_two,
  },
  {
    key: 3,
    title: Constants.only_verified_user,
    text: Constants.boarding_text_three,
  },
];

class Paginator extends Component {

  constructor(props) {
    super(props);
  }

  _renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <View style={{ alignItems: 'center' }}>
          {this._getBoardingImage(item.key)}
        </View>
        <Text style={styles.titleStyle}>{item.title}</Text>
        <Text style={styles.ContentStyle}>{item.text}</Text>
      </View>
    );
  };

  _getBoardingImage = key => {
    if (key === 1) {
      return <BoardingImageOne />;
    } else if (key === 2) {
      return <BoardingImageTwo />;
    } else {
      return <BoardingImageThree />;
    }
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <View style={styles.viewPagerContainer}>
            <AppIntroSlider
              activeDotStyle={{ backgroundColor: Colors.color_black }}
              renderItem={this._renderItem}
              data={slides}
              showDoneButton={false}
              showNextButton={false}
            />
          </View>

          <View style={styles.bottomContainer}>
            <View style={styles.buttonContainer}>
              <Button
                style={{ ...styles.btnStyle, marginEnd: 10 }}
                labelStyle={{ fontSize: RFValue(13) }}
                uppercase={true}
                mode="outlined"
                onPress={() => { this.props.gotoLogin() }}>
                {Constants.sign_in}
              </Button>
              <Button
                style={{ ...styles.btnStyle, marginStart: 10 }}
                labelStyle={{ fontSize: RFValue(13) }}
                uppercase={true}
                mode="contained"
                onPress={() => { this.props.gotoSignUp() }}>
                {Constants.sign_up}
              </Button>
            </View>
            <Text style={styles.textStyle} onPress={() => { this.props.gotoMain() }}>{Constants.continue_as_guest}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.color_white,
  },
  textStyle: {
    fontSize: RFValue(16),
    color: Colors.color_black,
    fontFamily: Constants.font_bold,
    alignSelf: 'center',
    marginBottom: RFValue(15),
  },
  bottomContainer: {
    height: RFValue(110),
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: RFValue(15),
    flex: 1,
  },
  btnStyle: {
    flex: 1,
    height: RFValue(40),
    borderColor: Colors.color_black,
    borderWidth: 1.5,
    justifyContent: 'center'
  },
  viewPagerContainer: {
    flex: 1,
    marginHorizontal: RFValue(15),
  },
  titleStyle: {
    color: Colors.color_black,
    fontSize: RFValue(24),
    alignSelf: 'center',
    fontFamily: Constants.font_semibold,
    marginTop: RFValue(20),
    textAlign: 'center',
  },
  ContentStyle: {
    color: Colors.color_dark_grey,
    fontSize: RFValue(14),
    alignSelf: 'center',
    fontFamily: Constants.font_regular,
    marginVertical: RFValue(15),
    textAlign: 'center',
  },
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});

export default Paginator;
