import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { TabBar } from "./TabBar";
import SearchScreen from "../../screens/SearchScreen";
import DashboardStackNav from "../../../../navigation/DashboardStackNav";
import MoreStackNav from "../../../../navigation/MenuStackNav";
import PostAReviewScreen from "../../screens/PostAReviewScreen";
import NotificationScreen from "../../screens/NotificationScreen";
import { SafeAreaView, View } from "react-native";
import * as Colors from '../../../../res/colors';
import * as Constants from '../../../../res/strings';
import { useState, useEffect } from "react";
import * as UserData from '../../../../localStorage/UserData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ApiManager from '../../../../apiManager/ApiManager';

export const BottomMenu = (data) => {
  const Tab = createBottomTabNavigator();
  const [isBottomBarVisible, setBottomBarVisible] = useState(true);
  const [isUserVerified, setUserVerified] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = () => {
    AsyncStorage.getItem(Constants.token).then((token) => {
      if (!!token) {
        if (token === Constants.guestToken) {
          setUserVerified(false);
        } else {
          UserData.getUserData().then((data) => {

            ApiManager.fetchUserDetails(data.userId, false)
              .then((userData) => {
                if (userData.data.verified === true) {
                  setUserVerified(true);
                } else {
                  setUserVerified(false);
                }
              })
          })
        }
      }
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.color_white }}>
      <View style={{ flex: 1 }}>
        <Tab.Navigator
          tabBar={(props) => <TabBar {...props} showBottomBar={isBottomBarVisible} />}
        >
          <Tab.Screen name={Constants.tab_representative}>
            {(props) => <DashboardStackNav {...data} {...props} showBottomBar={showBottomBar} />}
          </Tab.Screen>
          <Tab.Screen name={Constants.tab_search}>
            {(props) => <SearchScreen {...data} {...props} showBottomBar={showBottomBar} />}
          </Tab.Screen>
          {isUserVerified && <Tab.Screen name={Constants.tab_post_review} component={PostAReviewScreen} showBottomBar={showBottomBar} />}
          <Tab.Screen name={Constants.tab_notification}>
            {(props) => <NotificationScreen {...data} {...props} showBottomBar={showBottomBar} />}
          </Tab.Screen>
          <Tab.Screen name={Constants.tab_more}>
            {(props) => <MoreStackNav {...data} {...props} showBottomBar={showBottomBar} />}
          </Tab.Screen>
        </Tab.Navigator>
      </View>
    </SafeAreaView>
  );

  function showBottomBar(value, doRefresh = false) {
    setBottomBarVisible(value);
    if (doRefresh) {
      refresh();
    }
  }
};