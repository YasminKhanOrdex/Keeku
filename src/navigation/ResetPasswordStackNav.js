import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import 'react-native-gesture-handler';
import * as Constants from '../res/strings';
import ResetPassword from '../screens/LoginScreens/ResetPassword';
import ThankYouScreen from '../screens/LoginScreens/ThankYouScreen';

const Stack = createStackNavigator();

const ResetPasswordStackNav = (data) => {
  return (
    <NavigationContainer>
      <Stack.Navigator headerMode="none">
        
        <Stack.Screen name={Constants.screen_reset_password}>
          {props => <ResetPassword {...props} extraData={data} />}
        </Stack.Screen>

        <Stack.Screen name={Constants.screen_thank_you}>
          {props => <ThankYouScreen {...props} extraData={data} />}
        </Stack.Screen>

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default ResetPasswordStackNav;
