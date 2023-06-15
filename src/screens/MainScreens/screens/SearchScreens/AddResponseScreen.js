import React, { useEffect, useState } from 'react';
import { Text, View, SafeAreaView, StyleSheet, ImageBackground, ScrollView, Alert, Dimensions, Pressable, FlatList, Image, StatusBar, KeyboardAvoidingView, Platform, TouchableOpacity as Touchable, BackHandler } from 'react-native';
import * as Constants from '../../../../res/strings';
import { RFValue } from 'react-native-responsive-fontsize';
import { Button } from 'react-native-paper';
import * as Colors from '../../../../res/colors';
import CloseIcon from './../../../../assets/images/icn_cross_sign.svg';
import GreenTick from './../../../../assets/images/icn_green_tick.svg';
import { MentionInput, replaceMentionValues } from 'react-native-controlled-mentions';
import * as ApiManager from '../../../../apiManager/ApiManager';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ProfilephotoModel from '../MenuScreens/ProfilephotoModel';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import CrossIcon from './../../../../assets/images/Cross.svg';
import Triangle from './../../../../assets/images/Triangle.svg';
import NetInfo from '@react-native-community/netinfo';
import * as LocalStorageUserData from '../../../../localStorage/UserData';
import UserIcon from './../../../../assets/images/icn_user.svg';
import Loader from '../../../../sharedComponents/Loader';
import HTMLView from 'react-native-htmlview';
import axios from 'axios';
import { TouchableOpacity } from 'react-native-gesture-handler';

const windowWidth = Dimensions.get('window').width;

