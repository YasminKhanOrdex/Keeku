import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Main from '../screens/MainScreens/Main';
import * as Constants from '../res/strings';
import ReviewDetailScreen from '../screens/MainScreens/screens/SearchScreens/ReviewDetailScreen';
import UserProfileScreen from '../screens/MainScreens/screens/UserProfile/UserProfileScreen';
import NestedReviewScreen from '../screens/MainScreens/screens/SearchScreens/NestedReviewScreen';
import AddResponse from '../screens/MainScreens/screens/SearchScreens/AddResponseScreen';
import ViewMediaScreen from '../screens/MainScreens/screens/SearchScreens/ViewMediaScreen';
import VerifiyIdentityScreen from '../screens/MainScreens/screens/MenuScreens/VerifyIdentityScreen';
import AddReviewScreen from '../screens/MainScreens/screens/SearchScreens/AddReviewScreen';
import EditFormDetailsScreen from '../sharedComponents/EditFormDetails';
import EditBasicDetailsScreen from '../screens/MainScreens/screens/createPageScreens/editBasicDetail';

const Stack = createStackNavigator();

const MainNavigation = (data) => {
  return (
    <NavigationContainer>
      <Stack.Navigator headerMode="none">
        <Stack.Screen name={Constants.screen_main}>
          {props => <Main {...props} {...data} />}
        </Stack.Screen>
        <Stack.Screen name={Constants.screen_review_detail}>
          {props => <ReviewDetailScreen {...props} {...data} />}
        </Stack.Screen>
        <Stack.Screen name={Constants.screen_addRes}>
          {props => <AddResponse {...props} {...data} />}
        </Stack.Screen>
        <Stack.Screen name={Constants.screen_addReview}>
          {props => <AddReviewScreen {...props} {...data} />}
        </Stack.Screen>
        <Stack.Screen name={Constants.screen_view_media}>
          {props => <ViewMediaScreen {...props} {...data} />}
        </Stack.Screen>
        <Stack.Screen name={Constants.screen_nested_review}>
          {props => <NestedReviewScreen {...props} {...data} />}
        </Stack.Screen>
        <Stack.Screen name={Constants.screen_profile}>
          {props => <UserProfileScreen {...props} {...data} />}
        </Stack.Screen>
        <Stack.Screen name={Constants.screen_verify_identity}>
          {props => <VerifiyIdentityScreen {...props} />}
        </Stack.Screen>
        <Stack.Screen name={Constants.screen_edit_form_details}>
          {props => <EditFormDetailsScreen {...props}  {...data} />}
        </Stack.Screen>
        <Stack.Screen name={Constants.screen_edit_basic_details}>
          {props => <EditBasicDetailsScreen {...props} {...data} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigation;
