import React, { useCallback, useEffect, useRef } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, BackHandler } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { RFValue } from 'react-native-responsive-fontsize';
import WebView from 'react-native-webview';
import * as Colors from '../../../../res/colors';
import BackArrow from './../../../../assets/images/back_arrow.svg';

export default function ViewMediaScreen(props) {

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => props.navigation.goBack()
    );
    return () => backHandler.remove();
  }, []);

  const vidioHtml = (url) => {
    return `
        <html lang="en-US">
        <head>
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
            <link href="https://amp.azure.net/libs/amp/latest/skins/amp-default/azuremediaplayer.min.css" rel="stylesheet">
            <script src="https://amp.azure.net/libs/amp/latest/azuremediaplayer.min.js"></script>
        </head>
        <body style="display: flex; align-items: center;">
            <video style="width: 100%;" id="azuremediaplayer" class="azuremediaplayer amp-default-skin amp-big-play-centered" controls width="auto" height="200" poster="" data-setup='{}' tabindex="0">
                <source src="${url.replace('http', 'https')}" type="application/vnd.ms-sstr+xml" />
            <p class="amp-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that supports HTML5 video</p>
            </video>
        </body>
        </html>
      `
  }

  const RenderItemFunction = ({ item }) => {
    const tmpArr = item.split('.')
    props.route.params.index && slider.current !== undefined && slider.current?.goToSlide(props.route.params.index, true)
    return (
      <View style={styles.ImgMain}>
        {tmpArr[tmpArr.length - 1] == "ism/manifest"
          ?
          <WebView
            source={{ html: vidioHtml(item) }}
            scrollEnabled={false}
          />
          :
          <Image
            source={{ uri: item }}
            resizeMode={'contain'}
            style={{ width: 'auto', height: undefined, aspectRatio: 1 }}
          />
        }
      </View>
    );
  }

  const slider = useRef();

  return (
    <SafeAreaView style={styles.modelStyle}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <View>
        <TouchableOpacity onPress={() => props.navigation.goBack()} style={styles.CrossIconContainer}>
          <View style={{ padding: RFValue(15) }}>
            <BackArrow width={RFValue(20)} height={RFValue(20)} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.viewPagerContainer}>
        <AppIntroSlider
          activeDotStyle={{ backgroundColor: Colors.color_black }}
          renderItem={({ item, index }) => <RenderItemFunction item={item} />}
          data={props.route.params.media}
          showDoneButton={false}
          showNextButton={false}
          ref={slider}
        >
        </AppIntroSlider>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modelStyle: {
    backgroundColor: Colors.color_white,
    flex: 1
  },
  viewPagerContainer: {
    flex: 1,
    marginHorizontal: RFValue(16),
    justifyContent: 'center',
  },
  ImgMain: {
    justifyContent: 'center',
    flex: 1,
  },
  CrossIconContainer: {
    top: 0,
    marginHorizontal: RFValue(0),
  },
  BackIconContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    marginHorizontal: RFValue(16),
    marginVertical: RFValue(15)
  }
});
