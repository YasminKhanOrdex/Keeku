import 'react-native-gesture-handler';
import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DashboardScreen from '../screens/MainScreens/screens/DashboardScreen';
import BasicDetailScreen from '../screens/MainScreens/screens/createPageScreens/basicDetail';
import FormDetailsScreen from '../sharedComponents/FormDetails';
import * as Constants from '../res/strings';

const Stack = createStackNavigator();

const DashboardNavigation = (data) => {
  return (
    <Stack.Navigator headerMode='none'>
      <Stack.Screen name={Constants.screen_dashboard}>
        {props => <DashboardScreen {...props} {...data} />}
      </Stack.Screen>
      <Stack.Screen name={Constants.screen_basic_details}>
        {props => <BasicDetailScreen {...props} {...data} />}
      </Stack.Screen>
      <Stack.Screen name={Constants.screen_form_details_dashboard}>
        {props => <FormDetailsScreen {...props} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default DashboardNavigation;
