import React, { Component } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Alert,
  TextInput,
  BackHandler,
  FlatList,
  Image,
  Keyboard,
} from 'react-native';
import * as Constants from '../../../../res/strings';
import { RFValue } from 'react-native-responsive-fontsize';
import { Button } from 'react-native-paper';
import * as Colors from '../../../../res/colors';
import SearchIcon from '../../../../assets/images/icn_search.svg';
import { StackActions } from '@react-navigation/routers';
import NetInfo from '@react-native-community/netinfo';
import * as ApiManager from '../../../../apiManager/ApiManager';
import * as ManageUserData from '../../../../localStorage/UserData';
import Loader from '../../../../sharedComponents/Loader';
import UserIcon from '../../../../assets/images/icn_user.svg';

let profileData = '';

export default class CongratulationScreen extends Component {

  constructor(props) {
    super(props);
    this.isFromTextVerification = props.route.params.isTextVerification;
    this.state = {
      searchedKeywords: [],
      allData: [],
      isLoaderVisible: false,
      showList: false,
      keyword: '',
    }
  }

  render() {
    return (
      <View style={styles.maincontainer}>
        {this.state.isLoaderVisible && <Loader />}
        <Text style={styles.textCongratulations}>
          {Constants.congratulations}
        </Text>
        <Text style={styles.verifiyText}>
          {Constants.you_can_start_by_creating_your_own_page}
        </Text>
        <Text style={styles.textStyle}>
          {Constants.didnt_find_any_matching_pages}
        </Text>

        <View style={styles.textInputViewStyle}>
          <TextInput
            style={styles.textInputStyle}
            selectionColor={Colors.color_black}
            placeholder={Constants.search_page}
            mode="outlined"
            onChangeText={(text) => { this.state.keyword = text.trim() }}
            returnKeyType='search'
            onSubmitEditing={() => { this.displayList() }}
          />
          {this.getSearchIcon()}
        </View>
        {this.renderList()}
        <View style={styles.bottomContainer}>
          <Text style={styles.bottomText}>
            {Constants.still_dont_see_the_page}
          </Text>
          <TouchableOpacity activeOpacity={0.8} style={styles.btnStyle} onPress={() => {
            this.gotoBasicDetailScreen();
          }}>
            <Text style={styles.btnTextStyle}>{Constants.create_page}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  checkoutProfile = (name) => {
    console.log(name);
    let params = {
      name: name
    }
    var myHeaders = new Headers();
    myHeaders.append("Content-type", "application/json");
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        ApiManager.getUserProfile(params, myHeaders)
          .then(success => {
            let data = success.data;
            this.props.navigation.navigate(Constants.screen_profile, { id: data.profileId })
          })
          .catch(error => {
            alert("Profile not Found");
            console.log(error);
          });
      } else {
        Alert.alert(Constants.network, Constants.please_check_internet);
      }
    });
  }

  getSearchIcon = () => {
    return (
      <TouchableOpacity activeOpacity={0.7} style={styles.iconContainer} onPress={() => { this.displayList() }}>
        <SearchIcon height={RFValue(15)} width={RFValue(15)} />
      </TouchableOpacity>
    );
  };

  gotoBasicDetailScreen = () => {
    const popAction = StackActions.pop(4);
    this.props.navigation.dispatch(popAction);
    this.props.navigation.navigate(Constants.tab_more, {
      screen: Constants.screen_basic_details,
      formDetailsScreen: Constants.screen_form_details_menu,
      tabComponent: Constants.tab_more,
      stackComponent: Constants.screen_congratulation,
      callBack: '',
      userData: profileData
    });
  }

  displayList() {
    Keyboard.dismiss();
    if (this.state.keyword.length > 0) {
      let text = this.state.keyword;
      const filteredList = this.state.allData.filter(item => (item.profileName && item.profileName.toUpperCase().includes(text.toUpperCase())));
      this.setState({
        showList: true,
        searchedKeywords: filteredList
      })
    }
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.goBack);
    ManageUserData.getUserData().then((data) => {
      profileData = data;
      let fullName = data.firstName + ' ' + data.lastName;
      this.fetchPageList(fullName);
    })
  }

  renderList() {
    return <View style={{ flex: 1, marginBottom: RFValue(20) }}>
      {this.state.showList ? this.state.searchedKeywords.length < 1 ? <Text style={styles.textStyle}>{Constants.sorry_we_didnt_find_any_matching_page}</Text> :
        <View style={styles.listContainer}>
          <FlatList
            data={this.state.searchedKeywords}
            renderItem={(item) => this.renderItemComponent(item, this.state.searchedKeywords.length)}
            keyExtractor={(item, index) => index.toString()}
          />
        </View> : null
      }
    </View>;
  }

  renderItemComponent(mItem, size) {
    let profileName = mItem.item.profileName;
    let profileImage = mItem.item.profileImage;
    let tagName = mItem.item.tagName;
    let index = mItem.index;

    return <TouchableOpacity activeOpacity={1} onPress={() => this.checkoutProfile(tagName)}>
      <View style={styles.horizontalItemContainer}>
        <View style={styles.profileImageContainer}>
          {profileImage ? <Image style={styles.profileImageStyle} source={{ uri: profileImage }} /> : <UserIcon height={RFValue(25)} width={RFValue(25)} />}
        </View>
        <Text style={styles.profileNameStyle}>{profileName}</Text>
      </View>
      {size > 1 && index + 1 != size && <View
        style={{
          borderBottomColor: Colors.color_input_border,
          borderBottomWidth: 1
        }} />}
    </TouchableOpacity>
  }

  goBack = () => {
    if (this.isFromTextVerification) {
      // const popAction = StackActions.pop(2);
      // this.props.navigation.dispatch(popAction);

      this.props.navigation.navigate(Constants.screen_menu_dashboard);
    }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.goBack);
  }

  fetchPageList = (text) => {
    const onSuccess = (response) => {
      this.hideIndicator();
      this.setState({
        searchedKeywords: response.data,
        allData: response.data,
      })
    };

    const onFailure = (error) => {
      this.hideIndicator();
    };

    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        this.showIndicator();
        ApiManager.fetchTagNames(text, '', true)
          .then(onSuccess)
          .catch(onFailure);
      } else {
        Alert.alert(Constants.network, Constants.please_check_internet);
      }
    });
  }

  showIndicator = () => {
    this.setState({
      isLoaderVisible: true
    })
  }

  hideIndicator = () => {
    this.setState({
      isLoaderVisible: false
    })
  }
}

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    backgroundColor: Colors.color_white,
    paddingHorizontal: RFValue(14)
  },
  textCongratulations: {
    fontSize: RFValue(26),
    textAlign: 'center',
    color: Colors.color_green,
    fontFamily: Constants.font_semibold,
    marginTop: RFValue(43)
  },
  verifiyText: {
    fontSize: RFValue(14),
    textAlign: 'center',
    color: Colors.color_black,
    fontFamily: Constants.font_light,
    marginTop: RFValue(5),
    marginHorizontal: RFValue(25),
    marginBottom: RFValue(40)
  },
  textStyle: {
    fontSize: RFValue(14),
    textAlign: 'center',
    color: Colors.color_black,
    fontFamily: Constants.font_regular
  },
  bottomContainer: {
    paddingBottom: RFValue(27),
    justifyContent: 'center',
    alignSelf: 'center',
    flexDirection: 'column',
    width: '100%',
  },
  textStyle1: {
    fontSize: RFValue(14),
    fontFamily: Constants.font_regular,
    color: Colors.color_black,
    textAlign: 'center',
  },
  bottomText: {
    fontSize: RFValue(14),
    fontFamily: Constants.font_regular,
    color: Colors.color_black,
    textAlign: 'center',
    marginBottom: RFValue(12),
  },
  btnStyle: {
    height: RFValue(40),
    backgroundColor: Colors.color_black,
    borderRadius: RFValue(4),
    justifyContent: 'center',
    alignItems: 'center',
    width: RFValue(212),
    alignSelf: 'center'
  },
  btnTextStyle: {
    color: Colors.color_white,
    fontSize: RFValue(14),
    fontFamily: Constants.font_semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8
  },
  iconContainer: {
    position: 'absolute',
    justifyContent: 'center',
    end: 0,
    height: RFValue(40),
    width: RFValue(40),
    padding: RFValue(12),
    backgroundColor: Colors.color_black,
    borderTopRightRadius: RFValue(5),
    borderBottomRightRadius: RFValue(5)
  },
  textInputViewStyle: {
    height: RFValue(40),
    marginVertical: RFValue(20)
  },
  textInputStyle: {
    borderWidth: RFValue(1),
    borderRadius: RFValue(5),
    paddingHorizontal: RFValue(15),
    marginRight: RFValue(38),
    fontSize: RFValue(16),
    fontFamily: Constants.font_regular,
    borderColor: Colors.color_input_border,
    height: RFValue(40)
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
  profileImageContainer: {
    height: RFValue(43),
    width: RFValue(43),
    borderRadius: RFValue(43),
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
    margin: RFValue(10)
  },
  profileNameStyle: {
    fontFamily: Constants.font_regular,
    fontSize: RFValue(16),
    color: Colors.color_black,
    marginLeft: RFValue(15)
  },
  listContainer: {
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#ddd',
  },
});
