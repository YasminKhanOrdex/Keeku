import React, {memo, useCallback, useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Image,
  BackHandler,
  StatusBar,
  Platform,
} from 'react-native';
import Header from '../../../../sharedComponents/Header';
import * as Constants from '../../../../res/strings';
import * as Colors from '../../../../res/colors';
import {RFValue} from 'react-native-responsive-fontsize';
import GreenTick from './../../../../assets/images/icn_green_tick.svg';
import Responses from './../../../../assets/images/icn_response.svg';
import AddResponses from './../../../../assets/images/icn_add-reasponse.svg';
import ImageDisplayComponents from '../../../../sharedComponents/ImageDisplayComponents';
import moment from 'moment';
import * as ApiManager from '../../../../apiManager/ApiManager';
import NetInfo from '@react-native-community/netinfo';
import Loader from '../../../../sharedComponents/Loader';
import UserIcon from './../../../../assets/images/icn_user.svg';
import HTMLView from 'react-native-htmlview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as UserData from '../../../../localStorage/UserData';
import UserVerificationPopUP from '../../../../sharedComponents/UserVerificationPopUP';
import {useFocusEffect} from '@react-navigation/native';
import {ActionSheet} from 'react-native-actionsheet-cstm';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import Share from 'react-native-share';
import PostReviewRestrictModal from '../../screens/PostReviewRestrictModal';
export default function ReviewDetailScreen({navigation, route}) {
  const [item, setItem] = useState([]);
  const [responseData, setResponseData] = useState([]);
  const [counter, setCounter] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [verificationModal, setVerificationModal] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [subResLoader, setSubResLoader] = useState(true);
  const [isVisibleRestrict, setVisibleRestrict] = useState(false);
  let userData = '';
  useFocusEffect(
    useCallback(() => {
      if (route.params.item.id) {
        getReviewData();
        getResponseData();
      }
      return () => true;
    }, []),
  );

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () =>
      navigation.goBack(),
    );
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (route.params.item.id) {
      getReviewData();
      getResponseData();
    }
  }, [route.params.item.id]);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = () => {
    AsyncStorage.getItem(Constants.token).then(token => {
      if (token) {
        if (token !== Constants.guestToken) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      }
    });
  };

  const getReviewData = () => {
    let paramsReview = {
      reviewId: route.params.item.id,
    };
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        var myHeaders = new Headers();
        myHeaders.append('Content-type', 'application/json');
        ApiManager.getReviewDetails(paramsReview, myHeaders)
          .then(success => {
            let data = success.data;
            setItem(data);
          })
          .catch(error => {
            console.log(error);
          });
      } else {
        Alert.alert(Constants.network, Constants.please_check_internet);
      }
    });
  };

  const getResponseData = () => {
    let paramsResponce = {
      reviewId: route.params.item.id,
      start: counter,
      limit: 10,
    };
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        var myHeaders = new Headers();
        myHeaders.append('Content-type', 'application/json');
        ApiManager.getResponseDetail(paramsResponce, myHeaders)
          .then(success => {
            let data = success.data;
            if (data.length > 0) {
              setHasMore(true);
            } else {
              setHasMore(false);
            }
            setResponseData([...responseData, ...data]);
            setSubResLoader(false);
            setCounter(counter + 1);
          })
          .catch(error => {
            console.log(error);
          });
      } else {
        Alert.alert(Constants.network, Constants.please_check_internet);
      }
    });
  };

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
      if (data.defaultProfileId != null) {
        userGetData(item, item.onProfileTagName);
      } else {
        restrictShowModal();
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

  const RenderItemFunction = memo(({data}) => {
    let nestedRes = data.response;

    return (
      <View>
        <View style={{flexDirection: 'row', paddingHorizontal: RFValue(5)}}>
          <View>
            <TouchableOpacity
              style={styles.ImageContainer}
              onPress={() =>
                navigation.navigate(Constants.screen_profile, {
                  id: data.byProfileId,
                })
              }>
              {data?.byProfileImage ? (
                <Image
                  style={{
                    height: RFValue(35),
                    width: RFValue(35),
                    borderRadius: RFValue(35) / 2,
                  }}
                  source={{uri: data?.byProfileImage}}
                />
              ) : (
                <UserIcon height={RFValue(30)} width={RFValue(30)} />
              )}
            </TouchableOpacity>
            {nestedRes && (
              <View style={styles.verticalLineView}>
                <View style={styles.verticalLine}></View>
              </View>
            )}
          </View>
          <View style={{marginHorizontal: RFValue(8), width: '92%'}}>
            <View style={styles.cmntDisplayBox}>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <TouchableOpacity
                  style={[styles.perentContainer, {maxWidth: '60%'}]}
                  onPress={() =>
                    navigation.navigate(Constants.screen_profile, {
                      id: data.byProfileId,
                    })
                  }>
                  <Text numberOfLines={1} style={styles.reviewUserName}>
                    {data?.byProfileName}
                  </Text>
                  <GreenTick
                    width={RFValue(13)}
                    height={RFValue(13)}
                    style={{marginHorizontal: RFValue(5)}}
                  />
                  <Text
                    numberOfLines={1}
                    style={[styles.reviewTagname, {maxWidth: '40%'}]}>
                    @{data?.byProfileTagName}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.reviewTagname}>
                  {data?.daysAgo.length < 5 ? data?.daysAgo : null}
                </Text>
              </View>
              <TouchableOpacity
                style={{marginVertical: RFValue(8)}}
                onPress={() =>
                  navigation.push(Constants.screen_nested_review, {
                    item: item,
                    responce1: data,
                  })
                }>
                <HTMLView value={data.content} renderNode={renderNode} />
              </TouchableOpacity>
              {data?.media && (
                <View style={styles.imageGalleryContainer}>
                  <ImageDisplayComponents
                    media={data?.media}
                    navigation={navigation}
                  />
                </View>
              )}
            </View>
            <View
              style={[
                styles.addResponseIcnContainer,
                {marginLeft: RFValue(10), marginVertical: RFValue(12)},
              ]}>
              {data?.responseCount ? (
                <TouchableOpacity
                  onPress={() =>
                    navigation.push(Constants.screen_nested_review, {
                      item: item,
                      responce1: data,
                    })
                  }
                  style={styles.resAndAddResponseIcon}>
                  <Responses width={RFValue(21)} height={RFValue(17)} />
                  <Text
                    style={{marginLeft: RFValue(8), color: Colors.color_gray}}>
                    {data.responseCount}
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

        {/* SECOUND RESPONCE */}
        {nestedRes && (
          <View style={{flexDirection: 'row', paddingHorizontal: RFValue(5)}}>
            <View>
              <TouchableOpacity
                style={styles.ImageContainer}
                onPress={() =>
                  navigation.navigate(Constants.screen_profile, {
                    id: nestedRes.byProfileId,
                  })
                }>
                {nestedRes?.byProfileImage ? (
                  <Image
                    style={{
                      height: RFValue(35),
                      width: RFValue(35),
                      borderRadius: RFValue(35) / 2,
                    }}
                    source={{uri: nestedRes?.byProfileImage}}
                  />
                ) : (
                  <UserIcon height={RFValue(30)} width={RFValue(30)} />
                )}
              </TouchableOpacity>
            </View>
            <View style={{marginHorizontal: RFValue(8), width: '92%'}}>
              <View style={styles.cmntDisplayBox}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <TouchableOpacity
                    style={[styles.perentContainer, {maxWidth: '60%'}]}
                    onPress={() =>
                      navigation.navigate(Constants.screen_profile, {
                        id: nestedRes.byProfileId,
                      })
                    }>
                    <Text numberOfLines={1} style={styles.reviewUserName}>
                      {nestedRes?.byProfileName}
                    </Text>
                    <GreenTick
                      width={RFValue(13)}
                      height={RFValue(13)}
                      style={{marginHorizontal: RFValue(5)}}
                    />
                    <Text
                      numberOfLines={1}
                      style={[styles.reviewTagname, {maxWidth: '40%'}]}>
                      @{nestedRes?.byProfileTagName}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.reviewTagname}>{nestedRes?.daysAgo}</Text>
                </View>
                <TouchableOpacity
                  style={{marginVertical: RFValue(8)}}
                  onPress={() =>
                    navigation.push(Constants.screen_nested_review, {
                      item: item,
                      responce1: data,
                      responce2: nestedRes,
                    })
                  }>
                  <HTMLView value={nestedRes.content} renderNode={renderNode} />
                </TouchableOpacity>
                {nestedRes?.media && (
                  <View style={styles.imageGalleryContainer}>
                    <ImageDisplayComponents
                      media={nestedRes?.media}
                      navigation={navigation}
                    />
                  </View>
                )}
              </View>
              <View
                style={[
                  styles.addResponseIcnContainer,
                  {marginLeft: RFValue(10), marginVertical: RFValue(12)},
                ]}>
                {nestedRes?.responseCount ? (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.push(Constants.screen_nested_review, {
                        item: item,
                        responce1: data,
                        responce2: nestedRes,
                      })
                    }
                    style={styles.resAndAddResponseIcon}>
                    <Responses width={RFValue(21)} height={RFValue(17)} />
                    <Text
                      style={{
                        marginLeft: RFValue(8),
                        color: Colors.color_gray,
                      }}>
                      {nestedRes.responseCount}
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
              {data.responseCount > 1 && (
                <TouchableOpacity
                  onPress={() =>
                    navigation.push(Constants.screen_nested_review, {
                      item: item,
                      responce1: data,
                    })
                  }
                  style={[
                    styles.perentContainer,
                    {marginVertical: RFValue(8)},
                  ]}>
                  <View
                    style={{
                      borderColor: Colors.color_black,
                      borderWidth: 1,
                      width: RFValue(20),
                      marginRight: RFValue(10),
                    }}
                  />
                  <Text style={styles.reviewUserName}>
                    {Constants.view_more}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        {verificationModal && (
          <UserVerificationPopUP
            verifyBtn={() => {
              navigation.navigate(Constants.screen_verify_identity),
                setVerificationModal(false);
            }}
          />
        )}
      </View>
    );
  });

  const checkoutProfile = name => {
    let params = {
      name: name,
    };
    var myHeaders = new Headers();
    myHeaders.append('Content-type', 'application/json');
    ApiManager.getUserProfile(params, myHeaders)
      .then(success => {
        let data = success.data;
        navigation.navigate(Constants.screen_profile, {id: data.profileId});
      })
      .catch(error => {
        alert('Profile not Found');
        console.log(error);
      });
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
                style={[styles.reviewMessage, {color: Colors.color_light_blue}]}
                key={index}
                onPress={() => checkoutProfile(txt.slice(1))}>
                {val}
              </Text>
            );
          } else {
            return (
              <Text style={styles.reviewMessage} key={index}>
                {val}
              </Text>
            );
          }
        });
    }
  };

  const headerFunction = () => {
    return (
      <View style={{padding: RFValue(15)}}>
        <View style={styles.perentContainer}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate(Constants.screen_profile, {
                id: item.byProfileId,
              })
            }>
            <View style={[styles.ImageContainer, {marginRight: RFValue(10)}]}>
              {item?.byProfileImage ? (
                <Image
                  style={{
                    height: RFValue(35),
                    width: RFValue(35),
                    borderRadius: RFValue(35) / 2,
                  }}
                  source={{uri: item?.byProfileImage}}
                />
              ) : (
                <UserIcon height={RFValue(30)} width={RFValue(30)} />
              )}
            </View>
          </TouchableOpacity>
          <View>
            <View style={styles.perentContainer}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate(Constants.screen_profile, {
                    id: item.byProfileId,
                  })
                }
                style={styles.perentContainer}>
                <Text style={styles.reviewUserName}>{item?.byProfileName}</Text>
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
            </View>
            <Text
              onPress={() =>
                navigation.navigate(Constants.screen_profile, {
                  id: item?.byProfileId,
                })
              }
              style={styles.reviewTagname}>
              @{item.byProfileTagName}
            </Text>
          </View>
        </View>
        <Text style={styles.reviewShared}>
          {Constants.share_review_for}
          <Text
            style={styles.mentionText}
            onPress={() => checkoutProfile(item?.onProfileTagName)}>
            {' '}
            @{item.onProfileTagName}
          </Text>
        </Text>
        <HTMLView value={item.content} renderNode={renderNode} />
        {item.media && (
          <View style={styles.imageGalleryContainer}>
            <ImageDisplayComponents
              media={item.media}
              isReviewScreen={true}
              navigation={navigation}
            />
          </View>
        )}
        <Text style={[styles.reviewDate, {marginTop: RFValue(12)}]}>
          {moment(item.updatedDate).format('ll')}
        </Text>
        <View
          style={[
            styles.sapratorLine,
            {borderWidth: 0.5, marginVertical: RFValue(12)},
          ]}
        />
        <View style={styles.addResponseIcnContainer}>
          {item.responseCount ? (
            <View style={styles.resAndAddResponseIcon}>
              <Responses width={RFValue(21)} height={RFValue(17)} />
              <Text style={{marginLeft: RFValue(8), color: Colors.color_gray}}>
                {item?.responseCount}
              </Text>
            </View>
          ) : null}
          {isLoggedIn && (
            <TouchableOpacity style={{flex: 1}} onPress={createPageModalShow}>
              <AddResponses width={RFValue(21)} height={RFValue(17)} />
            </TouchableOpacity>
          )}
        </View>
        <View
          style={[
            styles.sapratorLine,
            {borderWidth: 2, marginTop: RFValue(12)},
          ]}
        />
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
  };

  const sharePost = async id => {
    const url = await buildLink(id);
    const title = 'CitizeX';
    const message = 'check this Post';

    const options = Platform.select({
      ios: {
        activityItemSources: [
          {
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
            placeholderItem: {type: 'text', content: message},
            item: {
              default: {type: 'text', content: message},
              message: null,
            },
            linkMetadata: {
              title: message,
            },
          },
          {
            placeholderItem: {
              type: 'url',
            },
            item: {
              default: {
                type: 'text',
                content: `${message} ${url}`,
              },
            },
            linkMetadata: {
              title: message,
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
        domainUriPrefix: 'https://keeku.page.link',
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
    return link;
  };

  if (item?.length == 0 || item == null) {
    return <Loader />;
  }

  return (
    <View style={{flex: 1, backgroundColor: Colors.color_white}}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <Header
        back={() => navigation.goBack()}
        openModal={() => setShowActionSheet(true)}
        title={Constants.review}
        MoreOption={true}
      />
      <SafeAreaView style={{flex: 1}}>
        <FlatList
          data={responseData}
          style={{flex: 1}}
          ListHeaderComponent={() => headerFunction()}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => <RenderItemFunction data={item} />}
          ItemSeparatorComponent={() => (
            <View
              style={[
                styles.sapratorLine,
                {borderWidth: 0.5, marginBottom: RFValue(12)},
              ]}
            />
          )}
          onEndReachedThreshold={0.7}
          onEndReached={() => (hasMore ? getResponseData() : null)}
          ListFooterComponent={() => {
            return (
              <View>
                {hasMore && (
                  <ActivityIndicator
                    color={Colors.color_black}
                    style={{alignSelf: 'center', marginVertical: RFValue(10)}}
                  />
                )}
              </View>
            );
          }}
          ListEmptyComponent={() => {
            return (
              subResLoader && (
                <ActivityIndicator
                  color={Colors.color_black}
                  style={{alignSelf: 'center', marginVertical: RFValue(10)}}
                />
              )
            );
          }}
        />
        <ActionSheet
          visible={showActionSheet}
          onClose={() => setShowActionSheet(false)}
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
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  reviewUserName: {
    fontSize: RFValue(15),
    fontFamily: Constants.font_regular,
    color: Colors.color_black,
  },
  perentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  ImageContainer: {
    height: RFValue(35),
    width: RFValue(35),
    borderRadius: RFValue(35) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.color_user_bg,
  },
  reviewShared: {
    fontSize: RFValue(14),
    fontFamily: Constants.font_regular,
    color: Colors.color_gray,
    marginTop: RFValue(8),
    marginBottom: RFValue(2),
    textAlign: 'justify',
  },
  mentionText: {
    fontSize: RFValue(14),
    color: Colors.color_light_blue,
    fontFamily: Constants.font_semibold,
  },
  reviewMessage: {
    fontSize: RFValue(13),
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
    paddingRight: RFValue(15),
  },
  imageGalleryContainer: {
    flexDirection: 'row',
    marginTop: RFValue(8),
  },
  sapratorLine: {
    borderColor: Colors.color_light_grey,
    alignSelf: 'center',
    width: '120%',
  },
  cmntDisplayBox: {
    borderRadius: RFValue(6),
    marginRight: RFValue(20),
    backgroundColor: Colors.color_user_bg,
    paddingVertical: RFValue(5),
    paddingHorizontal: RFValue(8),
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
    borderColor: Colors.color_light_grey,
    height: '100%',
    width: RFValue(0),
    alignItems: 'center',
    borderWidth: 1,
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
});
