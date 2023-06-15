import React from "react";
import { View, useWindowDimensions, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import * as Constants from '../../../../res/strings';
import * as Colors from '../../../../res/colors';
import PortfolioIcon from '../../../../assets/images/icn_portfolio.svg';
import LocationPinIcon from '../../../../assets/images/icn_location_pin_gray.svg';
import Utils from '../../../../utils/Utils';
import NetInfo from '@react-native-community/netinfo';
import * as ApiManager from '../../../../apiManager/ApiManager';
import { useNavigation } from "@react-navigation/native";


let nationalRepesentatives = [];
let stateRepesentatives = [];
let localRepesentatives = [];
let navigation = [];
let close;


const LocalComponent = () => (
  getFlatList(localRepesentatives)
);

const StateComponent = () => (
  getFlatList(stateRepesentatives)
);

const NationalComponent = () => (
  getFlatList(nationalRepesentatives)
);



function getFlatList(data) {
  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <FlatList
        style={{ margin: RFValue(7) }}
        data={data}
        renderItem={renderItemView}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  )

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

          close();
          navigation.navigate(Constants.screen_profile, { id: data.profileId });

        })
        .catch(error => {
          console.log(error);
        });
    } else {
      Alert.alert(Constants.network, Constants.please_check_internet);
    }
  });
}

const renderItemView = ({ item }) => {
  return (
    <TouchableOpacity onPress={() => checkoutProfile(item?.tagname)}>
      <View style={styles.itemViewContainer}>
        <View style={styles.itemImageViewContainer}>
          {item.photoUrl ? <Image source={{ uri: item.photoUrl }} style={styles.itemImageView} /> :
            <View style={[{ ...styles.itemImageView, justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={styles.textViewStyle}>{Utils.getAcronym(item.name)}</Text>
            </View>}
        </View>
        <View style={styles.itemTextViewContainer}>
          <View>
            <Text numberOfLines={1} style={styles.itemNameStyle}>{item.name}</Text>
            <Text numberOfLines={1} style={styles.itemTagNameStyle}>@{item.tagname}</Text>
            <View style={styles.itemRowContainer}>
              <PortfolioIcon width={RFValue(11)} height={RFValue(11)} />
              <Text numberOfLines={1} style={styles.itemRowTextStyle}>{item.officename}</Text>
            </View>
            <View style={styles.itemRowContainer}>
              <LocationPinIcon width={RFValue(11)} height={RFValue(11)} />
              <Text numberOfLines={1} style={styles.itemRowTextStyle}>{item.divisionname}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const renderScene = SceneMap({
  Local: LocalComponent,
  State: StateComponent,
  National: NationalComponent,
});

export default CustomTabView = (props) => {
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState(props.routes);
  nationalRepesentatives = props.nationalRepesentatives;
  stateRepesentatives = props.stateRepesentatives;
  localRepesentatives = props.localRepesentatives;
  navigation = props.navigation;
  close = props.action;

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={customTabBar}
      swipeEnabled={true}
    />
  );


}

const customTabBar = props => (
  <TabBar
    {...props}
    indicatorStyle={styles.tabBarIndicatorStyle}
    style={styles.tabBarStyle}
    activeColor={Colors.color_black}
    inactiveColor={Colors.color_gray}
    labelStyle={styles.tabBarLabelStyle}
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  tabBarIndicatorStyle: {
    backgroundColor: 'black'
  },
  tabBarLabelStyle: {
    color: 'black',
    textTransform: 'capitalize',
    fontFamily: Constants.font_regular,
    fontSize: RFValue(17),
  },
  itemViewContainer: {
    backgroundColor: Colors.color_EAEAEA,
    margin: RFValue(7),
    borderRadius: RFValue(14),
    flexDirection: 'row'
  },
  itemImageViewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: RFValue(10)
  },
  itemImageView: {
    width: RFValue(80),
    height: RFValue(80),
    marginStart: RFValue(2)
  },
  textViewStyle: {
    fontSize: RFValue(40),
    color: Colors.color_gray,
    fontFamily: Constants.font_regular
  },
  itemTextViewContainer: {
    backgroundColor: Colors.color_white,
    flex: 1,
    borderTopRightRadius: RFValue(14),
    borderBottomRightRadius: RFValue(14),
    margin: RFValue(2),
    justifyContent: 'center',
    padding: RFValue(10)
  },
  itemNameStyle: {
    fontFamily: Constants.font_regular,
    fontSize: RFValue(15),
    color: Colors.color_black
  },
  itemTagNameStyle: {
    fontFamily: Constants.font_regular,
    fontSize: RFValue(12),
    color: Colors.color_707070
  },
  itemRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: RFValue(5),
    marginEnd: RFValue(5)
  },
  itemRowTextStyle: {
    fontFamily: Constants.font_regular,
    fontSize: RFValue(12),
    color: Colors.color_707070,
    marginStart: RFValue(5)
  }
});