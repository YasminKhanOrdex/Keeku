import React, { useEffect, useState } from "react";
import {
  Animated, Dimensions,

  StyleSheet, TouchableOpacity, View
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import * as Colors from '../../../../res/colors';
import { BottomMenuItem } from "./BottomMenuItem";

import * as UserData from '../../../../localStorage/UserData';
import * as ApiManager from '../../../../apiManager/ApiManager';

export const TabBar = ({
  state,
  descriptors,
  navigation,
  showBottomBar,
}) => {
  const [translateValue] = useState(new Animated.Value(0));
  const totalWidth = Dimensions.get("window").width;
  const tabWidth = totalWidth / state.routes.length;
  const [notifData, setNotifData] = useState(0);

  const animateSlider = (index) => {
    Animated.spring(translateValue, {
      toValue: index * tabWidth,
      velocity: 10,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    animateSlider(state.index);
    // fetchUserData();
  }, [state.index, showBottomBar]);

  useEffect(() => {
    fetchUserData();
  });

  const fetchUserData = () => {
    UserData.getUserData()
      .then(data => {
        ApiManager.fetchNotificationCount(data.defaultProfileId)
          .then((data) => {
            setNotifData(data.data);
          })
          .catch((error) => {
            console.log(error);
          })
      })
      .catch(error => {
        console.log('error while getting data from local storage');
      });
  }

  return (
    <View>
      {showBottomBar && <View style={[style.tabContainer, { width: totalWidth }]}>
        <View style={{ flexDirection: "row" }}>
          <Animated.View
            style={[
              style.slider,
              {
                transform: [{ translateX: translateValue }],
                width: tabWidth - RFValue(30),
              },
            ]}
          />

          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }

              animateSlider(index);
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            return (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityStates={isFocused ? ["selected"] : []}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={{ flex: 1 }}
                key={index}
              >
                <BottomMenuItem
                  tabName={route.name}
                  isCurrent={isFocused}
                  props={notifData}
                />
              </TouchableOpacity>
            );

          })}
        </View>
      </View>
      }
    </View>
  );
};

const style = StyleSheet.create({
  tabContainer: {
    height: RFValue(60),
    shadowOpacity: 0.1,
    shadowRadius: 4.0,
    backgroundColor: "white",
    elevation: 10,
    position: "absolute",
    bottom: 0,
  },
  slider: {
    height: RFValue(2),
    position: "absolute",
    bottom: 0,
    left: RFValue(15),
    marginVertical: RFValue(8),
    backgroundColor: Colors.color_black
  },
});