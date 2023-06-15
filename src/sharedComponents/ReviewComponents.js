import React, {memo, useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {ActionSheet} from 'react-native-actionsheet-cstm';
import {RFValue} from 'react-native-responsive-fontsize';
import * as Colors from '../res/colors';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import * as Constants from '../res/strings';
import GreenTick from '../assets/images/icn_green_tick.svg';
import MenuIcon from '../assets/images/icn_menu.svg';
import UserIcon from '../assets/images/icn_user.svg';
import Responses from '../assets/images/icn_response.svg';
import AddResponses from '../assets/images/icn_add-reasponse.svg';
import ImageDisplayComponents from './ImageDisplayComponents';
import moment from 'moment';
import PostReviewRestrictModal from '../screens/MainScreens/screens/PostReviewRestrictModal';
import {useNavigation} from '@react-navigation/native';
import * as ApiManager from '../apiManager/ApiManager';
import HTMLView from 'react-native-htmlview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as UserData from '../localStorage/UserData';
import NetInfo from '@react-native-community/netinfo';
import Share from 'react-native-share';
import UserVerificationPopUP from './UserVerificationPopUP';

const ReviewComponents = memo(
  ({
    item,
    onClickResponse,
    reviewUsername,
    nestedReview,
    shareReviewHide,
    isLoggedIn,
  }) => {
    const [showActionSheet, setShowActionSheet] = useState(false);
    const [verificationModal, setVerificationModal] = useState(false);
    const [isVisibleRestrict, setVisibleRestrict] = useState(false);
    const navigation = useNavigation();
    const userName = reviewUsername ? reviewUsername : item?.onProfileTagName;
    let userData = '';

    function onShowActionSheet() {
      UserData.getUserData().then(data => {
        if (data.verified) {
          setShowActionSheet(true);
        } else {
          Alert.alert(
            'Alert',
            'You must have user verifications to be able to share review',
          );
          setShowActionSheet(false);
        }
      });
    }

    const sharePost = async id => {
      const url = await buildLink(id);
      const title = 'CitizeX';
      const message = 'check this Post';

      const options = Platform.select({
        ios: {
          activityItemSources: [
            {
              // For sharing url with custom title.
              placeholderItem: {type: 'url', content: url},
              item: {
                default: {type: 'url', content: url},
              },
              subject: {
                default: title,
              },
              linkMetadata: {originalUrl: url, url, title},
            },
            {
              // For sharing text.
              placeholderItem: {type: 'text', content: message},
              item: {
                default: {type: 'text', content: message},
                message: null, // Specify no text to share via Messages app.
              },
              linkMetadata: {
                // For showing app icon on share preview.
                title: message,
              },
            },
            {
              placeholderItem: {
                type: 'url',
                // content: icon,
              },
              item: {
                default: {
                  type: 'text',
                  content: `${message} ${url}`,
                },
              },
              linkMetadata: {
                title: message,
                // icon: icon,
              },
            },
          ],
        },
        default: {
          title,
          subject: title,
          message: `${message} ${url}`,
        },
      });
      Share.open(options);
    };

    const buildLink = async id => {
      const link = await dynamicLinks().buildShortLink(
        {
          link: `https://keeku.page.link/app?post_id=${id}`,
          // domainUriPrefix is created in your Firebase console
          domainUriPrefix: 'https://keeku.page.link',
          // optional setup which updates Firebase analytics campaign
          // "banner". This also needs setting up before hand
          analytics: {
            campaign: 'banner',
          },
          android: {
            packageName: 'com.keeku',
            minimumVersion: '18',
          },
          ios: {
            bundleId: 'com.ordex.keekudev',
            appStoreId: '123456789',
            minimumVersion: '18',
          },
        },
        dynamicLinks.ShortLinkType.UNGUESSABLE,
      );
      // const shareLink = new firebase.links.DynamicLink(
      //   `${"https://keeku.page.link/app/post"}=${id}`,
      //   "https://keeku.page.link",
      // ).android
      //   .setPackageName('com.keeku')
      //   .ios.setBundleId('com.ordex.keekudev');

      // const link = await firebase
      //   .links()
      //   .createShortDynamicLink(shareLink, 'UNGUESSABLE')
      //   .then((url) => {
      //     return url;
      //   })
      //   .catch((e) => {
      //     console.log('error', e);
      //   });
      return link;
    };

    function onCloseActionSheet() {
      setShowActionSheet(false);
    }

    const userGetData = (item, userName) => {
      AsyncStorage.getItem(Constants.token).then(token => {
        if (token) {
          if (token === Constants.guestToken) {
            showAddRepsonse(item, userName, false);
          } else {
            UserData.getUserData().then(data => {
              showAddRepsonse(item, userName, data.verified);
            });
          }
        } else {
          showAddRepsonse(item, userName, false);
        }
      });
    };

    function restrictHideModal() {
      setVisibleRestrict(false);
    }

    function restrictShowModal() {
      setVisibleRestrict(true);
    }

    function createPageModalShow() {
      UserData.getUserData().then(data => {
        userData = data;

        if (data.verified) {
          if (data.defaultProfileId != null) {
            userGetData(item, userName);
          } else {
            restrictShowModal();
          }
        } else {
          showAddRepsonse(item, userName, data.verified);
        }
      });
    }

    const showAddRepsonse = (data, userName, status) => {
      if (status == false) {
        setVerificationModal(true);
      } else {
        navigation.navigate(Constants.screen_addRes, {
          item: data,
          shareReview: userName,
        });
      }
    };

    const checkoutProfile = name => {
      let params = {
        name: name,
      };
      var myHeaders = new Headers();
      myHeaders.append('Content-type', 'application/json');
      NetInfo.fetch().then(state => {
        if (state.isConnected) {
          ApiManager.getUserProfile(params, myHeaders)
            .then(success => {
              let data = success.data;
              navigation.push(Constants.screen_profile, {id: data.profileId});
            })
            .catch(error => {
              alert('Profile not Found');
              console.log(error);
            });
        } else {
          Alert.alert(Constants.network, Constants.please_check_internet);
        }
      });
    };

    const onPressNavigation = () => {
      console.log('_____review______');
      navigation.navigate(Constants.screen_review_detail, {item: item});
    };

    const renderNode = node => {
      if (node.type == 'text') {
        return node.data
          .split('/((?:^|s)(?:@[a-zd-]+))/gi')
          .filter(Boolean)
          .map((txt, index) => {
            let val = txt.replace('&nbsp;', ' ');
            if (val.includes('@')) {
              return (
                <Text
                  style={[
                    styles.reviewMessage,
                    {color: Colors.color_light_blue},
                  ]}
                  key={index}
                  onPress={() => checkoutProfile(txt.slice(1))}>
                  {val}
                </Text>
              );
            } else {
              return (
                <Text
                  style={styles.reviewMessage}
                  key={index}
                  onPress={
                    onClickResponse ? onClickResponse : onPressNavigation
                  }>
                  {val}
                </Text>
              );
            }
          });
      }
    };

    return (
      <View
        style={
          !nestedReview && {
            borderBottomWidth: 1,
            borderBottomColor: Colors.color_light_grey,
          }
        }>
        <View
          style={{
            paddingVertical: RFValue(12),
            marginHorizontal: RFValue(10),
          }}>
          <View
            style={{
              flexDirection: 'row',
            }}>
            <View>
              <TouchableOpacity
                style={styles.imageContainer}
                onPress={() =>
                  navigation.push(Constants.screen_profile, {
                    id: item.byProfileId,
                  })
                }>
                {item?.byProfileImage ? (
                  <Image
                    style={{
                      height: RFValue(34),
                      width: RFValue(34),
                      borderRadius: RFValue(34) / 2,
                    }}
                    source={{uri: item?.byProfileImage}}
                  />
                ) : (
                  <UserIcon height={RFValue(24)} width={RFValue(24)} />
                )}
              </TouchableOpacity>
              {nestedReview && (
                <View style={styles.verticalLineView}>
                  <View style={styles.verticalLine}></View>
                </View>
              )}
            </View>
            <View style={{flexDirection: 'row', flex: 1}}>
              <View style={{flex: 1, alignSelf: 'center'}}>
                <View style={styles.perentViewStyle}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.push(Constants.screen_profile, {
                        id: item.byProfileId,
                      })
                    }
                    style={styles.perentViewStyle}>
                    <Text style={styles.reviewUserName}>
                      {item?.byProfileName}
                    </Text>
                    <GreenTick
                      width={RFValue(13)}
                      height={RFValue(13)}
                      style={{marginLeft: RFValue(8)}}
                    />
                  </TouchableOpacity>
                  <Text style={styles.centerDot}>{'•'}</Text>
                  <Text style={styles.reviewDate}>
                    {moment(item?.createdDate).format('ll')}
                  </Text>
                  {!nestedReview && (
                    <TouchableOpacity
                      style={{
                        position: 'absolute',
                        right: RFValue(0),
                      }}
                      onPress={onShowActionSheet}>
                      <MenuIcon
                        width={RFValue(6)}
                        height={RFValue(14)}></MenuIcon>
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.perentViewStyle}
                  onPress={() =>
                    navigation.push(Constants.screen_profile, {
                      id: item.byProfileId,
                    })
                  }>
                  <Text style={styles.reviewTagname}>
                    @{item?.byProfileTagName}
                  </Text>
                </TouchableOpacity>
                {!shareReviewHide && (
                  <View style={styles.perentViewStyle}>
                    <Text style={styles.reviewShared}>
                      {Constants.share_review_for}
                      <Text
                        style={{color: Colors.color_light_blue}}
                        onPress={() => checkoutProfile(item?.onProfileTagName)}>
                        {' '}
                        @{userName}
                      </Text>
                    </Text>
                  </View>
                )}
                <View style={shareReviewHide && {marginTop: RFValue(5)}}>
                  <HTMLView value={item.content} renderNode={renderNode} />
                </View>
                {item?.media && (
                  <View style={styles.imageGalleryContainer}>
                    <ImageDisplayComponents
                      media={item?.media}
                      navigation={navigation}
                    />
                  </View>
                )}
                <View style={styles.addResponseIcnContainer}>
                  {item?.responseCount ? (
                    <TouchableOpacity
                      style={styles.resAndAddResponseIcon}
                      onPress={
                        onClickResponse ? onClickResponse : onPressNavigation
                      }>
                      <Responses width={RFValue(21)} height={RFValue(17)} />
                      <Text
                        style={{
                          marginLeft: RFValue(8),
                          color: Colors.color_gray,
                        }}>
                        {item?.responseCount}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                  {isLoggedIn && (
                    <TouchableOpacity
                      style={{flex: 1}}
                      onPress={createPageModalShow}>
                      <AddResponses width={RFValue(21)} height={RFValue(17)} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>
          <ActionSheet
            visible={showActionSheet}
            onClose={onCloseActionSheet}
            cancelTextStyle={styles.cancelTextStyle}
            cancelButtonStyle={styles.cancelButtonStyle}
            containerStyle={styles.containerStyleModal}
            cancelText="Cancel"
            actionItems={[
              {
                text: 'Report',
                textStyle: [styles.txtStyle],
                onPress: () => {
                  console.log('Report');
                },
              },
              {
                text: 'Share',
                textStyle: [styles.txtStyle],
                onPress: async () => {
                  const link = await sharePost(item?.id);
                  console.log('LINK', link);
                },
              },
            ]}
          />
        </View>
        {verificationModal && (
          <UserVerificationPopUP
            verifyBtn={() => {
              navigation.navigate(Constants.screen_verify_identity),
                setVerificationModal(false);
            }}
          />
        )}
        <PostReviewRestrictModal
          visible={isVisibleRestrict}
          close={restrictHideModal}
          createPageBtn={() =>
            navigation.navigate(Constants.tab_more, {
              screen: Constants.screen_basic_details,
              formDetailsScreen: Constants.screen_form_details_menu,
              tabComponent: Constants.tab_more,
              stackComponent: Constants.screen_menu_dashboard,
              callBack: () => {},
              userData: userData,
              setUserName: true,
            })
          }
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  perentViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewUserName: {
    fontSize: RFValue(14),
    fontFamily: Constants.font_regular,
    color: Colors.color_black,
  },
  imageContainer: {
    marginRight: RFValue(15),
    height: RFValue(34),
    width: RFValue(34),
    borderRadius: RFValue(34) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.color_user_bg,
  },
  centerDot: {
    fontSize: RFValue(14),
    fontFamily: Constants.font_bold,
    color: Colors.color_gray,
    marginHorizontal: RFValue(8),
  },
  reviewDate: {
    fontSize: RFValue(14),
    fontFamily: Constants.font_regular,
    color: Colors.color_gray,
  },
  reviewTagname: {
    fontSize: RFValue(14),
    fontFamily: Constants.font_regular,
    color: Colors.color_gray,
  },
  reviewShared: {
    fontSize: RFValue(14),
    fontFamily: Constants.font_regular,
    color: Colors.color_gray,
    marginTop: RFValue(8),
    marginBottom: RFValue(2),
    textAlign: 'justify',
  },
  reviewMessage: {
    fontSize: RFValue(14),
    fontFamily: Constants.font_regular,
    color: Colors.color_black,
    textAlign: 'justify',
  },
  resAndAddResponseIcon: {
    flexDirection: 'row',
    flex: 1,
  },
  addResponseIcnContainer: {
    flexDirection: 'row',
    marginTop: RFValue(12),
  },
  imageGalleryContainer: {
    flexDirection: 'row',
    marginTop: RFValue(8),
  },
  cancelTextStyle: {
    color: Colors.color_red_border,
    fontSize: RFValue(20),
    fontFamily: Constants.font_regular,
  },
  cancelButtonStyle: {
    borderRadius: RFValue(4),
    backgroundColor: Colors.color_white,
    height: RFValue(50),
    marginBottom: RFValue(25),
  },
  containerStyleModal: {
    marginBottom: RFValue(15),
    borderRadius: RFValue(4),
    backgroundColor: Colors.color_white,
  },
  txtStyle: {
    marginVertical: RFValue(10),
    color: Colors.color_black,
    fontSize: RFValue(20),
    fontFamily: Constants.font_regular,
  },
  verticalLineView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: RFValue(10),
    marginRight: RFValue(15),
  },
  verticalLine: {
    margin: 'auto',
    justifyContent: 'center',
    borderColor: Colors.color_light_grey,
    height: '100%',
    width: RFValue(0),
    alignItems: 'center',
    borderWidth: 1,
  },
});

export default ReviewComponents;
