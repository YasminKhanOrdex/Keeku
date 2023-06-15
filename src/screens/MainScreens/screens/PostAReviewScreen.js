import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity as Touchable,
  Dimensions,
  ImageBackground,
  Pressable,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import moment from 'moment';
import FriendlyReminder from '../../MainScreens/screens/MenuScreens/FriendlyReminder';
import globalStyles from '../../../res/styles';
import * as Constants from './../../../res/strings';
import { RFValue } from 'react-native-responsive-fontsize';
import { Button } from 'react-native-paper';
import * as Colors from './../../../res/colors';
import GreenTick from './../../../assets/images/icn_green_tick.svg';
import UploadMedia from './../../../assets/images/icn_upload_media.svg';
import UserIcon from './../../../assets/images/icn_user.svg';
import CrossIcon from './../../../assets/images/Cross.svg';
import Triangle from './../../../assets/images/Triangle.svg';
import Circle from './../../../assets/images/Circle.svg';
import * as UserData from '../../../localStorage/UserData';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import SelectionModal from '../../MainScreens/screens/MenuScreens/ProfilephotoModel';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { createThumbnail } from 'react-native-create-thumbnail';
import NetInfo from '@react-native-community/netinfo';
import * as ApiManager from '../../../apiManager/ApiManager';
import Loader from '../../../sharedComponents/Loader';
import axios from 'axios';
import MentionInputComponent from '../../../sharedComponents/MentionInputComponent';
import { MentionInput, Suggestion, replaceMentionValues } from 'react-native-controlled-mentions';
import { ScrollView as ScrollHandler } from 'react-native-gesture-handler';
import PostReviewRestrictModal from '../screens/PostReviewRestrictModal';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;


export default class PostAReviewScreen extends Component {

  verbShowingDate;
  verbFrequency;
  userId;

  inputRef = React.createRef();
  constructor(props) {
    super(props);
    this.defaultState = {
      isLoaderVisible: false,
      containerZIndex: 1,
      userData: {},
      isSelectionModalVisible: false,
      media: [],
      isVideo: null,
      userName: '',
      tagProfileId: null,
      isUserNameRequireError: false,
      reviewText: '',
      isReviewTextRequireError: false,
      isMediaLengthError: false,
      isSizeExceed: false,
      queryResult: [],
      mentionResult: [],
      show: false,
      showMention: false,
      isOwnProfileSelected: false,
      selectedMentionedUsers: [],
      mentionData: [],
      value: "",
      inputZindex: 0,
      postDataDTO: {
        id: null,
        content: '',
        media: null,
        profileId: null,
        byUserId: null,
        byProfileId: null,
        isReview: true,
        reviewId: null,
        byProfileName: '',
        byProfileImage: '',
        onProfileTagName: '',
        mentionProfileIds: '',
        daysAgo: '',
        responseCount: null,
        createdBy: null,
        byProfileTagName: null,
        level: null,
        createdDate: '',
        responseId: null,
        priority: null,
        finalPriority: null,
        responseLevel: null,
      },
    };
    this.state = {
      ...this.defaultState,
      isVisible: false,
      isVisibleRestrict: false
      // vershowData: [],
    };
  }

  componentDidMount() {
    this.fetchUserData();
    this.props.navigation.addListener('focus', () => {
      this.fetchUserData();
    });
  }

  fetchUserData() {
    UserData.getUserData()
      .then(data => {
        if (data !== null) {
          this.userId = data.userId;
          this.verbShowingDate = data.verbShowingDate;
          this.verbFrequency = data.verbeFrequency;

          //friendly reminder
          let isVisible = false;
          let isVisibleRestrict = false;
          if (data.verbShowingDate == null) {
            isVisible = true;
          } else {
            isVisible = this.calculateVerbDate(data.verbShowingDate)
          }
          if (data.defaultProfileId == null) {
            isVisibleRestrict = true;

          }
          else {
            isVisibleRestrict = false;
          }
          this.setState({
            userData: data,
            isVisible: isVisible,
            isVisibleRestrict: isVisibleRestrict
          })
        }
      })
      .catch(error => {
        console.log('error while getting data from local storage@@@@@@@@@@');
      });
  }

  calculateVerbDate(dateSent) {
    this.fndlyHideModal();
    dateSent = new Date(moment(dateSent));
    let result = false;
    if (!!dateSent) {
      var date1 = moment(new Date()).format("YYYY-MM-DD"); // current date
      var date2 = moment(dateSent).format("YYYY-MM-DD"); // verbShowing date
      result = date1 >= date2 ? true : false;
    } else {
      result = true;
    }
    return result;
  }

