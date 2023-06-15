import React, { Component } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import * as Colors from './../../../res/colors';
import * as Constants from './../../../res/strings';
import IconFAQ from '../../../assets/images/icn_faq.svg';
import IconSettings from '../../../assets/images/icn_settings.svg';
import IconShield from '../../../assets/images/icn_shield.svg';
import IconInformation from '../../../assets/images/icn_information.svg';
import IconUp from '../../../assets/images/icn_up.svg';
import IconDown from '../../../assets/images/icn_down.svg';
import UserIcon from '../../../assets/images/icn_user.svg';
import AddIcon from '../../../assets/images/icn_add.svg';
import * as ApiManager from '../../../apiManager/ApiManager';
import * as UserData from '../../../localStorage/UserData';
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from '@react-native-community/netinfo';
import Loader from '../../../sharedComponents/Loader';

let profileData = '';

export default class MenuDashboardScreen extends Component {
  constructor(props) {
    super(props);
    this.callBackFunction();
    this.state = {
      isLoaderVisible: false,
      createdProfileData: [],
      claimedProfileData: [],
      claimedProfileCount: 0,
      isVerified: false,
      isArrowDown: true,
      isLoggedIn: false
    }
  }

  componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.callBackFunction();
      // if redirected to basic detail from post a review
      if(!!this.props.route.params?.setUserName) {
        this.hideBottomBar();
      }
      else {
        this.showBottomBar();
      }
    });
    AsyncStorage.getItem(Constants.token).then((token) => {
      if (token) {
        if (token !== Constants.guestToken) {
          this.setState({ isLoggedIn: true })
        } else {
          this.setState({ isLoggedIn: false })
        }
      }
    }).catch((error) => {
      alert(error);
    })
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  render() {
    let statusColor = this.state.isVerified ? Colors.color_green : Colors.color_red_border;
    //alert(this.state.isLoggedIn)
    return (
      <View style={styles.container}>
        {this.state.isLoaderVisible && <Loader />}
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollContainer}
          bounces={false}>
          <View style={{ marginVertical: RFValue(10) }}>
            {this.loadFirstProfile()}
            {this.getClaimedProfilesList()}
          </View>
          {this.getHorizontalDivider()}
          <View style={styles.horizontalContainer}>
            <TouchableOpacity style={styles.pageContainer} onPress={() => this.onClaimPagesClick()}>
              <Text style={styles.pageCountStyle}>{this.state.claimedProfileCount}</Text>
              <Text style={styles.pageTextStyle}>{Constants.pages_claimed}</Text>
            </TouchableOpacity>
            {this.getVerticalDivider()}
            <TouchableOpacity style={styles.pageContainer} onPress={() => this.onCreatedPagesClick()}>
              <Text style={styles.pageCountStyle}>{this.state.createdProfileData.length}</Text>
              <Text style={styles.pageTextStyle}>{Constants.page_created}</Text>
            </TouchableOpacity>
          </View>
          {this.getHorizontalDivider()}
          <View style={styles.bottomViewContainer}>
            <TouchableOpacity style={styles.horizontalItemView} onPress={() => { this.gotoVerifyIdentityScreen() }}>
              <IconShield width={RFValue(18)} height={RFValue(18)} />
              <Text style={styles.textStyle}>{Constants.verify_your_identity}</Text>
              <Text style={[{ ...styles.verifiedTextStyle, color: statusColor }]}>{this.state.isVerified ? Constants.verified : Constants.not_verified}</Text>
            </TouchableOpacity>

            {this.state.isVerified && <TouchableOpacity style={styles.horizontalItemView} onPress={() => { this.gotoBasicDetailScreen() }}>
              <AddIcon height={RFValue(18)} width={RFValue(18)} />
              <Text style={styles.textStyle}>{Constants.create_page}</Text>
            </TouchableOpacity>
            }

            {this.state.isLoggedIn && <TouchableOpacity style={styles.horizontalItemView}>
              <IconSettings width={RFValue(18)} height={RFValue(18)} />
              <Text style={styles.textStyle}>{Constants.settings}</Text>
            </TouchableOpacity>}

            <TouchableOpacity style={styles.horizontalItemView}>
              <IconInformation width={RFValue(18)} height={RFValue(18)} />
              <Text style={styles.textStyle}>{Constants.help}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.horizontalItemView}>
              <IconFAQ width={RFValue(18)} height={RFValue(18)} />
              <Text style={styles.textStyle}>{Constants.faq}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.horizontalItemView} onPress={() => { this.logout() }}>
              <Text style={styles.textStyleSignout}>{Constants.sign_out}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    )
  }

  gotoVerifyIdentityScreen() {
    this.hideBottomBar();
    this.props.navigation.navigate(Constants.screen_verify_identity, { callBack: this.callBackFunction.bind(this), hideBottomBar: this.hideBottomBar.bind(this) });
  }

  gotoBasicDetailScreen() {
    this.hideBottomBar();
    this.props.navigation.navigate(Constants.tab_more, {
      screen: Constants.screen_basic_details,
      formDetailsScreen: Constants.screen_form_details_menu,
      tabComponent: Constants.tab_more,
      stackComponent: Constants.screen_menu_dashboard,
      callBack: this.callBackFunction.bind(this),
      userData: profileData
    });
    //this.props.navigation.navigate(Constants.screen_basic_details, {callBack : this.callBackFunction.bind(this)});
  }

  logout() {
    this.props.screenProps.logout()
  }

  showBottomBar() {
    this.props.showBottomBar(true, true);
  }

  hideBottomBar() {
    this.props.showBottomBar(false);
  }

  callBackFunction() {
    this.showBottomBar();
    this.refreshData();
  }

  onClaimPagesClick() {
    if (this.state.isArrowDown) {
      this.setState({
        isArrowDown: false,
      })
    }
  }

  onCreatedPagesClick() {
    if (this.state.createdProfileData.length > 0) {
      this.hideBottomBar();
      const dataToPass = { listOfData: this.state.createdProfileData, callBack: this.callBackFunction.bind(this) };
      this.props.navigation.navigate(Constants.screen_created_page, dataToPass);
    }
  }

  getClaimedProfilesList(isIconClicked) {
    if (this.state.claimedProfileData.length > 1 && !this.state.isArrowDown) {
      let allItems = this.state.claimedProfileData;
      return this.loadOtherProfiles(allItems, isIconClicked);
    } else {
      return null;
    }
  }

  loadFirstProfile(isIconClicked) {
    if (this.state.claimedProfileData.length > 0) {
      let firstItem = this.state.claimedProfileData[0];
      firstItem.mainProfile = true
      return this.renderItemComponent(firstItem, 0, isIconClicked);
    } else {
      return null;
    }
  }

  loadOtherProfiles(profileList, isIconClicked) {
    return profileList.map((item, index) => {
      if (index !== 0) {
        return this.renderItemComponent(item, index + 1, isIconClicked);
      }
    });
  }

  renderItemComponent(mItem, index, isIconClicked) {
    let ringColor = index > 0 ? Colors.color_white : this.state.isVerified ? Colors.color_green : Colors.color_red_border;
    let profileImage = mItem.profileImage;
    if (isIconClicked && index == 0) {
      mItem.isSelected = true
    }
    if (isIconClicked && index > 0) {
      mItem.isSelected = false;
    }
    return <TouchableOpacity onPress={() => { this.onItemClick(mItem) }}
      activeOpacity={1}>
      <View style={styles.horizontalItemContainer}>
        <View style={[{ ...styles.profileImageContainer, borderColor: ringColor }]}>
          {profileImage ? <Image style={styles.profileImageStyle} source={{ uri: profileImage }} /> : <UserIcon height={RFValue(25)} width={RFValue(25)} />}
        </View>
        <View style={{ marginStart: RFValue(15) }}>
          <Text style={styles.profileNameStyle}>{mItem.profileName}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.tagNameStyle}>@{mItem.tagName}{mItem.mainProfile}</Text>
            {this.displayUpDownIcon(index)}
          </View>
        </View>
      </View>
      {mItem.isSelected && mItem.isPage && <TouchableOpacity style={styles.btnContainer}
        onPress={() => { this.onManageYourPagePress(mItem) }}
      >
        <Text style={styles.btnStyle}>{Constants.manage_your_page}</Text>
      </TouchableOpacity>}
      {index === 0 && this.state.claimedProfileData.length > 1 && !this.state.isArrowDown && this.displayDivider(RFValue(10))}
    </TouchableOpacity>
  }

  displayUpDownIcon(index) {
    return index === 0 && this.state.claimedProfileData.length > 1 ? <TouchableOpacity style={{ marginLeft: RFValue(15), marginTop: RFValue(3) }}
      onPress={() => {
        if (this.state.isArrowDown === false) {
          this.loadFirstProfile(true);
          this.getClaimedProfilesList(true);
        }
        this.setState({
          isArrowDown: !this.state.isArrowDown
        })
      }}>
      {this.state.isArrowDown ? <IconDown width={RFValue(12)} height={RFValue(7)} /> : <IconUp width={RFValue(12)} height={RFValue(7)} />}
    </TouchableOpacity> : null;
  }

  displayDivider(number) {
    let verticalOffset = number || 0;
    return <View
      style={{
        borderBottomColor: '#D0D0D0',
        borderBottomWidth: 1,
        marginVertical: verticalOffset,
        marginStart: RFValue(45)
      }}
    />
  }

  refreshData() {
    AsyncStorage.getItem(Constants.token).then((token) => {
      if (token) {
        if (token === Constants.guestToken) {

        } else {
          UserData.getUserData().then((data) => {
            profileData = data;
            this.fetchProfileData(data);
          })
        }
      }
    });
  }

  fetchProfileData = (data) => {
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        this.showIndicator();
        ApiManager.fetchUserDetails(data.userId, false)
          .then((userData) => {
            UserData.saveUserData(userData.data);
            const claimedProfiles = ApiManager.fetchClaimedProfile(data.userId, false);
            const createdProfiles = ApiManager.fetchCreatedProfiles(data.userId, false);
            const updatedUserData = UserData.getUserData();
            return Promise.all([claimedProfiles, createdProfiles, updatedUserData]);
          })
          .then((allData) => {
            this.hideIndicator();
            let claimedProfileData = allData[0].data;
            let createdProfileData = allData[1].data;
            let claimedProfileCount = claimedProfileData.length;
            let profileData = allData[2];
            let sortedProfileData = this.getSortedData(profileData, claimedProfileData);
            let isVerified = profileData.verified;
            this.setState({
              claimedProfileData: sortedProfileData,
              createdProfileData,
              isVerified,
              claimedProfileCount
            })
          })
          .catch((error) => {
            this.hideIndicator();
            console.log('Error while fetching details', error);
          })
      } else {
        this.setState({
          isVerified: data.verified
        })
      }
    });
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

  onManageYourPagePress(item) {
    this.props.navigation.navigate(Constants.screen_profile, { id: item.profileId, isEditProfile: true, mainProfile: item.mainProfile });
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

  getHorizontalDivider() {
    return <View
      style={styles.horizontalLine}
    />
  }

  getVerticalDivider() {
    return <View
      style={styles.verticalLine}
    />
  }

  showIndicator = () => {
    this.setState({
      isLoaderVisible: true
    })
  };

  hideIndicator = () => {
    this.setState({
      isLoaderVisible: false
    })
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.color_white,
    paddingBottom: RFValue(60)
  },
  horizontalLine: {
    borderBottomColor: Colors.color_user_bg,
    borderBottomWidth: RFValue(4)
  },
  verticalLine: {
    height: '100%',
    width: 1,
    backgroundColor: Colors.color_input_border,
  },
  horizontalContainer: {
    flexDirection: 'row',
    marginVertical: RFValue(10)
  },
  pageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  pageCountStyle: {
    fontFamily: Constants.font_semibold,
    fontSize: RFValue(18)
  },
  pageTextStyle: {
    fontFamily: Constants.font_regular,
    fontSize: RFValue(12),
    marginTop: RFValue(5)
  },
  horizontalItemView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: RFValue(10)
  },
  bottomViewContainer: {
    marginHorizontal: RFValue(15),
    marginVertical: RFValue(10)
  },
  textStyle: {
    fontFamily: Constants.font_regular,
    fontSize: RFValue(16),
    color: Colors.color_black,
    marginLeft: RFValue(15)
  },
  textStyleSignout: {
    fontFamily: Constants.font_regular,
    fontSize: RFValue(16),
    color: Colors.color_red_border,
  },
  verifiedTextStyle: {
    fontFamily: Constants.font_regular,
    fontSize: RFValue(12),
    right: RFValue(0),
    position: 'absolute'
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
    height: RFValue(43),
    width: RFValue(43),
    borderRadius: RFValue(43),
    borderWidth: RFValue(2),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.color_user_bg
  },
  profileImageStyle: {
    width: RFValue(40),
    height: RFValue(40),
    borderRadius: RFValue(40)
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
  }, scrollContainer: {
    flex: 1
  },
});