import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import dynamicLinks from '@react-native-firebase/dynamic-links';
import { BottomMenu } from "./components/BottomMenu/BottomMenu";
import PushNotification from "react-native-push-notification";
import messaging from '@react-native-firebase/messaging';
import { Platform } from "react-native";
import * as Constants from '../../res/strings';
import NetInfo from '@react-native-community/netinfo';
import * as ApiManager from '../../apiManager/ApiManager';
import * as UserData from '../../localStorage/UserData';

export default function Main(props) {

  const getParameterFromUrl = (url, parm) => {
    var re = new RegExp('.*[?&]' + parm + '=([^&]+)(&|$)');
    var match = url.match(re);
    return match ? match[1] : '';
  };

  const handleDynamicLink = async () => {
    const url = await UserData.getDynamicLinkData()
    if (url) {
      const post_id = getParameterFromUrl(url, 'post_id');
      const response_id = getParameterFromUrl(url, 'response_id');
      if (response_id) {
        let paramsReview = {
          reviewId: post_id,
          responseId: response_id
        }
        NetInfo.fetch().then(state => {
          if (state.isConnected) {
            var myHeaders = new Headers();
            myHeaders.append("Content-type", "application/json");
            ApiManager.getReviewDetails(paramsReview, myHeaders)
              .then(success => {
                let data = success.data;
                props.navigation.push(Constants.screen_nested_review, { item: data, responce1: data?.response, responce2: data?.response?.response, responce3: data?.response?.response?.response, responce4: data?.response?.response?.response?.response });
              }).catch(error => {
                console.log(error);
              });
          } else {
            Alert.alert(Constants.network, Constants.please_check_internet);
          }
        });
      } else {
        props.navigation.navigate(Constants.screen_review_detail, { item: { id: post_id } })
      }
      await UserData.removeDynamicLinkData()
    } else {

    }
  };

  useEffect(() => {
    handleDynamicLink()
  }, [])

  const handleDynamicLinks = link => {
    if (link?.url) {
      const post_id = getParameterFromUrl(link?.url, 'post_id');
      const response_id = getParameterFromUrl(link?.url, 'response_id');
      console.log('response_id', post_id, response_id)
      if (response_id) {
        let paramsReview = {
          reviewId: post_id,
          responseId: response_id
        }
        console.log('paramsReview', paramsReview)
        NetInfo.fetch().then(state => {
          if (state.isConnected) {
            var myHeaders = new Headers();
            myHeaders.append("Content-type", "application/json");
            ApiManager.getReviewDetails(paramsReview, myHeaders)
              .then(success => {
                let data = success.data;
                props.navigation.push(Constants.screen_nested_review, { item: data, responce1: data?.response, responce2: data?.response?.response, responce3: data?.response?.response?.response, responce4: data?.response?.response?.response?.response });
              }).catch(error => {
                console.log(error);
              });
          } else {
            Alert.alert(Constants.network, Constants.please_check_internet);
          }
        });
      } else {
        props.navigation.navigate(Constants.screen_review_detail, { item: { id: post_id } })
      }
    }
  };

  useEffect(() => {
    const unsubscribe = dynamicLinks().onLink(handleDynamicLinks);
    return () => unsubscribe();
  }, [])

  const setDeviceToken = (token) => {
    if (token != undefined) {
      // setToken(token);
      UserData.getUserData()
        .then((user) => {
          if (user.userId != undefined) {

            setTimeout(() => {
              ApiManager.addDeviceToken(user.userId, token.token)
                .then((result) => {
                  // console.log("device token added >>> ", result);
                })
                .catch((error) => {
                  console.log("error in adding device token >>> ", error);
                })
            }, 1500)

          }
        })
    }
  }

  const handleNotification = (notification) => {
    console.log('handleNotification >>>>>>>>>>>>>>>>>>>>>', notification);
    var notificationId = ''
    const result = { id: 2860 };
    props.navigation.navigate("ReviewDetail", { item: result })
    //your logic to get relevant information from the notification
    //  navigator.dispatch(CommonActions.navigate({ name: Constants.tab_notification }));
    //here you navigate to a scene in your app based on the notification info

  }

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      getFcmToken();
      console.log('Authorization status:', authStatus);
    }
  }

  const getFcmToken = async () => {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      console.log(fcmToken);
      console.log("Your Firebase Token is:", fcmToken);
      UserData.getUserData()
        .then((user) => {
          console.log("main.js >>> user >>> ", user.userId);
          ApiManager.addDeviceToken(user.userId, fcmToken)
            .then((result) => {
              console.log("device token added >>> ", result);
            })
            .catch((error) => {
              console.log("error in adding device token >>> ", error);
            })
        })
    } else {
      console.log("Failed", "No token received");
    }
  }

  useEffect(() => {
    if (Platform.OS == "android") {
      PushNotification.configure({
        // (optional) Called when Token is generated (iOS and Android)
        onRegister: function (token) {
          setDeviceToken(token);
        },

        // (required) Called when a remote is received or opened, or local notification is opened
        onNotification: function (notification) {

          handleNotification(notification);

          // process the notification

          // (required) Called when a remote is received or opened, or local notification is opened
          //notification.finish(PushNotificationIOS.FetchResult.NoData);
        },

        // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
        onAction: function (notification) {
          console.log("ACTION:", notification.action);

          // process the action
        },

        // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
        onRegistrationError: function (err) {
          console.error(err.message, err);
        },

        // Should the initial notification be popped automatically
        // default: true
        popInitialNotification: true,

        /**
         * (optional) default: true
         * - Specified if permissions (ios) and token (android and ios) will requested or not,
         * - if not, you must call PushNotificationsHandler.requestPermissions() later
         * - if you are not using remote notification or do not have Firebase installed, use this:
         *     requestPermissions: Platform.OS === 'ios'
         */
        requestPermissions: true,
      });
    }
    else if (Platform.OS == "ios") {
      requestUserPermission();
    }
  })

  return (
    // <NavigationContainer independent={true}>
    <SafeAreaProvider>
      <BottomMenu {...props} />
    </SafeAreaProvider>
    // </NavigationContainer>
  );
}