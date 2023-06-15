import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, useWindowDimensions, FlatList, View, Text } from 'react-native';
import { SceneMap, TabView, TabBar } from 'react-native-tab-view';
import { RFValue } from 'react-native-responsive-fontsize';
import * as Colors from '../../../../res/colors';
import * as Constants from '../../../../res/strings';
import * as ApiManager from '../../../../apiManager/ApiManager';
import ReviewComponents from '../../../../sharedComponents/ReviewComponents';
import Loader from '../../../../sharedComponents/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function SearchScreenTabView() {

  const [index, setIndex] = useState(0);
  const layout = useWindowDimensions();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [routes] = useState([
    {
      key: 'Trending',
      title: 'Trending',
    },
    {
      key: 'Politics',
      title: 'Politics',
    },
    {
      key: 'Product',
      title: 'Product',
    },
    {
      key: 'Organization',
      title: 'Organization',
    },
  ]);

  useEffect(() => {
    refresh()
  }, [])

  const refresh = () => {
    AsyncStorage.getItem(Constants.token).then((token) => {
      if (token) {
        if (token !== Constants.guestToken) {
          setIsLoggedIn(true)
        } else {
          setIsLoggedIn(false)
        }
      }
    });
  }

  const customTabBar = (props) => (
    <View style={styles.tabBarContainer}>
      <TabBar
        {...props}
        indicatorStyle={styles.tabBarIndicatorStyle}
        style={styles.tabBarStyle}
        activeColor={Colors.color_black}
        inactiveColor={Colors.color_gray}
        labelStyle={styles.tabBarLabelStyle}
        tabStyle={styles.tabStyle}
        scrollEnabled={true}
      />
    </View>
  );

  const renderScene = SceneMap({
    Trending: () => TrandingComponent(0),
    Politics: () => TrandingComponent(1),
    Product: () => TrandingComponent(2),
    Organization: () => TrandingComponent(3),
  });

  function TrandingComponent(idx) {
    const [review, setReview] = useState([]);

    useFocusEffect(
      useCallback(() => {
        getData()
        return () => true;
      }, [])
    );

    useEffect(() => {
      getData()
    }, [])

    const getData = () => {
      let params
      if (index == 0) {
        params = { type: 'all' }
      } else if (index == 1) {
        params = { type: 'local' }
      } else if (index == 2) {
        params = { type: 'state' }
      } else {
        params = { type: 'national' }
      }
      var myHeaders = new Headers();
      myHeaders.append("Content-type", "application/json");
      ApiManager.trendingReviews(params, myHeaders)
        .then(success => {
          let data = success.data;
          setReview(data)
        })
        .catch(error => {
          console.log(error);
        });
    }

    return (
      <FlatList
        data={review}
        renderItem={({ item, index }) => <ReviewComponents item={item} isLoggedIn={isLoggedIn} />}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={() => index == idx ? <Loader /> : null}
      />
    );
  }

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={customTabBar}
    />
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {
    backgroundColor: 'white',
    shadowColor: 'white',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: {
      height: 0,
      width: 0,
    },
  },
  textStyles: {
    fontSize: RFValue(18),
    color: Colors.color_black,
    fontFamily: Constants.font_regular
  },
  tabBarIndicatorStyle: {
    backgroundColor: 'black',
  },
  tabBarLabelStyle: {
    color: 'white',
    textTransform: 'capitalize',
    fontFamily: Constants.font_regular,
    fontSize: RFValue(16),
  },
  tabStyle: {
    width: 'auto',
  },
  tabBarContainer: {
    paddingHorizontal: RFValue(5),
    borderBottomWidth: 1,
    borderBottomColor: Colors.color_user_bg
  },
  mainContainerStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
