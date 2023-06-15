import React, {Component} from 'react';
import {Text, TouchableOpacity, View, StyleSheet, Image} from 'react-native';
import * as Constants from '../../../../res/strings';
import {RFValue} from 'react-native-responsive-fontsize';
import * as Colors from '../../../../res/colors';
import ImageAdd from '../../../../assets/images/icn_swipe_up.svg';
import BackMenuBar from '../../../../sharedComponents/BackMenuBar';
import UserIcon from '../../../../assets/images/icn_user.svg';
import Calendar from '../../../../assets/images/icn_post_review.svg';
import GreenSign from '../../../../assets/images/icn_location_pin.svg';
import ManagePageTabView from './ManagePageTabView';
export default class ManageYourPage extends Component {
  constructor(props) {
    super(props);
    this.onBackPress = this.onBackPress.bind(this);
    this.state = {
      information: [],
      myReviews: [],
      myContribution: [],
      routes: [],
    };
  }
  render() {
    return (
      <View style={styles.mainContainer}>
        <BackMenuBar
          title={Constants.manage_your_page}
          action={this.onBackPress}
        />
        <View style={styles.profileContainer}>
          <View   style={styles.profileImg}>
          <UserIcon
            height={RFValue(60)}
            width={RFValue(60)}
            
          /></View>
          <TouchableOpacity
           // style={styles.AddImg}
            onPress={() => {
              this.gotoModel();
            }}>
            <ImageAdd width={RFValue(27)} height={RFValue(27)}   style={styles.AddImg}/>
          </TouchableOpacity>
          <View style={styles.TextContain}>
            <View style={{flexDirection: 'row', marginTop: RFValue(5)}}>
              <Text style={[styles.TextStyle, {fontSize: RFValue(16)}]}>
                Barack Obama
              </Text>
              <GreenSign
                width={RFValue(16)}
                height={RFValue(16)}
                style={{marginLeft: RFValue(6)}}
              />
            </View>
            <Text
              style={[
                styles.TextStyle,
                {fontSize: RFValue(13), marginVertical: RFValue(6)},
              ]}>
              @barackobama_official
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginBottom: RFValue(8),
                marginTop: RFValue(5),
              }}>
              <Calendar
                width={RFValue(16)}
                height={RFValue(16)}
                style={{marginRight: RFValue(10)}}
              />
              <Text style={styles.TxtStyle}>Joined February 2021</Text>
            </View>
            <Text style={styles.TxtStyle}>
              Claimed By @barackobama_official
            </Text>
          </View>
        </View>

        <ManagePageTabView
          routes={this.state.routes}
          information={this.state.information}
          myReviews={this.state.myReviews}
          myContribution={this.state.myContribution}
        />
      </View>
    );
  }
  gotoModel() {
    this.props.navigation.navigate(Constants.screen_friendly_reminder);
  }
  componentDidMount() {
    this.manageTabData();
  }

  onBackPress() {
    this.props.navigation.goBack();
  }

  manageTabData = () => {
    if (this.state.information) {
      this.state.routes.push({
        key: 'Information',
        title: 'Information',
      });
    }
    if (this.state.myReviews) {
      this.state.routes.push({
        key: 'Reviews',
        title: 'My Reviews',
      });
    }
    if (this.state.myContribution) {
      this.state.routes.push({
        key: 'Contribution',
        title: 'My Contribution',
      });
    }
  };
}
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.color_white,
  },
  profileImg: {
    height: RFValue(92),
    width: RFValue(92),
    borderRadius: RFValue(100),
    backgroundColor:Colors.color_user_bg,
    justifyContent:'center',
    alignItems:'center'
  },
  profileContainer: {
    marginTop: RFValue(15),
    marginHorizontal: RFValue(14),
    flexDirection: 'row',
 
  },
  AddImg: {
   //backgroundColor: Colors.color_black,
    position: 'absolute',
   bottom: RFValue(10),
   right:RFValue(0),
  
      
  },
  TextContain: {
    marginHorizontal: RFValue(20),
  },
  TextStyle: {
    color: Colors.color_dark_black,
    fontFamily: Constants.font_regular,
  },
  TxtStyle: {
    fontFamily: Constants.font_regular,
    color: Colors.color_gray,
    fontSize: RFValue(12),
  },
});
