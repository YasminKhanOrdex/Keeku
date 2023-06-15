import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import React, { Component } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Popover, { PopoverPlacement } from 'react-native-popover-view';
import { RFValue } from 'react-native-responsive-fontsize';
import * as ApiManager from '../apiManager/ApiManager';
import AddIcon from '../assets/images/icn_add.svg';
import UserIcon from '../assets/images/icn_user.svg';
import * as UserData from '../localStorage/UserData';
import * as Colors from '../res/colors';
import * as Constants from '../res/strings';
import TermsAndCondition from './../screens/SignUpScreens/TermsAndCondition';

export default class MainTopBar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isGuest: true,
      profileData: '',
      claimedProfileData: [],
      isTermsAndConditionVisible: false,
      showPopover: false,
    }
  }

  refresh() {
    AsyncStorage.getItem(Constants.token).then((token) => {
      if (token) {
        if (token === Constants.guestToken) {
          this.setState({ isGuest: true });
        } else {
          UserData.getUserData().then((data) => {
            this.fetchRequiredData(data);
          })
        }
      }
    });
  }

  render() {
    let ringColor = this.state.isGuest ? Colors.color_white : this.state.profileData.verified ? Colors.color_green : Colors.color_red_border;
    let profileImage = this.state.profileData.defaultProfileImage;
    return (
      <View style={styles.container}>
        <Popover
          from={(
            <TouchableOpacity style={[{ ...styles.imgContainer, borderColor: ringColor }]}
              onPress={() => { this.setShowPopover(true) }}>
              {profileImage ? <Image style={styles.profileImageStyle} source={{ uri: profileImage }} /> : <UserIcon height={RFValue(20)} width={RFValue(20)} />}
            </TouchableOpacity>
          )}
          isVisible={this.state.showPopover}
          onRequestClose={() => { this.setShowPopover(false) }}
          placement={PopoverPlacement.BOTTOM}
          verticalOffset={RFValue(10)}>
          {this.getPopoverContent()}
          <TermsAndCondition
            isVisible={this.state.isTermsAndConditionVisible}
            close={() => { this.hideTermsAndConditions() }} />
        </Popover>

      </View>
    );
  }

  componentDidMount() {
    this.refresh();
  }

  fetchRequiredData = (data) => {
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        this.props.showIndicator();
        ApiManager.fetchUserDetails(data.userId, false)
          .then((userData) => {
            UserData.saveUserData(userData.data);
            const claimedProfiles = ApiManager.fetchClaimedProfile(userData.data.userId, false);
            const updatedUserData = UserData.getUserData();
            return Promise.all([claimedProfiles, updatedUserData]);
          })
          .then((allData) => {
            this.props.hideIndicator();
            let claimedProfileData = allData[0].data;
            let profileData = allData[1];
            let sortedProfileData = this.getSortedData(profileData, claimedProfileData);
            this.setState({
              isGuest: false,
              profileData,
              claimedProfileData: sortedProfileData
            })
          })
          .catch((error) => {
            this.props.hideIndicator();
            console.log('Error while fetching details', error);
          })
      } else {
        this.setState({
          isGuest: false,
          profileData: data
        })
      }
    });
  }

  getWidth() {
    return Dimensions.get('window').width;
  }

  getPopoverContent() {
    return <ScrollView>
      <View style={{ width: this.getWidth() - RFValue(20) }}>
        {this.state.isGuest ? this.getGuestView() : this.getUserView()}
      </View>
    </ScrollView>
  }

  getGuestView() {
    return <View>
      <Text style={styles.signInTextStyle} onPress={() => { this.goToSignIn() }}>{Constants.sign_in}</Text>
      {this.displayDivider()}
      <Text style={styles.signInTextStyle} onPress={() => { this.goToSignUp() }}>{Constants.sign_up}</Text>
    </View>
  }

  goToSignIn() {
    this.props.gotoLogin();
  }

  goToSignUp() {
    this.props.gotoSignUp()
  }

  logout() {
    this.props.logout()
  }

  gotoMoreTab() {
    this.props.gotoMoreTab();
  }

  clearToken() {
    return AsyncStorage.setItem(Constants.token, '');
  }

  getUserView() {
    return <View>
      {this.getProfileView()}
      {this.displayDivider()}
      {this.getCreatePageOption()}
      <Text style={styles.signOutTextStyle} onPress={() => { this.logout() }}>{Constants.sign_out}</Text>
      {this.displayDivider()}
      <View style={styles.horizontalViewContainer}>
        <Text style={styles.termsTextStyle} onPress={() => { this.showTermsAndConditions() }}>{Constants.terms_and_conditions}</Text>
      </View>
    </View>
  }

  getProfileView() {
    return <FlatList
      style={{ paddingVertical: RFValue(5) }}
      data={this.state.claimedProfileData}
      renderItem={item => this.renderItemComponent(item)}
      keyExtractor={(item, index) => index.toString()}
    />
  }

  getSortedData(profileData, claimedProfileData) {
    let pData = profileData;
    let cProfileData = claimedProfileData;
    let isDefaultProfileAvailable = cProfileData.length > 0 ? true : false;

    if (isDefaultProfileAvailable) {
      let defaultProfileIndex = 0;
      for (i = 0; i < cProfileData.length; i++) {
        // I'm looking for the index i, when the condition is true
        if (cProfileData[i].defaultProfile) {
          defaultProfileIndex = i;
          break;
        }
      }

      let temp = cProfileData[0];
      cProfileData[0] = cProfileData[defaultProfileIndex];
      cProfileData[defaultProfileIndex] = temp;

      cProfileData.map((item, index) => {
        item.isPage = true;
        if (index === 0) {
          item.isSelected = true;
        } else {
          item.isSelected = false;
        }
      })
    } else {
      let item = {
        id: pData.defaultProfileId,
        profileId: pData.defaultProfileId,
        profileName: pData.firstName + ' ' + pData.lastName,
        tagName: pData.userName,
        profileImage: pData.defaultProfileImage,
        isPage: false,
        defaultProfile: true,
        isSelected: true
      }
      cProfileData.push(item);
    }
    return cProfileData;
  }

  renderItemComponent(item) {
    let mItem = item.item;
    let index = item.index;

    let ringColor = index > 0 ? Colors.color_white : this.state.profileData.verified ? Colors.color_green : Colors.color_red_border;
    let profileImage = mItem.profileImage;

    return <TouchableOpacity onPress={() => { this.onItemClick(mItem) }} activeOpacity={1}>
      <View style={styles.horizontalItemContainer}>
        <View style={[{ ...styles.profileImageContainer, borderColor: ringColor }]}>
          {profileImage ? <Image style={styles.profileImageStyle} source={{ uri: profileImage }} /> : <UserIcon height={RFValue(20)} width={RFValue(20)} />}
        </View>
        <View style={{ marginStart: RFValue(15) }}>
          <Text style={styles.profileNameStyle}>{mItem.profileName}</Text>
          <Text style={styles.tagNameStyle}>{mItem.tagName}</Text>
        </View>
      </View>
      {mItem.isSelected && <TouchableOpacity style={styles.btnContainer} onPress={() => { this.onButtonPress(mItem) }}>
        <Text style={styles.btnStyle}>{mItem.isPage ? Constants.manage_your_page : Constants.manage_your_profile}</Text>
      </TouchableOpacity>}
      {index === 0 && this.state.claimedProfileData.length > 1 && this.displayDivider(RFValue(5))}
    </TouchableOpacity>
  }

  onItemClick(item) {
    if (this.state.claimedProfileData.length > 1) {
      let profileId = item.profileId;
      this.state.claimedProfileData.map((item) => {
        if (item.profileId === profileId) {
          item.isSelected = true;
        } else {
          item.isSelected = false;
        }
      });

      this.setState({
        claimedProfileData: this.state.claimedProfileData,
      })
    }
  }

  onButtonPress(item) {
    this.setShowPopover(false);
    console.log(">>> item >>> ", item);
    if (item.isPage) {
      this.props?.navigation?.navigate(Constants.screen_profile, { id: item.profileId, isEditProfile: true });
    } else {
      this.gotoMoreTab();
    }
  }

  getCreatePageOption() {
    return this.state.profileData.verified ? <View>
      <TouchableOpacity style={styles.horizontalViewContainer} onPress={() => {
        this.gotoBasicDetailScreen()
      }}>
        <AddIcon height={RFValue(18)} width={RFValue(18)} />
        <Text style={styles.createPageStyle}>{Constants.create_page}</Text>
      </TouchableOpacity>
      {this.displayDivider()}
    </View> : null;
  }

  gotoBasicDetailScreen() {
    this.setShowPopover(false);
    this.props.gotoBasicDetailScreen(this.state.profileData);
  }

  displayDivider(number) {

    let verticalOffset = number || 0;

    return <View
      style={{
        borderBottomColor: '#D0D0D0',
        borderBottomWidth: 1,
        marginVertical: verticalOffset
      }}
    />
  }

  showTermsAndConditions = () => {
    this.setState({
      isTermsAndConditionVisible: true
    })
  }

  hideTermsAndConditions = () => {
    this.setState({
      isTermsAndConditionVisible: false
    })
  }

  setShowPopover = (value) => {
    this.setState({
      showPopover: value,
    })
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.color_white,
  },
  imgContainer: {
    height: RFValue(35),
    width: RFValue(35),
    borderRadius: RFValue(35),
    borderWidth: RFValue(2),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.color_user_bg
  },
  termsTextStyle: {
    color: Colors.color_light_blue,
    fontSize: RFValue(12),
    fontFamily: Constants.font_regular
  },
  bulletTextStyle: {
    marginHorizontal: RFValue(10),
    fontSize: RFValue(5)
  },
  signOutTextStyle: {
    color: Colors.color_red_border,
    fontSize: RFValue(14),
    padding: RFValue(15),
    fontFamily: Constants.font_regular
  },
  horizontalViewContainer: {
    flexDirection: 'row',
    margin: RFValue(15),
    alignItems: 'center'
  },
  createPageStyle: {
    marginLeft: RFValue(15),
    color: Colors.color_black,
    fontSize: RFValue(14),
    fontFamily: Constants.font_regular
  },
  signInTextStyle: {
    color: Colors.color_black,
    fontSize: RFValue(15),
    margin: RFValue(15),
    fontFamily: Constants.font_regular
  },
  profileImageContainer: {
    height: RFValue(35),
    width: RFValue(35),
    borderRadius: RFValue(35),
    borderWidth: RFValue(2),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.color_user_bg
  },
  profileImageStyle: {
    width: RFValue(32),
    height: RFValue(32),
    borderRadius: RFValue(32)
  },
  horizontalItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: RFValue(10),
    marginVertical: RFValue(5)
  },
  tagNameStyle: {
    fontFamily: Constants.font_regular,
    fontSize: RFValue(13),
    color: Colors.color_gray
  },
  profileNameStyle: {
    fontFamily: Constants.font_regular,
    fontSize: RFValue(15),
    color: Colors.color_black
  },
  btnStyle: {
    fontSize: RFValue(12),
    fontFamily: Constants.font_regular
  },
  btnContainer: {
    height: RFValue(30),
    width: RFValue(165),
    marginStart: RFValue(60),
    marginVertical: RFValue(8),
    borderRadius: RFValue(7),
    borderColor: Colors.color_light_grey,
    borderWidth: RFValue(1),
    alignItems: 'center',
    justifyContent: 'center'
  }
});
