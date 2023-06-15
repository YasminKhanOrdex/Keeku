import React, { Component } from 'react';
import { Text, TouchableOpacity, View, StyleSheet, Alert } from 'react-native';
import * as Constants from '../../../../res/strings';
import { RFValue } from 'react-native-responsive-fontsize';
import TextVerification from '../../../../assets/images/icn_text_verification.svg';
import RightArrow from '../../../../assets/images/icn_black_right_arrow.svg';
import IdentitiyIcon from '../../../../assets/images/icn_id_card.svg';
import * as Colors from '../../../../res/colors';
import BackMenuBar from '../../../../sharedComponents/BackMenuBar';
import * as UserData from '../../../../localStorage/UserData';
import NetInfo from '@react-native-community/netinfo';
import * as ApiManager from '../../../../apiManager/ApiManager';
import Loader from '../../../../sharedComponents/Loader';
import VeriffSdk from '@veriff/react-native-sdk';

export default class VerifiyIdentityScreen extends Component {
  constructor(props) {
    super(props);
    this.onBackPress = this.onBackPress.bind(this);
    this.state = {
      textVerified: false,
      identityVerified: false,
      isLoaderVisible: false,
      isVeribageVisible: false
    };
  }

  render() {
    return (
      <View style={styles.mainContainer}>
        {this.state.isLoaderVisible && <Loader />}
        <BackMenuBar title={Constants.verify_your_identity2}
          action={this.onBackPress} />
        {this.state.isVeribageVisible && <View style={styles.firstContent}>
          <Text style={styles.verifiyIdentityContent}>
            {Constants.verify_identity_content}
          </Text>
        </View>}
        <Text style={styles.verifyProcesses}>
          {Constants.verify_complete_below_processes}
        </Text>

        <View style={styles.textVerification}>
          <TouchableOpacity style={styles.textRow} onPress={() => { this.gotoTextVerificationMobileScreen() }}>
            <TextVerification height={RFValue(19)} width={RFValue(16)} />
            <Text style={styles.textVerificationText}>
              {Constants.text_verification}
            </Text>
            <View style={styles.iconContainer}>
              {this.state.textVerified ? <Text style={styles.verifiedText}>{Constants.verified}</Text> : <RightArrow height={RFValue(13)} width={RFValue(8)} />}
            </View>
          </TouchableOpacity>
          <View style={styles.baseline}></View>

          <TouchableOpacity style={styles.textRow} onPress={() => { this.createVeriffSessionURL() }}>
            <IdentitiyIcon height={RFValue(19)} width={RFValue(16)} />
            <Text style={styles.textVerificationText}>
              {Constants.identity_verification}
            </Text>
            <View style={styles.iconContainer}>
              {this.state.identityVerified ? <Text style={styles.verifiedText}>{Constants.verified}</Text> : <RightArrow height={RFValue(13)} width={RFValue(8)} />}
            </View>
          </TouchableOpacity>
          <View style={styles.baseline}></View>
          <Text style={styles.lstext}>
            {Constants.already_applied_for_verify}
          </Text>
        </View>
      </View>
    );
  }

  createVeriffSessionURL() {
    UserData.getUserData().then((data) => {
      const dataToPass = {
        verification: {
          vendorData: data.userId.toString(),
          timestamp: new Date(Date.now()).toISOString(),
          person: {
            firstName: data.firstName,
            lastName: data.lastName
          }
        }
      }
      this.generateSessionURL(dataToPass, data.userId);
    });
  }

