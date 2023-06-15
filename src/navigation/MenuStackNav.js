import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MenuScreenDashboard from '../screens/MainScreens/screens/MenuScreenDashboard';
import CreatedPageScreen from '../screens/MainScreens/screens/MenuScreens/CreatedPageScreen';
import VerifyIdentityScreen from '../screens/MainScreens/screens/MenuScreens/VerifyIdentityScreen';
import TextVerificationScreen from '../screens/MainScreens/screens/MenuScreens/TextVerificationScreen';
import TextVerificationMobile from '../screens/MainScreens/screens/MenuScreens/TextVerificationMobile';
import CongratulationScreen from '../screens/MainScreens/screens/MenuScreens/CongratulationScreen';
import ManageYourPage from '../screens/MainScreens/screens/MenuScreens/ManageYourPage';
import FriendlyReminder from '../screens/MainScreens/screens/MenuScreens/FriendlyReminder';
import BasicDetailsScreen from '../screens/MainScreens/screens/createPageScreens/basicDetail';
import FormDetailsScreen from '../sharedComponents/FormDetails';
import * as Constants from '../res/strings';

const Stack = createStackNavigator();

const MenuNavigation = (data) => {
  return (
    <Stack.Navigator headerMode='none'>
      <Stack.Screen name={Constants.screen_menu_dashboard}>
        {props => <MenuScreenDashboard {...props} {...data} />}
      </Stack.Screen>
      <Stack.Screen name={Constants.screen_created_page}>
        {props => <CreatedPageScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name={Constants.screen_verify_identity}>
        {props => <VerifyIdentityScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name={Constants.screen_text_verification}>
        {props => <TextVerificationScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name={Constants.screen_text_verification_mobile}>
        {props => <TextVerificationMobile {...props} />}
      </Stack.Screen>
      <Stack.Screen name={Constants.screen_congratulation}
        options={{ gestureEnabled: false }}>
        {props => <CongratulationScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name={Constants.screen_manage_your_page}>
        {props => <ManageYourPage {...props} />}
      </Stack.Screen>
      <Stack.Screen name={Constants.screen_friendly_reminder}>
        {props => <FriendlyReminder {...props} />}
      </Stack.Screen>
      <Stack.Screen name={Constants.screen_basic_details}>
        {props => <BasicDetailsScreen {...props} {...data} />}
      </Stack.Screen>
      <Stack.Screen name={Constants.screen_form_details_menu}>
        {props => <FormDetailsScreen {...props} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default MenuNavigation;
