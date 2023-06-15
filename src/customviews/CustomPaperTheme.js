import { configureFonts, DefaultTheme } from 'react-native-paper';
import * as Colors from '../res/colors';
import * as Constants from '../res/strings';

const fontConfig = {
  ios: {
    regular: {
      fontFamily: Constants.font_regular,
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: Constants.font_semibold,
      fontWeight: 'normal',
    },
    light: {
      fontFamily: Constants.font_light,
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: Constants.font_regular,
      fontWeight: 'normal',
    },
  },
  android: {
    regular: {
      fontFamily: Constants.font_regular,
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: Constants.font_semibold,
      fontWeight: 'normal',
    },
    light: {
      fontFamily: Constants.font_light,
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: Constants.font_regular,
      fontWeight: 'normal',
    },
  },
};

export const theme = {
  ...DefaultTheme,
  fonts: configureFonts(fontConfig),
  roundness: 5,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.color_black,
    //accent: '#f1c40f',
  },
};
