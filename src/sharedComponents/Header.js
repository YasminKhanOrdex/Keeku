import React from 'react'
import { StatusBar, StyleSheet, Text, TouchableOpacity, View, SafeAreaView } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize';
import BackWhiteArrow from '../assets/images/back_white_arrow.svg';
import MoreOption from '../assets/images/icn_menu_white.svg';
import * as Colors from '../res/colors';
import * as Constants from '../res/strings';

export default function Header(props) {
    return (
        <SafeAreaView style={{ backgroundColor: 'black', }}>
            <StatusBar barStyle="light-content" backgroundColor="black" />
            <View style={styles.mainHeaderView}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={props.back} style={styles.CrossIconContainer}>
                        <View style={{ padding: RFValue(15) }}>
                            <BackWhiteArrow width={RFValue(12)} height={RFValue(20)} />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.hederTitle}>{props.title}</Text>
                </View>
                {props.MoreOption && <TouchableOpacity style={{ marginHorizontal: RFValue(15) }} onPress={props.openModal}>
                    <MoreOption width={RFValue(20)} height={RFValue(20)} />
                </TouchableOpacity>}
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    mainHeaderView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: RFValue(0),
    },
    CrossIconContainer: {
        top: 0,
        alignItems: 'flex-end',
        marginHorizontal: RFValue(0),
    },
    hederTitle: {
        color: Colors.color_user_bg,
        fontSize: RFValue(20),
        fontFamily: Constants.font_regular,
    }
})