  setUserVerbDetail() {
    var verbeFrequency = this.state.userData.verbFrequency;
    if (verbeFrequency == null) {
      verbeFrequency = 7;
    } else if (verbeFrequency == '7') {
      verbeFrequency = 15;
    } else if (verbeFrequency == '15') {
      verbeFrequency = 30;
    } else if (verbeFrequency == '30') {
      verbeFrequency = 30;
    }
    var currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + verbeFrequency); //number  of days to add, e.x. 15 days
    let verbShowingDate = JSON.stringify(currentDate);
    verbShowingDate = verbShowingDate.slice(1, 11);
    this.state.postDataDTO.byUserId = this.state.userData.userId;

    NetInfo.fetch().then(state => {
      if (state.isConnected) {

        ApiManager.setVerbDetail(this.userId, verbShowingDate, verbeFrequency)
          .then(onSuccess)
          .catch(onFailure);

      }
      else {
        this.showAlert(Constants.network, Constants.please_check_internet);
      }
    });

    const onSuccess = response => {
      if (response.success === 0) {
        const user = response.data;

        let userData = this.state.userData;
        userData.verbShowingDate = user.verbShowingDate;
        userData.verbeFrequency = user.verbeFrequency;

        this.setState({
          userData: userData
        })

        UserData.saveUserData(this.state.userData);
        this.hideIndicator();
      }
    };
    const onFailure = error => {
      console.log('error ============== ', error);
      this.hideIndicator();

    };
  }

  checkCameraPermission = type => {
    let permission_request = PERMISSIONS.ANDROID.CAMERA;
    return check(permission_request)
      .then(result => {
        if (result === RESULTS.DENIED) {
          this.requestCameraPermission(permission_request, type);
        } else if (result === RESULTS.GRANTED) {
          this.launchCamera(type);
        } else if (result == RESULTS.BLOCKED) {
          Alert.alert(
            Constants.camera_permission,
            Constants.camera_instruction,
          );
        }
      })
      .catch(error => {
        console.log(error.message);
      });
  };

  requestCameraPermission = (permission_request, type) => {
    request(permission_request).then(result => {
      if (result === RESULTS.GRANTED) {
        this.launchCamera(type);
      } else {
        Alert.alert(Constants.camera_permission, Constants.camera_instruction);
      }
    });
  };

  openGallery = () => {
    this.hideModal();
    setTimeout(() => {
      launchImageLibrary(
        {
          selectionLimit: 0,
          includeBase64: true,
          mediaType: 'mixed',
        },
        response => {
          this.onResult(response);
        },
      );
    }, 100);
  };

  openCamera = type => {
    this.hideModal();
    if (Platform.OS === 'ios') {
      this.launchCamera(type);
    } else {
      this.checkCameraPermission(type);
    }
  };

  launchCamera = type => {
    setTimeout(() => {
      launchCamera(
        {
          mediaType: type,
          saveToPhotos: false,
          selectionLimit: 0,
        },
        response => {
          this.onResult(response);
        },
      );
    }, 100);
  };

  onResult = async response => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.errorCode) {
      console.log('ImagePicker Error: ', response.errorMessage);
    } else {
      this.setState({
        isSizeExceed: false,
        isLoaderVisible: true
      });

      var count = 7;
      let flag = false;

      if (this.state.media.length + response.assets.length > 7) {
        flag = true;
        count = 7 - this.state.media.length;
      }

      let media = response.assets.slice(0, count);
      // console.log("media ================= ", media);

      for (let i = 0; i < media.length; i++) {

        if (media[i].fileSize > 26214400) {
          this.setState({
            isSizeExceed: true,
          });
          return;
        }

        if (media[i].duration) {
          createThumbnail({
            url: media[i].uri,
            timeStamp: 1000,
          }).then(response => {
            media[i].thumbnail = response.path;
          });
        } else {
        }

        if (media[i].type) {

          const response = await fetch(media[i].uri);
          const blob = await response.blob();
          console.log("blob ============== ", blob);
          var file = new File([blob], `${media[i].fileName}`);
          // console.log("file ================ ", file);

          // console.log("media[i] ========== ", media[i]);

          // let formData = new FormData();

          // formData.append('file', blob);

          // convert using base64 to binary
          let ed = 'data:image/jpeg;base64,' + media[i].base64;


          let config = {
            headers: {
              'Content-Type': 'image/jpeg',
              // 'Accept-Encoding': 'gzip, deflate',
              // 'Access-Control-Allow-Credentials': 'true',
              // 'Access-Control-Allow-Origin': '*',
              // 'Access-Control-Allow-Methods': 'POST',
              'Ocp-Apim-Subscription-Key': '4c800313a0424d11b2a2992d7fb04862',
              // 'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
              // Accept: 'application/json, text/plain, */*',
            }
          }

          axios.post(
            "https://westus.api.cognitive.microsoft.com/contentmoderator/moderate/v1.0/ProcessImage/Evaluate",
            ed,
            config
          ).then((data) => {
          }).catch((e) => {
            console.log("error ========== ", { e });
          })
        }

      }

      setTimeout(() => {
        this.setState({
          media: this.state.media.concat(media),
          isMediaLengthError: flag,
          isLoaderVisible: false
        });
      }, 100);
    }
  };

  removeItem(item) {
    let mediaArray = [...this.state.media];
    let index = mediaArray.indexOf(item);
    if (index !== -1) {
      mediaArray.splice(index, 1);
      this.setState({ media: mediaArray });
    }
  }

  async onPostReview() {
    if (!this.state.userName.trim()) {
      this.setState({
        isUserNameRequireError: true,
        userName: this.state.userName.trim()
      });
      return;
    } else {
      this.setState({
        isUserNameRequireError: false
      });
    }
    if (!this.state.reviewText.trim()) {
      this.setState({
        isReviewTextRequireError: true,
        reviewText: this.state.reviewText.trim()
      });
      return;
    } else {
      this.setState({
        isReviewTextRequireError: false,
      });
    }

    let params = {
      name: this.state.userName
    }
    var myHeaders = new Headers();
    myHeaders.append("Content-type", "application/json");
    this.showIndicator();
    let isTagNameValid = await ApiManager.getUserProfile(params, myHeaders);


    if (isTagNameValid.data == null) {
      // TODO: display error message accordingly.
      alert("Username does not exist. Please check username");
      this.hideIndicator();
      return;
    }

    let contentMentionList = [];
    let mentionIds = [];
    let content = `<p>${replaceMentionValues(this.state.reviewText, ({ name }) => `<span data-mention="@${name}">@${name}</span>`)}</p>`
    let contentString = replaceMentionValues(this.state.reviewText, ({ name }) => `@${name}`)
    let array = contentString.split(" ");

    array.forEach((element) => {
      if (element.includes("@")) {
        contentMentionList.push(element.split("@")[1]);
      }
    });

    contentMentionList.forEach((mentionTag) => {
      this.state.selectedMentionedUsers.some(function (el) {
        if (el.name === mentionTag) {
          mentionIds.push(el.id);
        };
      });
    });

    if (mentionIds.length > 0) {
      mentionIds.push(this.state.tagProfileId);
      this.state.postDataDTO.mentionProfileIds = mentionIds.join(",");
    }
    else {
      this.state.postDataDTO.mentionProfileIds = this.state.tagProfileId;
    }


    this.state.postDataDTO.content = content;
    this.state.postDataDTO.profileId = this.state.tagProfileId;
    this.state.postDataDTO.byUserId = this.state.userData.userId;
    this.state.postDataDTO.byProfileId = this.state.userData.defaultProfileId;

    const formData = new FormData();
    formData.append('reviewDTO', JSON.stringify(this.state.postDataDTO));

    var i;
    var mediaSize = 0;
    if (this.state.media.length > 0) {
      for (i = 0; i < this.state.media.length; i++) {

        let media = this.state.media[i];
        var fileJson = {};

        if (media.duration) {
          fileJson.type = 'video/mkv';
          fileJson.uri = media.uri;
          fileJson.name = `${media.fileName}.mkv`;
        } else {
          fileJson.type = media.type;
          fileJson.uri = media.uri;
          fileJson.name = media.fileName;
        }
        formData.append('mediaFile', fileJson);
      }
    }
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        ApiManager.postReview(formData, true).then(onSuccess).catch(onFailure);
      } else {
        this.showAlert(Constants.network, Constants.please_check_internet);
      }
    });

    const onSuccess = response => {
      if (response.success === 0) {
        this.hideIndicator();
        Alert.alert("Success", "Review posted successfully!!", [
          { text: 'ok', onPress: () => this.props.navigation.navigate(Constants.screen_dashboard) },]);

        let userData = this.state.userData;
        this.setState({
          ...this.defaultState,
          userData: userData
        })

        // flag = this.calculateVerbDate(response.verbShowingDate);
        // console.log("in post review Api call cal fn", isVisible)
        // console.log("**********cal---------^^^^^veb******", JSON.stringify(response.verbShowingDate))
        // this.fetchUserData();
      }

      var date1 = moment(new Date()).format("YYYY-MM-DD")// current date
      var date2 = null;
      if (this.state.userData.verbShowingDate != null) {
        date2 = moment(this.state.userData.verbShowingDate).format("YYYY-MM-DD"); // verbShowing date      
      } else {
        date2 = date1;
      }
      if (date1 >= date2) {
        this.setUserVerbDetail();
      }
    };

    const onFailure = error => {
      console.log('error ============== ', error);
      this.hideIndicator();
      this.showAlert("Failure", "There is something wrong to post review!!");
    };

  }

  onUserNameChange(username) {

    this.setState({
      userName: username,
      isUserNameRequireError: false,
      isOwnProfileSelected: false,
    });

    const onSuccess = response => {
      if (response.data.length > 0) {
        this.setState({
          queryResult: response.data,
          show: true,
          containerZIndex: -1
        });
      } else {
        this.setState({
          queryResult: [],
          show: false,
          containerZIndex: 1
        });
      }
    };

    const onFailure = error => {
      // this.hideIndicator();
    };

    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        // this.showIndicator();
        ApiManager.fetchTagNames(username, 5, true)
          .then(onSuccess)
          .catch(onFailure);
      } else {
        this.showAlert(Constants.network, Constants.please_check_internet);
      }
    });
  }

  getMentionData = (suggestions) => ({ keyword, onSuggestionPress }) => {

    if (keyword == null) {
      return null;
    }

    const onSuccess = response => {
      let array = [];
      let obj = {
        id: null,
        name: ""
      }
      response.data.forEach((item) => {
        obj = {
          id: item.profileId,
          name: item.tagName,
          profileName: item.profileName,
          profileImage: item.profileImage
        };
        array.push(obj);
      })

      if (this.state.mentionData.join('') != array.join('')) {
        this.setState({
          mentionData: array
        })
      }
    };

    const onFailure = error => {
      // this.hideIndicator();
    };

    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        // this.showIndicator();
        ApiManager.fetchTagNames(keyword, 5, true)
          .then(onSuccess)
          .catch(onFailure);
      } else {
        this.showAlert(Constants.network, Constants.please_check_internet);
      }
    });

    const RenderFunction = (one, index) => {
      if (index < 4) {
        return (
          <TouchableOpacity
            onPress={() => {
              onSuggestionPress(one);
              this.state.selectedMentionedUsers.push(one);
              this.state.mentionData = [];
            }}
            style={styles.itemContainer}>
            <View style={styles.smallImageContainer}>
              {one.profileImage ?
                <Image style={{ height: RFValue(25), width: RFValue(25), borderRadius: RFValue(25) / 2 }} source={{ uri: one.profileImage }} />
                :
                <UserIcon height={RFValue(15)} width={RFValue(15)} />
              }
            </View>
            <View style={{ marginLeft: RFValue(10) }}>
              <Text numberOfLines={1} style={styles.mainTextStyle}>{one.profileName}</Text>
              <Text numberOfLines={1} style={styles.subTextStyle}>{one.name}</Text>
            </View>
          </TouchableOpacity>
        )
      }
    }
    const goToCreatePage = (keyword) => {
      this.props.navigation.navigate(Constants.tab_more, {
        screen: Constants.screen_basic_details,
        formDetailsScreen: Constants.screen_form_details_menu,
        tabComponent: Constants.tab_more,
        stackComponent: Constants.screen_menu_dashboard,
        callBack: () => { },
        userData: { ...this.state.userData, userName: keyword },
        setUserName: true
      });
    }
    if (this.state.mentionData.length > 0) {
      return (
        <View style={[styles.suggestionsModal, keyword !== undefined && !keyword.includes(' ') && {
          borderWidth: 1,
          paddingVertical: RFValue(4),
          paddingHorizontal: RFValue(8),
          position: 'absolute',
          zIndex: 1,
          bottom: '102%',
        }]}>
          <FlatList
            data={keyword !== undefined && !keyword.includes(' ') && this.state.mentionData}
            renderItem={({ item, index }) => RenderFunction(item, index)}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      );
    } else if (keyword !== undefined && keyword.length > 0 && !keyword.includes(' ')) {
      return (
        <View pointerEvents={'box-none'}
          style={[styles.suggestionsModal, {
            borderWidth: 1,
            paddingVertical: RFValue(4),
            paddingHorizontal: RFValue(8),
            position: 'absolute',
            zIndex: 100,
            top: '102%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center'
          }]}>
          <Text>{keyword}</Text>
          <TouchableOpacity
            onPress={() => goToCreatePage(keyword)}>
            <Text style={{ color: Colors.color_white, paddingVertical: RFValue(8), paddingHorizontal: RFValue(10), marginVertical: RFValue(5), marginLeft: RFValue(8), backgroundColor: Colors.color_black, borderRadius: RFValue(8) }}>{Constants.create_page}</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  renderSuggestionList() {
    return this.state.queryResult.map((item, index) => {
      return (
        <TouchableOpacity onPress={() => this.selectTagName(item)} >
          <View style={styles.horizontalItemContainer}>
            {item.profileImage ? (
              <Image
                style={styles.profileImageStyle}
                source={{ uri: item.profileImage }}
              />
            ) : (
              <UserIcon height={RFValue(30)} width={RFValue(30)} />
            )}
            <Text style={styles.profileNameStyle}>{item.tagName}</Text>
          </View>
          <View
            style={{
              borderBottomColor: Colors.color_input_border,
              borderBottomWidth: 1,
            }}
          />
        </TouchableOpacity>
      );
    });
  }

  selectTagName(item) {

    let myProfileId = this.state.userData.defaultProfileId;

    if (item.tagName !== '') {
      if (item.profileId !== myProfileId) {
        this.setState({
          userName: item.tagName,
          tagProfileId: item.profileId,
          show: false,
          containerZIndex: 1
        });
      } else {
        this.setState({
          userName: '',
          show: false,
          isOwnProfileSelected: true,
          containerZIndex: 1
        });
      }
    }
  }
  changeReviewText(reviewText) {
    this.setState({
      reviewText: reviewText,
      value: reviewText
    });
  }

  render() {
    let profileImage = this.state.userData.defaultProfileImage
      ? this.state.userData.defaultProfileImage
      : '';
    let userName = this.state.userData.defaultProfileName
      ? this.state.userData.defaultProfileName : this.state.userData.firstName + ' ' + this.state.userData.lastName;

    let userHandle = this.state.userData.defaultProfileTagName
      ? this.state.userData.defaultProfileTagName : this.state.userData.userName;

    let verified = this.state.userData.verified
      ? this.state.userData.verified
      : false;
    return (
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.main}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.titleStyle}>{Constants.post_review}</Text>
              <Button
                style={styles.btnStyle}
                labelStyle={{
                  fontSize: RFValue(16),
                  fontFamily: Constants.font_regular,
                  fontWeight: 'bold',
                }}
                onPress={() => this.onPostReview()}
                uppercase={true}
                mode="contained">
                {Constants.post}
              </Button>
            </View>

            <View style={styles.profileDataContainer}>
              {profileImage ? (
                <Image source={{uri: profileImage}} style={styles.imgStyle} />
              ) : (
                <View style={styles.profileImg}>
                  <UserIcon height={RFValue(25)} width={RFValue(25)} />
                </View>
              )}
              <View style={{marginHorizontal: RFValue(16)}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={styles.txtStyle}>
                    {userName ? userName : 'Guest'}
                  </Text>
                  {verified && (
                    <GreenTick
                      width={RFValue(14)}
                      height={RFValue(14)}
                      style={{marginLeft: RFValue(8)}}
                    />
                  )}
                </View>

                <Text style={styles.textStyle}>
                  @{userHandle ? userHandle : 'guest'}
                </Text>
              </View>
            </View>

            {Platform.OS == 'ios' && (
              <View
                style={{
                  marginVertical: RFValue(16),
                  flexDirection: 'column',
                  zIndex: this.state.inputZindex,
                }}>
                <TextInput
                  style={styles.txtInputStyle}
                  onChangeText={username => {
                    this.onUserNameChange(username);
                    setTimeout(() => {
                      this.setState({inputZindex: 1});
                    }, 400);
                  }}
                  onBlur={() => {
                    this.setState({inputZindex: 0, queryResult: []});
                  }}
                  keyboardShouldPersistTaps={true}
                  value={this.state.userName}
                />
                <Text style={styles.iconStyle}>{Constants.at_the_rate}</Text>
                {(this.state.isUserNameRequireError ||
                  this.state.isOwnProfileSelected) && (
                  <Text style={[globalStyles.errorTextStyle, {marginLeft: 5}]}>
                    {this.state.isUserNameRequireError
                      ? 'This CitizeX username does not exists'
                      : this.state.isOwnProfileSelected
                      ? 'You can not post on your own profile'
                      : ''}
                  </Text>
                )}
                {this.state.show && (
                  <ScrollView
                    style={[
                      {
                        backgroundColor: Colors.color_white,
                        position: 'absolute',
                        zIndex: 1,
                        borderColor: Colors.color_black,
                        borderRadius: this.state.inputZindex == 1 ? 5 : 0,
                        borderWidth: this.state.inputZindex == 1 ? 1 : 0,
                        top: RFValue(45),
                        width: Dimensions.get('window').width - RFValue(25),
                        maxHeight: RFValue(200),
                      },
                    ]}>
                    {this.renderSuggestionList()}
                  </ScrollView>
                )}
              </View>
            )}

            {Platform.OS == 'android' && (
              <View
                style={{
                  marginVertical: RFValue(16),
                  flexDirection: 'column',
                }}>
                <TextInput
                  style={styles.txtInputStyle}
                  onChangeText={username => {
                    this.onUserNameChange(username);
                  }}
                  keyboardShouldPersistTaps={true}
                  value={this.state.userName}
                />
                <Text style={styles.iconStyle}>{Constants.at_the_rate}</Text>
                {(this.state.isUserNameRequireError ||
                  this.state.isOwnProfileSelected) && (
                  <Text style={[globalStyles.errorTextStyle, {marginLeft: 5}]}>
                    {this.state.isUserNameRequireError
                      ? 'This CitizeX username does not exists'
                      : this.state.isOwnProfileSelected
                      ? 'You can not post on your own profile'
                      : ''}
                  </Text>
                )}
                {this.state.show && (
                  <ScrollView
                    style={[
                      {
                        ...styles.listContainer,
                        top: RFValue(45),
                        width: Dimensions.get('window').width - RFValue(25),
                        maxHeight: RFValue(200),
                      },
                    ]}>
                    {this.renderSuggestionList()}
                  </ScrollView>
                )}
              </View>
            )}

            <View style={{flex: 1}}>
              <View style={styles.txtInputView}>
                <MentionInput
                  value={this.state.value}
                  onChange={text => this.changeReviewText(text)}
                  partTypes={[
                    {
                      trigger: '@',
                      renderSuggestions: this.getMentionData(
                        this.state.mentionData,
                      ),
                      textStyle: {fontWeight: 'bold', color: 'black'},
                    },
                  ]}
                  style={[styles.txtInputMulLine]}
                  placeholderTextColor={Colors.color_dark_grey}
                  placeholder={Constants.write_your_views_here}
                />
              </View>
              <View
                style={{
                  marginBottom: RFValue(10),
                  flexDirection: 'row',
                  zIndex: -1,
                }}>
                <TouchableOpacity onPress={() => this.showModal()}>
                  <ImageBackground
                    source={require('./../../../assets/images/Add_Image.png')}
                    style={styles.imageBgstyle}></ImageBackground>
                </TouchableOpacity>
                <ScrollView horizontal={true}>
                  {this.state.media.length > 0 &&
                    this.state.media.map((item, index) => {
                      if (item.duration !== undefined) {
                        return (
                          <View
                            key={index.toString()}
                            style={[
                              styles.centerContainer,
                              {marginRight: RFValue(10)},
                            ]}>
                            <ImageBackground
                              source={{
                                uri: item.thumbnail,
                              }}
                              style={styles.imageBgstyle}>
                              <View style={styles.centerContainer}>
                                <View style={styles.triangleStyle}>
                                  <Triangle
                                    height={RFValue(15)}
                                    width={RFValue(15)}
                                  />
                                </View>
                              </View>
                              <Touchable
                                onPress={() => this.removeItem(item)}
                                style={styles.crossIconStyle}>
                                <CrossIcon
                                  height={RFValue(15)}
                                  width={RFValue(15)}
                                />
                              </Touchable>
                            </ImageBackground>
                          </View>
                        );
                      } else {
                        return (
                          <View
                            key={index.toString()}
                            style={[
                              styles.centerContainer,
                              {marginRight: RFValue(10)},
                            ]}>
                            <ImageBackground
                              source={{
                                uri: item.uri,
                              }}
                              style={styles.imageBgstyle}>
                              <Touchable
                                onPress={() => this.removeItem(item)}
                                style={styles.crossIconStyle}>
                                <CrossIcon
                                  height={RFValue(15)}
                                  width={RFValue(15)}
                                />
                              </Touchable>
                            </ImageBackground>
                          </View>
                        );
                      }
                    })}
                </ScrollView>
              </View>
            </View>
            <View>
              {this.state.isReviewTextRequireError ? (
                <Text style={styles.errorText}>{Constants.blank_err}</Text>
              ) : null}

              {this.state.isMediaLengthError &&
              this.state.media.length === 7 ? (
                <Text style={styles.errorText}>{Constants.max_file_err}</Text>
              ) : null}

              {this.state.isSizeExceed ? (
                <Text style={styles.errorText}>{Constants.file_size_err}</Text>
              ) : null}
            </View>
          </View>
          {this.state.isLoaderVisible && <Loader />}
          <SelectionModal
            visible={this.state.isSelectionModalVisible}
            close={this.hideModal.bind(this)}
            openGallery={this.openGallery.bind(this)}
            openCamera={this.openCamera.bind(this)}
            title={Constants.select_media}
            recordVideo={true}
            imageCapture={Constants.capture_image}
          />
          <FriendlyReminder
            visible={this.state.isVisible}
            close={this.fndlyHideModal.bind(this)}
          />
          <PostReviewRestrictModal
            visible={this.state.isVisibleRestrict}
            createPageBtn={() => this.goToCreatePage()}
          />
        </View>
      </KeyboardAvoidingView>
    );
  }

  goToCreatePage() {
    this.setState({ isVisibleRestrict: false });

    this.props.navigation.navigate(Constants.tab_more, {
      screen: Constants.screen_basic_details,
      formDetailsScreen: Constants.screen_form_details_menu,
      tabComponent: Constants.tab_more,
      stackComponent: Constants.screen_menu_dashboard,
      callBack: () => { },
      userData: this.state.userData,
      setUserName: true
    });

  }

  showIndicator = () => {
    this.setState({
      isLoaderVisible: true,
    });
  };

  hideIndicator = () => {
    this.setState({
      isLoaderVisible: false,
    });
  };

  showAlert = (title, msg) => {
    Alert.alert(title, msg);
  }

  hideModal() {
    this.setState({ isSelectionModalVisible: false });
  }

  showModal() {
    this.setState({ isSelectionModalVisible: true });
  }
  fndlyHideModal() {
    this.setState({ isVisible: false });
  }
  fndlyShowModal() {
    this.setState({ isVisible: true });
  }

  restrictHideModal() {
    this.setState({ isVisibleRestrict: false });
  }
  restrictShowModal() {
    this.setState({ isVisibleRestrict: true });
  }
}

