import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import * as Colors from '../../../res/colors';
import * as Constants from './../../../res/strings';
import * as ApiManager from '../../../apiManager/ApiManager';
import * as UserData from '../../../localStorage/UserData';
import UserIcon from '../../../assets/images/icn_user.svg';
import HTMLView from 'react-native-htmlview';
var Stomp = require("stompjs/lib/stomp.js").Stomp;
import SockJS from 'sockjs-client';
import environment from '../../../environment/env';
import Loader from '../../../sharedComponents/Loader';
import ProfileMenuBar from '../../../sharedComponents/ProfileMenuBar'
import NetInfo from '@react-native-community/netinfo';

export default class NotificationScreen extends Component {

  ENVIRONMENT_URL = environment.getURL();
  webSocketEndPoint = `${this.ENVIRONMENT_URL}` + '/rest/auth/ws';
  topic = '/user/queue/messages';
  stompClient;
  profileId;
  headers = { 'X-Frame-Options': 'deny', Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJrcHRlc3QxIiwiZXhwIjoxNjMxOTEyNjgzLCJpYXQiOjE2MzE4NzY2ODN9.kzM-1_p6xd_KeLQ6aLkflZM9nNTmf1_OsziyokonRGM` };
  profileId = null;
  startPage = 0;
  endPage = 10;
  userName = '';

  constructor(props) {
    super(props)
    this.state = {
      notifications: [],
      isLoaderVisible: false,
      notifOccur: '',
      isActivityInc: false
    }
  }

  connect(profileId) {
    try {
      this.stompClient = Stomp.over(new SockJS(this.webSocketEndPoint));
      const _this = this;
      _this.stompClient.connect(
        this.headers,
        function (frame) {
          _this._send(profileId);
          _this.stompClient.subscribe(_this.topic, function (sdkEvent) {
            _this.onMessageReceived(sdkEvent);
          });

          //_this.stompClient.reconnect_delay = 2000;
        },
        this.errorCallBack
      );
    } catch (e) {
      console.log("error === ", JSON.stringify(e.message));
    }
  }

  errorCallBack(error) {
    console.log('errorCallBack -> ' + error);
    setTimeout(() => {
      this._connect(this.profileId);
    }, 5000);
  }

  _send(message) {
    this.stompClient.send('/app/ws', this.headers, JSON.stringify(message));
  }

  onMessageReceived(message) {
    this.fetchNotifications(0);
    this.props.navigation.navigate(Constants.screen_dashboard);
  }

  componentDidMount() {
    this.fetchUserData();
  }

  fetchUserData() {
    UserData.getUserData()
      .then(data => {
        if (data !== null) {
          this.userName = data.firstName;
          this.profileId = data.defaultProfileId;
          this.fetchNotifications(this.startPage);
          this.connect(this.profileId);
        }
      })
      .catch(error => {
        console.log('error while getting data from local storage');
      });
  }

  fetchNotifications(sp) {
    this.showIndicator();
    ApiManager.fetchNotificationByProfileId(this.profileId, sp, this.endPage)
      .then(success => {
        let data = success.data;
        if (data.length == 0) {
          console.log("No notifications found");
        }
        this.hideIndicator()
        this.setState({
          notifications: data
        })
      })
      .catch(error => {
        this.hideIndicator()
        console.log('🚀  file: NotificationScreen.js  line 26  useEffect  error Fail', error);
      });
  }

  LoadMoreData = () => {
    this.startPage = this.startPage + 1;
    this.setState({
      isActivityInc: true
    })
    ApiManager.fetchNotificationByProfileId(this.profileId, this.startPage, this.endPage)
      .then(success => {
        let data = success.data;
        if (data.length > 0) {
          this.setState({
            isActivityInc: true,
            notifications: [...this.state.notifications, ...data]
          })
        }
        else {
          this.setState({
            isActivityInc: false
          })
        }
      })
      .catch(error => {
        console.log(
          '🚀  file: NotificationScreen.js  line 85 useEffect  error Fail',
          error,
        );
      });
    // this.fetchNotifications(this.startPage);
  }

  renderNode = (node, index, siblings, parent, defaultRenderer) => {
    if (node.name == 'span' && !!node?.attribs['data-mention']) {
      node.name = 'a';
      node.attribs.href = node.attribs['data-mention'];
    }
  }

  updateNotificationFlag(item) {
    let [notificationId, isRead, isReview] = [item.id, item.isRead, item.isReview];

    this.showIndicator();
    if (isRead == false) {
      ApiManager.notificationUpdateFlag(notificationId, isRead)
        .then(success => {

          // TODO: Add Notification Count
          this.fetchNotifications(0);
          this.hideIndicator();
        })
        .catch(error => {
          this.hideIndicator();
          console.log(
            '🚀  file: NotificationScreen.js  line 26  useEffect  error Fail',
            error,
          );
        });
    } else {
      this.hideIndicator();
    }
    if (isReview) {
      // TODO: Add Route to view response
      const result = { id: item.mentionReviewId }
      this.props.navigation.navigate(Constants.screen_review_detail, { item: result })
    } else {
      console.log(">>> navigate nested item >>> ", item);

      let paramsReview = {
        reviewId: item?.reviewId,
        responseId: item?.mentionReviewId
      }
      console.log("parameter >>> ", paramsReview);
      NetInfo.fetch().then(state => {
        if (state.isConnected) {
          var myHeaders = new Headers();
          myHeaders.append("Content-type", "application/json");
          ApiManager.getReviewDetails(paramsReview, myHeaders)
            .then(success => {
              let data = success.data;
              // TODO: Add Route to view Nested response
              //this.props.navigation.navigate(Constants.screen_review_detail, { item: ID1, response1: item.response, response2: item?.response?.response })
              console.log({ item: data, response1: data?.response, response2: data?.response?.response });
              this.props.navigation.navigate(Constants.screen_nested_review, { item: data, responce1: data?.response, responce2: data?.response?.response, responce3: data?.response?.response?.response, responce4: data?.response?.response?.response?.response });
            }).catch(error => {
              console.log(error);
            });
        } else {
          Alert.alert(Constants.network, Constants.please_check_internet);
        }
      });
    }
  }

  checkoutProfile = (name) => {


    let params = {
      name: name.substring(1)
    }
    var myHeaders = new Headers();
    myHeaders.append("Content-type", "application/json");
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        ApiManager.getUserProfile(params, myHeaders)
          .then(success => {
            let data = success.data;

            this.props.navigation.navigate(Constants.screen_profile, { id: data.profileId });

          })
          .catch(error => {
            console.log(error);
          });
      } else {
        Alert.alert(Constants.network, Constants.please_check_internet);
      }
    });
  }

  Item = ({ item }) => {
    return (
      <View
        style={
          item.isRead == false
            ? styles.containbackColor
            : styles.containbackColor2
        }>
        <TouchableOpacity
          onPress={() => this.updateNotificationFlag(item)}>
          <View style={{ flexDirection: 'row', paddingVertical: RFValue(13) }}>
            {item.byProfileImage ? (
              <TouchableOpacity
                onPress={() => console.log('Profile image clicked !!')}>
                <Image
                  source={{ uri: item.byProfileImage }}
                  style={{
                    width: RFValue(40),
                    height: RFValue(40),
                    borderRadius: RFValue(30),
                  }}
                />
              </TouchableOpacity>
            ) : (
                <TouchableOpacity
                  style={{
                    height: RFValue(10),
                    width: RFValue(10),
                    borderRadius: RFValue(30),
                    padding: RFValue(22),
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: Colors.color_user_bg
                  }}
                  onPress={() => console.log('Profile image clicked !!')}>
                  <UserIcon height={RFValue(30)} width={RFValue(30)} />
                </TouchableOpacity>
              )}
            <View style={{ marginLeft: RFValue(15), flex: 1 }}>
              <View>
                <Text
                  style={[styles.TextStyle, { fontSize: RFValue(16), flex: 1 }]}>
                  @{item.byProfileTagName}&nbsp;
                  <Text
                    style={[
                      styles.TextStyle,
                      { color: Colors.color_gray, fontSize: RFValue(16) },
                    ]}>
                    Mentioned you on {item.byProfileName}'s(@
                    {item.byProfileTagName}) page:{' '}
                  </Text>
                </Text>

                <View
                  style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <HTMLView
                    value={item.content}
                    addLineBreaks={false}
                    onLinkPress={(url, text) => this.checkoutProfile(url)}
                    renderNode={this.renderNode}
                    stylesheet={HTMLViewStyle}
                    style={{ flex: 1 }}
                  />
                </View>

              </View>
              <View style={{ marginTop: RFValue(5) }}>
                <Text style={styles.TxtStyle}>{item.daysAgo}</Text>
              </View>
            </View>
          </View>
          <View style={styles.baseLine} />
        </TouchableOpacity>


      </View>
    );
  };

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

  render() {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.container}>
          <Text style={styles.textStyle}>{Constants.notification}</Text>
          {/* <TouchableOpacity style={styles.imgContainer}>
            <Image
              style={styles.profileImageStyle}
              source={{
                uri: 'https://keekudiag.blob.core.windows.net/profileimages/51859_profile_image.jpg'
              }}
            />
          </TouchableOpacity> */}
          <View style={styles.imgContainer}>
            <ProfileMenuBar
              gotoLogin={this.props.screenProps.gotoLogin}
              gotoSignUp={this.props.screenProps.gotoSignUp}
              logout={this.props.screenProps.logout}
              hideIndicator={() => null}
              showIndicator={() => null}
              gotoMoreTab={() =>
                this.props.navigation.navigate(Constants.tab_more)
              }
              gotoBasicDetailScreen={() => null}
            />
          </View>
        </View>
        <View
          style={{marginTop: RFValue(10), marginBottom: RFValue(30), flex: 1}}>
          <FlatList
            data={this.state.notifications}
            renderItem={this.Item}
            onEndReachedThreshold={0}
            initialNumToRender={10}
            onEndReached={() => this.LoadMoreData()}
            ListFooterComponent={
              this.state.notifications.length > 7 &&
              this.state.isActivityInc ? (
                <ActivityIndicator size="large" color={Colors.color_black} />
              ) : (
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      paddingVertical: RFValue(15),
                      paddingHorizontal: RFValue(15),
                    }}>
                    <TouchableOpacity>
                      <View
                        style={{
                          backgroundColor: 'white',
                          borderColor: 'green',
                          borderWidth: 1,
                          width: 50,
                          height: 50,
                          justifyContent: 'center',
                          borderRadius: 50,
                          alignItems: 'center',
                        }}>
                        <Text>CitizeX</Text>
                      </View>
                    </TouchableOpacity>

                    <View style={{marginLeft: RFValue(15), flex: 1}}>
                      <Text
                        style={{
                          color: Colors.color_black,
                          fontFamily: Constants.font_regular,
                          fontSize: RFValue(16),
                        }}>
                        Welcome to keeku
                      </Text>
                      <Text
                        style={{
                          fontFamily: Constants.font_regular,
                          color: Colors.color_gray,
                          fontSize: RFValue(14),
                        }}>
                        Hi {this.userName}! Welcome to keeku. Complete your
                        verification in easy step.
                      </Text>
                    </View>
                    {/* <View style={styles.baseLine} /> */}
                  </View>
                  <View
                    style={{
                      marginHorizontal: RFValue(15),
                      height: 1,
                      width: 'auto',
                      backgroundColor: Colors.color_light_grey,
                    }}
                  />
                </View>
              )
            }
            ListFooterComponentStyle={{
              marginBottom: RFValue(50),
            }}
          />
        </View>

        {this.state.isLoaderVisible && <Loader />}
        {/* <TabBar /> */}
      </View>
    );
  }

}

const HTMLViewStyle = StyleSheet.create({
  p: {
    color: Colors.color_black,
    margin: 0,
    padding: 0,
    fontSize: RFValue(16),
    display: 'flex',
    textAlignVertical: 'top',
    justifyContent: 'center',
    alignItems: 'center'
  },
  a: {
    color: Colors.color_light_blue,
    // fontWeight: '700'
  }
});

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.color_white
  },
  container: {
    height: RFValue(60),
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: RFValue(15)
  },
  textStyle: {
    fontSize: RFValue(24),
    fontFamily: Constants.font_semibold
  },
  imgContainer: {
    position: 'absolute',
    right: RFValue(0),
    height: RFValue(35),
    width: RFValue(35),
    borderRadius: RFValue(35),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.color_user_bg
  },
  profileImageStyle: {
    width: RFValue(32),
    height: RFValue(32),
    borderRadius: RFValue(32)
  },
  baseLine: {
    height: 1,
    width: 'auto',
    backgroundColor: Colors.color_light_grey,
    // marginVertical: RFValue(13)
  },
  profileImg: {
    height: RFValue(92),
    width: RFValue(92),
    borderRadius: RFValue(100),
    backgroundColor: Colors.color_user_bg,
    justifyContent: 'center',
    alignItems: 'center'
  },
  TextStyle: {
    color: Colors.color_black,
    fontFamily: Constants.font_regular,
    fontSize: RFValue(14),
  },
  TxtStyle: {
    fontFamily: Constants.font_regular,
    color: Colors.color_gray,
    fontSize: RFValue(12)
  },
  containbackColor: {
    backgroundColor: Colors.color_user_bg,
    paddingHorizontal: RFValue(18),
  },
  containbackColor2: {
    backgroundColor: 'white',
    paddingHorizontal: RFValue(17),
  }
});