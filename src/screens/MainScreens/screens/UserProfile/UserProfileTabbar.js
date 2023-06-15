import React, { useState } from 'react'
import { Dimensions, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import { SceneMap, TabView, TabBar } from 'react-native-tab-view';
import { RFValue } from 'react-native-responsive-fontsize';
import * as Colors from '../../../../res/colors';
import * as Constants from '../../../../res/strings';
import InformationComponent from './InformationComponent';
import MyReviewsComponent from './MyReviewsComponent';
import MyContributionComponent from './MyContributionComponent';

export default function UserProfileTabbar(props) {
    const [index, setIndex] = useState(0);
    const layout = useWindowDimensions();

    const isEditProfile = props.isEditProfile || false;
    const isMainProfile = props.isMainProfile || false;
    const navigation = props.navigation

    const [routes] = useState([
        {
            key: 'Information',
            title: Constants.Information,
        },
        {
            key: 'MyReviews',
            title: Constants.MyReviews,
        },
        {
            key: 'MyContribution',
            title: Constants.MyContribution,
        },
    ]);

    const renderScene = SceneMap({
        Information: () => <InformationComponent data={props.data} navigation={navigation} isMainProfile={isMainProfile} isEditProfile={isEditProfile} />,
        MyReviews: () => <MyReviewsComponent data={props.data} />,
        MyContribution: () => <MyContributionComponent data={props.data} />,
    });

    return (
        <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
            renderTabBar={(props) => (
                <TabBar
                    {...props}
                    renderLabel={({ route, focused }) => (
                        <Text
                            style={[styles.tabBarLabelStyle,
                            {
                                color: focused ? Colors.color_black : Colors.color_gray,
                            }]}>
                            {route.title}
                        </Text>
                    )}
                    style={styles.tabBarStyle}
                    indicatorStyle={styles.tabBarIndicatorStyle}
                />
            )}
        />
    )
}

const styles = StyleSheet.create({
    tabBarStyle: {
        backgroundColor: 'white',
        shadowColor: 'white',
        shadowOpacity: 0,
        shadowRadius: 0,
        shadowOffset: {
            height: 0,
            width: 0,
        },
        borderBottomWidth: 1,
        borderBottomColor: Colors.color_user_bg
    },
    tabBarIndicatorStyle: {
        backgroundColor: 'black',
    },
    tabBarLabelStyle: {
        color: 'white',
        textTransform: 'capitalize',
        fontFamily: Constants.font_regular,
        fontSize: RFValue(12.5),
        textAlign: 'center'
    }
});