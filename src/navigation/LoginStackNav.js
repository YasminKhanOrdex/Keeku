import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../screens/LoginScreens/Login';
import ForgotPassword from '../screens/LoginScreens/ForgotPassword';
import OpenEmailScreen from '../screens/LoginScreens/OpenEmailScreen';
import * as Constants from '../res/strings';
import ReviewDetailScreen from '../screens/MainScreens/screens/SearchScreens/ReviewDetailScreen';
import AddResponse from '../screens/MainScreens/screens/SearchScreens/AddResponseScreen';
import AddReviewScreen from '../screens/MainScreens/screens/SearchScreens/AddReviewScreen';
import ViewMediaScreen from '../screens/MainScreens/screens/SearchScreens/ViewMediaScreen';
import NestedReviewScreen from '../screens/MainScreens/screens/SearchScreens/NestedReviewScreen';
import UserProfileScreen from '../screens/MainScreens/screens/UserProfile/UserProfileScreen';
import VerifiyIdentityScreen from '../screens/MainScreens/screens/MenuScreens/VerifyIdentityScreen';

const Stack = createStackNavigator();

const LoginStackNav = (data) => {
  return (
    <NavigationContainer>
      <Stack.Navigator headerMode="none">

        <Stack.Screen name={Constants.screen_login}>
          {props => <Login {...props} extraData={data} />}
        </Stack.Screen>

        <Stack.Screen name={Constants.screen_forgot_password}>
          {props => <ForgotPassword {...props} extraData={data} />}
        </Stack.Screen>

        <Stack.Screen name={Constants.screen_open_email}>
          {props => <OpenEmailScreen {...props} extraData={data} />}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default LoginStackNav;
