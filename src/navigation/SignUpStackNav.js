import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SignUp from '../screens/SignUpScreens/SignUp';
import ActivateAccount from '../screens/SignUpScreens/ActivateAccount';
import SetCredentials from '../screens/SignUpScreens/SetCredentials';
import * as Constants from '../res/strings';
import ReviewDetailScreen from '../screens/MainScreens/screens/SearchScreens/ReviewDetailScreen';
import AddResponse from '../screens/MainScreens/screens/SearchScreens/AddResponseScreen';
import AddReviewScreen from '../screens/MainScreens/screens/SearchScreens/AddReviewScreen';
import ViewMediaScreen from '../screens/MainScreens/screens/SearchScreens/ViewMediaScreen';
import NestedReviewScreen from '../screens/MainScreens/screens/SearchScreens/NestedReviewScreen';
import UserProfileScreen from '../screens/MainScreens/screens/UserProfile/UserProfileScreen';
import VerifiyIdentityScreen from '../screens/MainScreens/screens/MenuScreens/VerifyIdentityScreen';

const Stack = createStackNavigator();

const SignUpStackNav = (data) => {
  return (
    <NavigationContainer>
      <Stack.Navigator headerMode="none">
        <Stack.Screen name={Constants.screen_signup}>
          {props => <SignUp {...props} extraData={data} />}
        </Stack.Screen>
        <Stack.Screen name={Constants.screen_actiavte_account}>
          {props => <ActivateAccount {...props} extraData={data} />}
        </Stack.Screen>
        <Stack.Screen options={{ gestureEnabled: false }}
          name={Constants.screen_set_your_credentials}>
          {props => <SetCredentials {...props} extraData={data} />}
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

export default SignUpStackNav;
