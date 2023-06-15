import React from 'react'
import { StyleSheet, Text, View, ScrollView, ImageBackground, TouchableOpacity } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize';
import * as Colors from '../res/colors'
import * as Constants from '../res/strings'

export default function ImageDisplayComponents(props) {
    const media = props.media;
    const playBtn = require('../assets/images/playbtn.png')

    if (media.length > 0) {
        return (
            <View style={{ flex: 1 }}>
                <ScrollView horizontal={true}>
                    {media.map((item, index) => {
                        const tmpArr = item.split('.')
                        if (index < 2) {
                            return (
                                <View
                                    style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                    key={index.toString()}
                                >
                                    <ImageBackground
                                        source={
                                            tmpArr[tmpArr.length - 1] == "ism/manifest" ? playBtn : { uri: item }
                                        }
                                        resizeMode={'contain'}
                                        imageStyle={{ borderRadius: 6, aspectRatio: 1 / 1, height: undefined }}
                                        style={media.length == 1 ? styles.imageStyle : styles.imageStyleTwo}>
                                        {index == 0 &&
                                            <TouchableOpacity style={{
                                                flex: 1,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                                onPress={() => {
                                                    props.navigation.navigate(Constants.screen_view_media, { media: media, index: 0 })
                                                }}>

                                            </TouchableOpacity>
                                        }

                                        {index == 1 && (
                                            <TouchableOpacity
                                                style={[{
                                                    flex: 1,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: RFValue(10),
                                                },
                                                media.length > 2 && { backgroundColor: '#000000bb' }
                                                ]}
                                                onPress={() => {
                                                    props.navigation.navigate(Constants.screen_view_media, { media: media, index: 1 })
                                                }}>
                                                {
                                                    media.length > 2
                                                    &&
                                                    <>
                                                        <Text style={styles.viewMoreText}>{Constants.view_more}</Text>
                                                        <Text style={[styles.viewMoreText, { textAlign: 'center' }]}>
                                                            {media.length - 1}
                                                        </Text>
                                                    </>
                                                }
                                            </TouchableOpacity>
                                        )}
                                    </ImageBackground>
                                </View >
                            )
                        }
                    })}
                </ScrollView >
            </View >
        );
    } else{ return( <View></View> ) }
}

const styles = StyleSheet.create({
    imageStyleTwo: {
        marginRight: RFValue(3),
        width: RFValue(125),
        height: undefined,
        aspectRatio: 1 / 1,
        backgroundColor: Colors.color_black
    },
    viewMoreText: {
        color: Colors.color_white,
        fontFamily: Constants.font_regular,
        fontSize: RFValue(15),
    },
    imageStyle: {
        width: RFValue(266),
        height: RFValue(152),
        backgroundColor: Colors.color_black
    },
})