const styles = StyleSheet.create({
  main: {
    backgroundColor: Colors.color_white,
    flex: 1,
  },
  container: {
    marginHorizontal: RFValue(10),
    marginBottom: RFValue(70),
    marginTop: RFValue(10),
    flex: 1,
    backgroundColor: 'white'
  },
  header: {
    flexDirection: 'row',
    height: RFValue(36),
    alignItems: 'center'
  },
  profileDataContainer: {
    flexDirection: 'row',
    marginTop: RFValue(15),
    alignItems: 'center'
  },
  btnStyle: {
    position: 'absolute',
    right: RFValue(0),
    paddingHorizontal: RFValue(14),
    height: RFValue(36),
    justifyContent: 'center'
  },
  titleStyle: {
    color: Colors.color_dark_black,
    fontSize: RFValue(22),
    fontFamily: Constants.font_semibold
  },
  imgStyle: {
    height: RFValue(48),
    width: RFValue(48),
    borderRadius: RFValue(25),
  },
  txtStyle: {
    fontSize: RFValue(14),
    fontFamily: Constants.font_regular,
    color: Colors.color_black,
  },
  textStyle: {
    fontSize: RFValue(12),
    fontFamily: Constants.font_regular,
    color: Colors.color_gray
  },
  txtInputStyle: {
    backgroundColor: Colors.color_user_bg,
    height: RFValue(40),
    width: '100%',
    borderRadius: RFValue(7),
    paddingStart: RFValue(35),
    fontSize: RFValue(16),
    fontFamily: Constants.font_regular,
    color: Colors.color_black,

  },
  iconStyle: {
    position: 'absolute',
    justifyContent: 'center',
    left: RFValue(10),
    marginTop: RFValue(9),
    fontSize: RFValue(16),
    fontFamily: Constants.font_regular,
    color: Colors.color_grey_dark,

  },
  profileImg: {
    height: RFValue(48),
    width: RFValue(48),
    borderRadius: RFValue(46),
    backgroundColor: Colors.color_user_bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    backgroundColor: Colors.color_white,
    position: 'absolute',
    zIndex: 1,
    borderColor: Colors.color_black,
    borderRadius: 5,
    borderWidth: 1,
  },
  profileImageStyle: {
    width: RFValue(30),
    height: RFValue(30),
    borderRadius: RFValue(30),
  },
  horizontalItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: RFValue(10),

  },
  profileNameStyle: {
    fontFamily: Constants.font_regular,
    fontSize: RFValue(16),
    color: Colors.color_black,
    marginLeft: RFValue(15),
  },
  errorText: {
    marginLeft: 5,
    color: Colors.color_red_border,
    fontFamily: Constants.font_regular,
    fontSize: RFValue(14),
  },
  ///new
  txtInputView: {
    backgroundColor: Colors.color_user_bg,
    flex: 1,
    borderRadius: RFValue(7),
    marginLeft: RFValue(10),
    marginBottom: RFValue(10),
    padding: RFValue(5),

  },
  imageStyle: {
    width: RFValue(136),
    height: RFValue(124),
  },
  imageStyleTwo: {
    width: windowWidth / 6,
    height: undefined,
    aspectRatio: 1 / 1,
    marginRight: RFValue(3)
  },
  imageGalleryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: RFValue(8),
  },
  txtInputMulLine: {
    borderRadius: RFValue(7),
    backgroundColor: Colors.color_user_bg,
    width: '100%',
    paddingLeft: RFValue(10),
    fontSize: RFValue(16),
    marginBottom: 10,
    color: Colors.color_black,
  },
  txtStyle: {
    fontSize: RFValue(14),
    fontFamily: Constants.font_regular,
    color: Colors.color_black,
  },
  uploadMediaView: {
    // flexDirection: 'row',
    marginBottom: RFValue(15),
    position: 'absolute',
    bottom: 0,
  },
  txtInputView: {
    backgroundColor: Colors.color_user_bg,
    flex: 1,
    borderRadius: RFValue(7),
    // marginLeft: RFValue(10),
    marginBottom: RFValue(10),
    padding: RFValue(5),
  },
  verticalLineView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: RFValue(10),
  },
  verticalLine: {
    margin: 'auto',
    justifyContent: 'center',
    borderRightColor: Colors.color_light_grey,
    height: '100%',
    width: RFValue(0),
    alignItems: 'center',
    borderWidth: 1,
  },
  suggestionsModal: {
    backgroundColor: Colors.color_white,
    borderRadius: RFValue(5),
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: RFValue(5),
  },
  mainTextStyle: {
    fontSize: RFValue(12),
    fontFamily: Constants.font_regular,
    color: Colors.color_black,
  },
  subTextStyle: {
    fontSize: RFValue(11),
    fontFamily: Constants.font_regular,
    color: Colors.color_gray,
  },
  itemSeparatorStyle: {
    borderWidth: 0.5,
    borderColor: Colors.color_black,
    width: '100%',
    alignSelf: 'center',
    marginVertical: RFValue(5)
  },
  crossIconStyle: {
    position: 'absolute',
    alignSelf: 'flex-end',
    marginTop: RFValue(5),
    paddingRight: RFValue(5),
    zIndex: 1

  },
  imageBgstyle: {
    width: windowWidth / 6,
    aspectRatio: 1,
    backgroundColor: Colors.color_white
  },
  triangleStyle: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: '#13131399',
    padding: RFValue(12)
  },
  videoContainer: {
    flexGrow: 1,
    width: '100%',
    height: undefined,
    aspectRatio: 1 / 1
  },
  smallImageContainer: {
    height: RFValue(25),
    width: RFValue(25),
    borderRadius: RFValue(25) / 2,
    alignItems: 'center',
    justifyContent: 'center',

  },
});