  generateSessionURL(data, userId) {
    const onSuccess = (response) => {
      this.hideIndicator();
      if (response.status === 'success') {
        let sessionId = response.verification.id;
        let sessionUrl = response.verification.url;
        this.callVeriffDetailsApi(userId, sessionId, sessionUrl);
      }
    };

    const onFailure = (message) => {
      console.log('Error while fetching location details : ', message);
      this.hideIndicator();
    };

    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        this.showIndicator();
        fetch('https://stationapi.veriff.com/v1/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-AUTH-CLIENT': '836b96b7-c19a-48c0-a514-2ac42f77ed5e'
          },
          body: JSON.stringify(data)
        })
          .then((response) => response.json())
          .then(onSuccess)
          .catch(onFailure);
      } else {
        Alert.alert(Constants.network, Constants.please_check_internet);
      }
    });
  }

  gotoTextVerificationMobileScreen() {
    let params = this.props.route.params;
    this.props.navigation.navigate(Constants.screen_text_verification_mobile, { hideBottomBar: params?.hideBottomBar.bind(this), callBack: params?.callBack.bind(this) });
  }

  gotoCongratulationScreen() {
    this.props.navigation.navigate(Constants.screen_congratulation, { isTextVerification: false });
  }

  async gotoIdentityVerification(SESSION_URL) {
    var result = await VeriffSdk.launchVeriff({ sessionUrl: SESSION_URL });
    this.refresh(true);
  }

  callVeriffDetailsApi(userId, sessionId, sessionUrl) {
    const onSuccess = (response) => {
      this.hideIndicator();
      if (response.success === 0) {
        this.gotoIdentityVerification(sessionUrl);
      } else {
        showAlert('', response.message);
      }
    };

    const onFailure = (message) => {
      this.hideIndicator();
    };

    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        this.showIndicator();
        ApiManager.veriffDetails(userId, sessionId, true)
          .then(onSuccess)
          .catch(onFailure);
      } else {
        Alert.alert(Constants.network, Constants.please_check_internet);
      }
    });
  }

  onBackPress() {
    // this.props.navigation.goBack();
    this.props.navigation.navigate(Constants.screen_menu_dashboard);
  }

  componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.refresh();
    });
  }

  componentWillUnmount() {
    this._unsubscribe();
    this.props.route.params?.callBack();
  }

  fetchRequiredData = (data, isVeriff) => {
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        // this.showIndicator();
        ApiManager.fetchUserDetails(data.userId, false)
          .then((userData) => {
            UserData.saveUserData(userData.data);
            //const updatedUserData = UserData.getUserData();
            return userData.data;
          })
          .then((updatedData) => {
            this.hideIndicator();
            let textVerified = updatedData.textVerified;
            let identityVerified = updatedData.veriffFlag;
            let isVerified = updatedData.verified;
            let showCongratsScreen = updatedData.showCongratsScreen;
            this.setState({
              textVerified,
              identityVerified,
              isVeribageVisible: !isVerified,
            })
            if (isVeriff && textVerified && identityVerified && showCongratsScreen) {
              this.gotoCongratulationScreen();
            }
          })
          .catch((error) => {
            this.hideIndicator();
            console.log('Error while fetching details', error);
          })
      } else {
        let textVerified = data.textVerified;
        let identityVerified = data.veriffFlag;
        this.setState({
          textVerified,
          identityVerified
        })
      }
    });
  }

  refresh(isVeriff) {
    UserData.getUserData().then((data) => {
      this.fetchRequiredData(data, isVeriff);
    })
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
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.color_white
  },
  firstContent: {
    backgroundColor: Colors.color_saffron
  },
  verifiyIdentityContent: {
    marginHorizontal: RFValue(15),
    marginVertical: RFValue(5),
    fontSize: RFValue(12),
    fontFamily: Constants.font_light,
  },
  verifyProcesses: {
    marginHorizontal: RFValue(15),
    marginTop: RFValue(15),
    fontSize: RFValue(14),
    color: Colors.color_black,
    fontFamily: Constants.font_regular,
  },
  textVerification: {
    flex: 1,
    marginHorizontal: RFValue(15),
    marginTop: RFValue(30)
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  textVerificationText: {
    fontSize: RFValue(16),
    marginLeft: RFValue(7),
    marginRight: RFValue(120),
    fontFamily: Constants.font_regular,
    color: Colors.color_black,
  },
  baseline: {
    height: 1,
    width: 'auto',
    backgroundColor: Colors.color_light_grey,
    marginVertical: RFValue(13),
  },
  lstext: {
    color: Colors.color_gray,
    fontFamily: Constants.font_light,
    fontSize: RFValue(12),
  },
  verifiedText: {
    fontFamily: Constants.font_regular,
    fontSize: RFValue(12),
    color: Colors.color_green,
  },
  pendingText: {
    fontFamily: Constants.font_regular,
    fontSize: RFValue(12),
    color: Colors.color_yellow,
  },
  iconContainer: {
    position: 'absolute',
    justifyContent: 'center',
    end: 0,
    marginTop: RFValue(5),
    zIndex: 1,
  },
});