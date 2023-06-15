import React, { Component } from "react";
import { StyleSheet, Text, View, Modal, Platform, Dimensions, Alert, TouchableOpacity, Animated } from "react-native";
import MapView, { Marker } from 'react-native-maps';
import { RFValue } from "react-native-responsive-fontsize";
import ProfileMenuBar from '../../../sharedComponents/ProfileMenuBar';
import * as Colors from '../../../res/colors';
import * as Constants from '../../../res/strings';
import LocationIcon from '../../../assets/images/icn_location.svg';
import LocationPinIcon from '../../../assets/images/icn_location_pin.svg';
import ClearIcon from '../../../assets/images/icn_cross.svg';
import SwipeUpIcon from '../../../assets/images/icn_swipe_up.svg';
import GestureRecognizer from 'react-native-swipe-gestures';
import ListOfRepresentative from '../screens/ListOfRepresentative/ListOfRepresentative';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import Loader from '../../../sharedComponents/Loader';
import NetInfo from '@react-native-community/netinfo';
const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const usaRegion = {
  latitude: 37.09024,
  longitude: -95.712891,
  latitudeDelta: 23.5601,
  longitudeDelta: 23.5601 * ASPECT_RATIO,
};

export default class DashboardScreen extends Component {

  constructor(props) {
    super(props);
    this.gotoMoreTab = this.gotoMoreTab.bind(this);
    this.onSwipeDown = this.onSwipeDown.bind(this);
    this.gotoBasicDetailScreen = this.gotoBasicDetailScreen.bind(this);
    this.hideIndicator = this.hideIndicator.bind(this);
    this.showIndicator = this.showIndicator.bind(this);
    this.state = {
      showRepresentative: false,
      region: usaRegion,
      address: '',
      isLoaderVisible: false,
    }
    this.animated = new Animated.Value(0);
  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.isLoaderVisible && <Loader />}
        {/* <ProfileMenuBar
          ref={comp => { this.profileBar = comp; }}
          gotoLogin={this.props.screenProps.gotoLogin}
          gotoSignUp={this.props.screenProps.gotoSignUp}
          logout={this.props.screenProps.logout}
          hideIndicator={this.hideIndicator}
          showIndicator={this.showIndicator}
          gotoMoreTab={this.gotoMoreTab}
          gotoBasicDetailScreen={this.gotoBasicDetailScreen} /> */}
        <View style={{
          height: RFValue(60),
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: RFValue(10),
          backgroundColor: Colors.color_white
        }}>
          <Text style={styles.headerTextStyle} numberOfLines={1}>{Constants.find_your_representative}</Text>
          <ProfileMenuBar
            navigation={this.props.navigation}
            ref={comp => { this.profileBar = comp; }}
            gotoLogin={this.props.screenProps.gotoLogin}
            gotoSignUp={this.props.screenProps.gotoSignUp}
            logout={this.props.screenProps.logout}
            hideIndicator={this.hideIndicator}
            showIndicator={this.showIndicator}
            gotoMoreTab={this.gotoMoreTab}
            gotoBasicDetailScreen={this.gotoBasicDetailScreen}
          />
        </View>

        <View style={styles.textInputContainer}>

          <GooglePlacesAutocomplete
            ref={(ref) => { this.autoTextInput = ref }}
            placeholder={Constants.type_in_your_zip}
            fetchDetails={true}
            onPress={(data, details = null) => {
              this.state.address = data.description;
              this.changeRegion(details);
            }}
            query={{
              key: Constants.google_map_api_key,
              language: 'en',
            }}
            renderLeftButton={() => this.getLeftButton()}
            renderRightButton={() => this.renderClearButton()}
            enablePoweredByContainer={false}
            textInputProps={{
              returnKeyType: 'done',
              onChangeText: (text) => this.state.address = text.trim(),
              onSubmitEditing: () => { this.getAddressDetails(this.state.address) }
            }}
            styles={{
              textInput: {
                marginTop: RFValue(5),
                fontFamily: Constants.font_regular,
                fontSize: RFValue(17),
                color: Colors.color_black,
                height: RFValue(35)
              }
            }}
          />

        </View>

        <View style={styles.container}>
          <MapView
            ref={(ref) => { this.mapRef = ref }}
            mapType='standard'
            style={{ flex: 1 }}
            initialRegion={usaRegion}>
            <Marker
              coordinate={{ latitude: this.state.region.latitude, longitude: this.state.region.longitude }}>
              <LocationPinIcon width={RFValue(20)} height={RFValue(25)} />

            </Marker>

          </MapView>
        </View>

        <GestureRecognizer
          onSwipeUp={() => { this.onSwipeUp() }}
          style={styles.iconContainer}>
          <Animated.View style={[{ transform: [{ translateY: this.animated }] }]}>
            <SwipeUpIcon width={RFValue(35)} height={RFValue(35)} />
          </Animated.View>
          <Text style={styles.textStyle}>{Constants.swipe_up}</Text>
        </GestureRecognizer>

