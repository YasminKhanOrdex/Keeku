import React from 'react';
import {
  View,
  useWindowDimensions,
  Text,
  StyleSheet
  
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import * as Constants from '../../../../res/strings';
import * as Colors from '../../../../res/colors';
let information;
let myReviews;
let myContribution;

const InformationComponent = () => (
 info(information)
 );

const ReviewsComponent = () => (
reviews(myReviews)
);

const ContributionComponent = () => (
contribution(myContribution)
);
function info() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
      }}>
      <Text>information</Text>
    </View>
  );
}
function reviews() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
      }}>
      <Text>reviews</Text>
    </View>
  );
}
function contribution() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
      }}>
      <Text>myContribution</Text>
    </View>
  );
}

const renderScene = SceneMap({
  Information: InformationComponent,
  Reviews: ReviewsComponent,
  Contribution: ContributionComponent,
});

export default ManagePageTabView = props => {
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState(props.routes);
  information = props.information;
  myReviews = props.myReviews;
  myContribution = props.myContribution;

  return (
    <TabView
      navigationState={{index, routes}}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{width: layout.width}}
      renderTabBar={managePageTabView}
    />
  );
};

const managePageTabView = props => (
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
  tabBarStyle: {
    backgroundColor: 'white',
    shadowColor: 'white',
    marginTop: 10,
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: {
      height: 0,
      width: 0,
    },
  },
  tabBarIndicatorStyle: {
    backgroundColor: Colors.color_black,
  },
  tabBarLabelStyle: {
    color: Colors.color_black,
    textTransform: 'capitalize',
    fontFamily: Constants.font_semibold,
    fontSize: RFValue(12),
  },
});