export default function AddResponse(props) {
  const [inputValue, setInputValue] = useState('')
  const [mentionData, setMentionData] = useState([])
  const [isSizeExceed, setIsSizeExceed] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isLoaderVisible, setIsLoaderVisible] = useState(false)
  const [isMediaLengthError, setIsMediaLengthError] = useState(false)
  const [media, setMedia] = useState([])
  const [userData, setUserData] = useState('')
  const [selectedMentionedUsers, setSelectedMentionedUsers] = useState([])
  const [textInputErr, setTextInputErr] = useState(false)
  const item = props.route.params.item

  useEffect(() => {
    fetchUserData()
  }, [])

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => props.navigation.goBack()
    );
    return () => backHandler.remove();
  }, []);

  const fetchUserData = () => {
    LocalStorageUserData.getUserData()
      .then(data => {
        if (data !== null) {
          setUserData(data)
        }
      })
      .catch(error => {
        console.log('error while getting data from local storage', error);
      });
  }

  const ImageGallery = (itm) => {
    let media = itm
    const playBtn = require('./../../../../assets/images/playbtn.png')

    if (media?.length > 0) {
      return (
        <View style={{ flex: 1 }}>
          <ScrollView horizontal={true}>
            {media.map((item, index) => {
              const tmpArr = item.split('.')
              return (
                <TouchableOpacity
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    props.navigation.navigate(Constants.screen_view_media, { media: media, index: index })
                  }}
                  key={index.toString()}
                >
                  <ImageBackground
                    source={
                      tmpArr[tmpArr.length - 1] == "ism/manifest" ? playBtn : { uri: item }
                    }
                    resizeMode={'contain'}
                    imageStyle={{
                      borderRadius: RFValue(6),
                      aspectRatio: 1 / 1,
                      height: undefined,
                      backgroundColor: Colors.color_black
                    }}
                    style={
                      styles.imageStyleTwo
                    }></ImageBackground>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      );
    }
  }

  const getMentionData = (suggestions) => ({ keyword, onSuggestionPress }) => {

    useEffect(() => {
      if (keyword !== undefined && !keyword.includes(' ')) {
        apiCall()
      }
    }, [keyword])

    const apiCall = () => {
      NetInfo.fetch().then(state => {
        let params = {
          tagname: keyword,
          limit: 5
        }
        var myHeaders = new Headers();
        myHeaders.append("Content-type", "application/json");
        if (state.isConnected) {
          ApiManager.getMentionUser(params, myHeaders)
            .then((response) => {
              const data = response.data
              setMentionData(data)
            })
        } else {
          Alert.alert(Constants.network, Constants.please_check_internet);
        }
      });
    }

    const RenderFunction = (one, index) => {
      if (index < 4) {
        return (
          <TouchableOpacity
            onPress={() => {
              onSuggestionPress({ id: one.id, name: one.tagName })
              setSelectedMentionedUsers([...selectedMentionedUsers, { id: one.id, name: one.tagName }])
              setMentionData([])
            }}
            style={styles.itemContainer}
          >
            <View style={styles.smallImageContainer}>
              {item.profileImage ?
                <Image style={{ height: RFValue(25), width: RFValue(25), borderRadius: RFValue(25) / 2 }} source={{ uri: item.profileImage }} />
                :
                <UserIcon height={RFValue(15)} width={RFValue(15)} />
              }
            </View>
            <View style={{ marginLeft: RFValue(10) }}>
              <Text numberOfLines={1} style={styles.mainTextStyle}>{one.profileName}</Text>
              <Text numberOfLines={1} style={styles.subTextStyle}>{one.tagName}</Text>
            </View>
          </TouchableOpacity>
        )
      }
    }
    const goToCreatePage = (keyword) => {
      props.navigation.navigate(Constants.tab_more, {
        screen: Constants.screen_basic_details,
        formDetailsScreen: Constants.screen_form_details_menu,
        tabComponent: Constants.tab_more,
        stackComponent: Constants.screen_menu_dashboard,
        callBack: () => {},
        userData: { ...userData, userName: keyword },
        setUserName: true
      });
    }
    if (mentionData.length > 0) {
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
            data={keyword !== undefined && !keyword.includes(' ') && mentionData}
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

  const hideModal = () => {
    setIsModalVisible(false)
  }

  const showModal = () => {
    setIsModalVisible(true)
  }

  const openGallery = () => {
    hideModal();
    setTimeout(() => {
      launchImageLibrary(
        {
          selectionLimit: 0,
          includeBase64: true,
          mediaType: 'mixed',
        },
        response => {
          onResult(response);
        },
      );
    }, 100);
  };

  const openCamera = (type) => {
    hideModal();
    if (Platform.OS === 'ios') {
      launchCameraFunction(type);
    } else {
      checkCameraPermission(type);
    }
  };

  const launchCameraFunction = type => {
    setTimeout(() => {
      launchCamera(
        {
          mediaType: type,
          saveToPhotos: false,
          selectionLimit: 0,
        },
        response => {
          onResult(response);
        },
      );
    }, 100);
  };

  const checkCameraPermission = async (type) => {
    let permission_request = PERMISSIONS.ANDROID.CAMERA;
    return check(permission_request)
      .then(result => {
        if (result === RESULTS.DENIED) {
          requestCameraPermission(permission_request, type);
        } else if (result === RESULTS.GRANTED) {
          launchCameraFunction(type);
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

  const requestCameraPermission = (permission_request, type) => {
    request(permission_request).then(result => {
      if (result === RESULTS.GRANTED) {
        launchCameraFunction(type);
      } else {
        Alert.alert(Constants.camera_permission, Constants.camera_instruction);
      }
    });
  };

  const onResult = async (response) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.errorCode) {
      console.log('ImagePicker Error: ', response.errorMessage);
    } else {
      setIsLoaderVisible(true)
      setIsSizeExceed(false)
      var count = 7;
      let flag = false;
      if (media.length + response.assets.length > 7) {
        flag = true;
        count = 7 - media.length;
      }
      let _media = response.assets.slice(0, count);
      let tmpImageVar = [...media]
      for (let i = 0; i < _media.length; i++) {
        if (_media[i].fileSize > 26214400) {
          setIsSizeExceed(true)
          return;
        }
        let mediaTmp = _media[i];
        var fileJson = {};
        if (mediaTmp?.duration) {
          fileJson.type = 'video/mkv';
          fileJson.uri = mediaTmp.uri;
          fileJson.name = `${mediaTmp.fileName}.mkv`;
        } else {
          fileJson.type = mediaTmp.type;
          fileJson.uri = mediaTmp.uri;
          fileJson.name = mediaTmp.fileName;
        }

        if (fileJson.type != 'video/mkv') {

          const imageData = new FormData();
          imageData.append('mediaFile', fileJson)

          NetInfo.fetch().then(state => {
            if (state.isConnected) {
              ApiManager.imageContent(imageData, true)
                .then((res) => {
                  let parsedData = JSON.parse(res.data)
                  if (parsedData.Result == false) {
                    tmpImageVar = [...tmpImageVar, _media[i]]
                    setMedia(tmpImageVar)
                  } else {
                    console.log('Not valid')
                  }
                  i == _media.length - 1 && setIsLoaderVisible(false)
                })
                .catch((e) => {
                  i == _media.length - 1 && setIsLoaderVisible(false)
                  console.log('onFailure', e)
                });
            } else {
              Alert.alert(Constants.network, Constants.please_check_internet);
            }
          });
        }
      }
      setTimeout(() => {
        // let tmpVar = media.concat(_media[i])
        //  setMedia(tmpVar)
        setIsMediaLengthError(flag)
      }, 100);
    }
  };

  const removeItem = (item) => {
    let mediaArray = [...media];
    let index = mediaArray.indexOf(item);
    if (index !== -1) {
      mediaArray.splice(index, 1)
      setMedia(mediaArray)
    }
  }

  const onPostReview = (item) => {
    const onSuccess = response => {
      if (response.success === 0) {
        setIsLoaderVisible(false)
        Alert.alert("Success", "Review posted successfully!!", [{
          text: "OK",
          onPress: () => { props.navigation.goBack() }
        }]);
      }
    };

    const onFailure = error => {
      setIsLoaderVisible(false)
      Alert.alert("Failure", "There is something wrong to post review!!");
    };

    if (inputValue == '') {
      setTextInputErr(true)
    } else {
      setIsLoaderVisible(true)
      let contentMentionList = [];
      let mentionIds = [];
      let content = `<p>${replaceMentionValues(inputValue, ({ name }) => `<span data-mention="@${name}">@${name}</span>`)}</p>`
      let contentString = replaceMentionValues(inputValue, ({ name }) => `@${name}`)
      let array = contentString.split(" ");
      array.forEach((element) => {
        if (element.includes("@")) {
          contentMentionList.push(element.split("@")[1]);
        }
      });
      contentMentionList.forEach((mentionTag) => {
        selectedMentionedUsers.some(function (el) {
          if (el.name === mentionTag) {
            mentionIds.push(el.id);
          };
        });
      });
      let mentionProfileIdsData = null
      if (mentionIds.length > 0) {
        mentionProfileIdsData = mentionIds.join(",");
      }
      const formData = new FormData();
      formData.append('reviewDTO',
        JSON.stringify(
          {
            "id": null,
            "content": content,
            "media": null,
            "profileId": item.profileId,
            "byUserId": userData.userId,
            "byProfileId": userData.defaultProfileId,
            "isReview": false,
            "reviewId": item.reviewId == null ? item.id : item.reviewId,
            "byProfileName": "",
            "byProfileImage": "",
            "onProfileTagName": "",
            "daysAgo": "",
            "responseCount": null,
            "createdBy": null,
            "byProfileTagName": null,
            "level": null,
            "createdDate": "",
            "responseId": item.reviewId !== null ? item.id : null,
            "priority": null,
            "mentionProfileIds": `${mentionProfileIdsData}`,
            "finalPriority": null,
            "responseLevel": item.responseLevel == null ? 1 : item.responseLevel + 1,
          }
        )
      );
      var i;
      if (media.length > 0) {
        for (i = 0; i < media.length; i++) {
          let mediaTmp = media[i];
          var fileJson = {};
          if (mediaTmp.duration) {
            fileJson.type = 'video/mkv';
            fileJson.uri = mediaTmp.uri;
            fileJson.name = `${mediaTmp.fileName}.mkv`;
          } else {
            fileJson.type = mediaTmp.type;
            fileJson.uri = mediaTmp.uri;
            fileJson.name = mediaTmp.fileName;
          }
          formData.append('mediaFile', fileJson);
        }
      }

      NetInfo.fetch().then(state => {
        if (state.isConnected) {
          ApiManager.postReview(formData, true).then(onSuccess).catch(onFailure);
        } else {
          Alert.alert(Constants.network, Constants.please_check_internet);
        }
      });
    }
  }

  const checkoutProfile = (name) => {
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
            navigation.navigate(Constants.screen_profile, { id: data.profileId })
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

  const renderNode = (node) => {
    if (node.type == 'text') {
      return (
        node.data.split('/((?:^|\s)(?:@[a-z\d-]+))/gi').filter(Boolean).map((txt, index) => {
          let val = txt.replace('&nbsp;', ' ')
          if (val.includes('@')) {
            return (
              <Text
                style={[styles.reviewMessage, { color: Colors.color_light_blue }]}
                key={index}
                onPress={() => checkoutProfile(val.slice(1))}
              >
                {val}
              </Text>
            )
          } else {
            return (
              <Text
                style={styles.reviewMessage}
                key={index}
              >
                {val}
              </Text>
            )
          }
        })
      )
    }
  }

  return (
    <SafeAreaView style={styles.modelStyle}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <StatusBar backgroundColor="white" barStyle="dark-content" />
        <View style={{ flex: 1, marginHorizontal: RFValue(15) }}>
          {isLoaderVisible && <Loader />}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => props.navigation.goBack()}>
              <CloseIcon width={RFValue(20)} height={RFValue(20)} />
            </TouchableOpacity>
            <Button
              style={styles.btnStyle}
              labelStyle={{
                fontSize: RFValue(16),
                fontFamily: Constants.font_semibold,
              }}
              uppercase={true}
              mode="contained"
              onPress={() => onPostReview(item)}
            >
              {Constants.post}
            </Button>
          </View>
          <View>
            <View
              style={{
                flexDirection: 'row',
              }}>
              <View style={{ flexDirection: 'column' }}>
                <View style={styles.ImageContainer}>
                  {item?.byProfileImage ?
                    <Image style={{ height: RFValue(37), width: RFValue(37), borderRadius: RFValue(37) / 2 }} source={{ uri: item?.byProfileImage }} />
                    :
                    <UserIcon height={RFValue(25)} width={RFValue(25)} />
                  }
                </View>
                <View style={styles.verticalLineView}>
                  <View style={styles.verticalLine}></View>
                </View>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  flex: 1,
                  marginLeft: RFValue(12),
                  marginBottom: RFValue(27),
                }}>
                <View style={{ flex: 1, alignSelf: 'center' }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginRight: RFValue(12),
                    }}>
                    <Text style={styles.reviewUserName}>{item.byProfileName}</Text>
                    <GreenTick
                      width={RFValue(13)}
                      height={RFValue(13)}
                      style={{ marginLeft: RFValue(4) }}
                    />
                    <Text style={styles.reviewUser}>@{item.byProfileTagName}</Text>
                    <Text style={styles.centerDot}>{'•'}</Text>
                    <Text style={styles.reviewUser}>{item.daysAgo}</Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.reviewShared}>
                      {Constants.share_review_for}
                      <Text style={{ color: Colors.color_light_blue }}
                        onPress={() => { checkoutProfile(props.route.params.shareReview) }}
                      >
                        {' '}@{props.route.params.shareReview}
                      </Text>
                    </Text>
                  </View>
                  <ScrollView style={{ maxHeight: RFValue(60) }}>
                    <HTMLView
                      value={item.content}
                      renderNode={renderNode}
                    />
                  </ScrollView>
                  <View style={styles.imageGalleryContainer}>
                    {ImageGallery(item.media)}
                  </View>
                </View>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <View style={{ flexDirection: 'column' }}>
              <View style={styles.ImageContainer}>
                {userData?.defaultProfileImage ?
                  <Image style={{ height: RFValue(37), width: RFValue(37), borderRadius: RFValue(37) / 2 }} source={{ uri: userData.defaultProfileImage }} />
                  :
                  <UserIcon height={RFValue(25)} width={RFValue(25)} />
                }
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.txtInputView}>
                <MentionInput
                  autoFocus
                  multiline
                  value={inputValue}
                  onChange={(text) => {
                    text !== '' && setTextInputErr(false),
                      !text && setMentionData([]),
                      setInputValue(text)
                  }}
                  partTypes={[
                    {
                      trigger: '@',
                      renderSuggestions: getMentionData(),
                      textStyle: { fontWeight: 'bold', color: 'black' },
                    }
                  ]}
                  style={[
                    styles.txtInputMulLine,
                    Platform.OS === 'ios' && { height: '100%' }
                  ]}
                  placeholderTextColor={Colors.color_dark_grey}
                  placeholder={Constants.write_your_views_here}
                />
              </View>
              <View style={{ marginLeft: RFValue(10), marginBottom: RFValue(10), flexDirection: 'row', zIndex: -1 }}>
                <TouchableOpacity onPress={() => showModal()}>
                  <ImageBackground
                    source={require('../../../../assets/images/Add_Image.png')}
                    style={styles.imageBgstyle}>
                  </ImageBackground>
                </TouchableOpacity>
                <ScrollView horizontal={true}>
                  {media.length > 0 && media.map((item, index) => {
                    if (item.duration !== undefined) {
                      return (
                        <View key={index.toString()} style={[styles.centerContainer, { marginRight: RFValue(10) }]}>
                          <ImageBackground
                            source={{
                              uri: item.thumbnail
                            }}
                            style={styles.imageBgstyle}>
                            <View
                              style={styles.centerContainer}>
                              <View style={styles.triangleStyle}>
                                <Triangle height={RFValue(15)} width={RFValue(15)} />
                              </View>
                            </View>
                            <Touchable
                              onPress={() => removeItem(item)}
                              style={styles.crossIconStyle}>
                              <CrossIcon height={RFValue(15)} width={RFValue(15)} />
                            </Touchable>
                          </ImageBackground>
                        </View>
                      );
                    } else {
                      return (
                        <View key={index.toString()} style={[styles.centerContainer, { marginRight: RFValue(10) }]}>
                          <ImageBackground
                            source={{
                              uri: item.uri,
                            }}
                            style={styles.imageBgstyle}>
                            <Touchable
                              onPress={() => removeItem(item)}
                              style={styles.crossIconStyle}>
                              <CrossIcon height={RFValue(15)} width={RFValue(15)} />
                            </Touchable>
                          </ImageBackground>
                        </View>
                      );
                    }
                  })}
                </ScrollView>
              </View>
            </View>
          </View>

          {textInputErr &&
            <Text
              style={styles.errText}>
              {Constants.blank_err}
            </Text>
          }

          {
            (isMediaLengthError && media.length === 7) ?
              <Text
                style={styles.errText}>
                {Constants.max_file_err}
              </Text>
              : null
          }

          {isSizeExceed &&
            <Text
              style={styles.errText}>
              {Constants.file_size_err}
            </Text>
          }

          {isModalVisible && <ProfilephotoModel
            visible={isModalVisible}
            close={hideModal}
            openGallery={openGallery}
            openCamera={openCamera}
            title={Constants.select_media}
            recordVideo={true}
            imageCapture={Constants.capture_image}
          />}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modelStyle: {
    flex: 1,
    backgroundColor: Colors.color_white,
  },
  smallImageContainer: {
    height: RFValue(25),
    width: RFValue(25),
    borderRadius: RFValue(25) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.color_user_bg
  },
  ImageContainer: {
    height: RFValue(37),
    width: RFValue(37),
    borderRadius: RFValue(37) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.color_user_bg
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginVertical: RFValue(22),
    justifyContent: 'center',
  },
  btnStyle: {
    fontSize: RFValue(12),
    fontFamily: Constants.font_regular,
    position: 'absolute',
    right: RFValue(0),
    paddingHorizontal: RFValue(20),
  },
  reviewUserName: {
    fontSize: RFValue(14),
    fontFamily: Constants.font_regular,
    color: Colors.color_black,
  },
  centerDot: {
    fontSize: RFValue(14),
    fontFamily: Constants.font_bold,
    color: Colors.color_gray,
    marginLeft: RFValue(8),
  },
  reviewUser: {
    fontSize: RFValue(12),
    fontFamily: Constants.font_regular,
    color: Colors.color_gray,
    marginLeft: RFValue(9),
  },
  reviewTagname: {
    fontSize: RFValue(14),
    fontFamily: Constants.font_regular,
    color: Colors.color_gray,
  },
  reviewShared: {
    fontSize: RFValue(12),
    fontFamily: Constants.font_regular,
    color: Colors.color_gray,
    marginTop: RFValue(8),
    marginBottom: RFValue(2),
    paddingRight: RFValue(15),
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
    width: '100%',
    paddingLeft: RFValue(10),
    fontSize: RFValue(16),
    color: Colors.color_black,
    // height: '100%',
  },
  txtStyle: {
    fontSize: RFValue(14),
    fontFamily: Constants.font_regular,
    color: Colors.color_black,
  },
  uploadMediaView: {
    marginBottom: RFValue(15),
    position: 'absolute',
    bottom: 0,
  },
  txtInputView: {
    backgroundColor: Colors.color_user_bg,
    flex: 1,
    borderRadius: RFValue(7),
    marginLeft: RFValue(10),
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
    marginVertical: RFValue(4)
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
    marginTop: RFValue(3),
    paddingRight: RFValue(3)
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
  reviewMessage: {
    fontSize: RFValue(14),
    fontFamily: Constants.font_regular,
    color: Colors.color_black,
    textAlign: 'justify'
  },
  errText: {
    textAlign: 'center',
    color: Colors.color_red_border,
    fontFamily: Constants.font_regular,
    fontSize: RFValue(14),
  }
});