        <Modal visible={this.state.showRepresentative}
          animationType='slide'
          onRequestClose={() => this.onSwipeDown()}
        >
          <ListOfRepresentative close={this.onSwipeDown} navigation={this.props.navigation} address={this.state.address} />
        </Modal>
      </View>
    );
  }

  renderClearButton = () => {
    return Platform.OS === 'android' && this.state.address.length && this.autoTextInput.isFocused() ?
      <TouchableOpacity style={{ alignSelf: 'center', marginRight: RFValue(10) }} onPress={() => { this.clearTextInput() }}>
        <ClearIcon height={RFValue(18)} width={RFValue(18)} />
      </TouchableOpacity> : null;
  }

  clearTextInput = () => {
    this.autoTextInput.clear();
    this.setState({
      address: '',
    })
  }

  componentDidMount() {
    this.checkLocationPermission();
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.profileBar.refresh();
      this.showBottomBar();
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(this.animated, {
          toValue: -15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(this.animated, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  gotoMoreTab() {
    this.props.navigation.navigate(Constants.tab_more);
  }

  showBottomBar() {
    this.props.showBottomBar(true);
    this.props.showBottomBar(true, true);
  }

  hideBottomBar() {
    this.props.showBottomBar(false);
  }

  callBackFunction() {
    this.showBottomBar();
  }

  getAddressDetails = (address) => {

    const onSuccess = (responseJson) => {
      this.hideIndicator();
      if (responseJson.results.length > 0) {
        let firstResult = responseJson.results[0];
        this.changeRegion(firstResult);
      }
    };

    const onFailure = (message) => {
      console.log('Error while fetching location details : ', message);
      this.hideIndicator();
    };

    if (address) {
      NetInfo.fetch().then(state => {
        if (state.isConnected) {
          this.showIndicator();
          fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=' + Constants.google_map_api_key)
            .then((response) => response.json())
            .then(onSuccess)
            .catch(onFailure);
        } else {
          this.showAlert(Constants.network, Constants.please_check_internet);
        }
      });
    }
  }

  checkLocationPermission = () => {
    let isAndroid = Platform.OS === 'android';
    let permission_request = isAndroid ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

    return check(permission_request)
      .then((result) => {
        if (result === RESULTS.DENIED) {
          this.requestLocationPermission(permission_request);
        } else if (result === RESULTS.GRANTED) {
          this.getCurrentLocation();
        } else {
          this.setDefaultAddress();
        }
      })
      .catch((error) => {
        console.log(error.message);
      });
  }

  setDefaultAddress = () => {
    setTimeout(() => {
      this.autoTextInput.setAddressText('United States');
      this.state.address = 'United States';
    }, 0);
  }

  requestLocationPermission = (permission_request) => {
    request(permission_request).then((result) => {
      if (result === RESULTS.GRANTED) {
        this.getCurrentLocation();
      } else {
        this.setDefaultAddress();
      }
    })
  }

  getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (info) => {
        this.fetchCurrentAddressDetails(info.coords.latitude, info.coords.longitude)
      },
      (error) => {
        console.log(error.code, error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }

  fetchCurrentAddressDetails = (lat, long) => {

    const onSuccess = (responseJson) => {
      this.hideIndicator();
      if (responseJson.results.length > 0) {
        let firstResult = responseJson.results[0];
        let addressToDisplay = firstResult.formatted_address;
        this.state.address = addressToDisplay;
        this.autoTextInput.setAddressText(addressToDisplay);
        this.changeRegion(firstResult);
      }
    };

    const onFailure = (message) => {
      console.log('Error while fetching location details : ', message);
      this.hideIndicator();
    };


    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        this.showIndicator();
        fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + lat + ',' + long + '&key=' + Constants.google_map_api_key)
          .then((response) => response.json())
          .then(onSuccess)
          .catch(onFailure);
      } else {
        this.showAlert(Constants.network, Constants.please_check_internet);
      }
    });

  }

  showAlert = (title, msg) => {
    Alert.alert(title, msg);
  }

  onSwipeUp = () => {
    this.setState({
      showRepresentative: true
    })
  }

  gotoBasicDetailScreen = (userData) => {
    this.hideBottomBar();
    this.props.navigation.navigate(Constants.tab_representative, {
      screen: Constants.screen_basic_details,
      formDetailsScreen: Constants.screen_form_details_dashboard,
      tabComponent: Constants.tab_representative,
      stackComponent: Constants.screen_dashboard,
      callBack: this.callBackFunction.bind(this),
      userData
    });
  }

  onSwipeDown = () => {
    this.setState({
      showRepresentative: false
    })
  }

  getLeftButton = () => {
    return (
      <View style={{ alignSelf: 'center', marginLeft: RFValue(10) }}>
        <LocationIcon width={RFValue(23)} height={RFValue(23)} />
      </View>
    );
  }

  changeRegion = (details) => {

    let lat = details.geometry.location.lat;
    let lng = details.geometry.location.lng;
    let latDelta = details.geometry.viewport.northeast.lat - details.geometry.viewport.southwest.lat;
    let lngDelta = latDelta * ASPECT_RATIO;

    var newRegion = {
      latitude: lat,
      longitude: lng,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
    this.mapRef.animateToRegion(newRegion, 0);

    this.setState({
      region: newRegion
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
  container: {
    flex: 1
  },
  textInputContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: RFValue(80),
    right: RFValue(15),
    left: RFValue(15),
    backgroundColor: Colors.color_white,
    zIndex: 1,
    alignItems: 'center',
    borderColor: Colors.color_light_grey,
    borderWidth: 1,
    borderRadius: 6
  },
  iconContainer: {
    position: 'absolute',
    bottom: RFValue(80),
    zIndex: 1,
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center'
  },
  textStyle: {
    fontFamily: Constants.font_regular,
    color: Colors.color_black,
    fontSize: RFValue(14)
  },
  clearIconContainer: {
    position: 'absolute',
    justifyContent: 'center',
    end: RFValue(10),
    height: RFValue(40),
    marginTop: RFValue(4),
    zIndex: 1
  },
  headerTextStyle: {
    fontSize: RFValue(21),
    fontFamily: Constants.font_semibold
  },
});