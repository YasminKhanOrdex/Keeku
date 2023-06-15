import React, { useEffect, useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import ReviewComponents from '../../../../sharedComponents/ReviewComponents';
import * as ApiManager from '../../../../apiManager/ApiManager'
import Nocontribution from './../../../../assets/images/no_contribution.svg';
import { RFValue } from 'react-native-responsive-fontsize';
import * as Constants from '../../../../res/strings';
import * as Colors from '../../../../res/colors';
import { ActivityIndicator } from 'react-native-paper';
import Loader from '../../../../sharedComponents/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MyReviewsComponent(props) {
    const [review, setReview] = useState([])
    const [loading, setLoading] = useState(true)
    const [counter, setCounter] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const data = props.data

    useEffect(() => {
        { review.length == 0 && getData() }
        refresh()
    }, [])

    const refresh = () => {
        AsyncStorage.getItem(Constants.token).then((token) => {
            if (token) {
                if (token !== Constants.guestToken) {
                    setIsLoggedIn(true)
                } else {
                    setIsLoggedIn(false)
                }
            }
        });
    }

    const getData = () => {
        let params = {
            id: data.profileId,
            start: counter,
            end: 10
        }
        var myHeaders = new Headers();
        myHeaders.append("Content-type", "application/json");
        ApiManager.getProfileReview(params, myHeaders)
            .then(success => {
                console.log("Success >> ", success);
                setLoading(false)
                let data = success.data;
                if (data.length == 0) {
                    setHasMore(false)
                } else {
                    setHasMore(true)
                }
                setReview([...review, ...data])
                setCounter(counter + 1)
            })
            .catch(error => {
                setLoading(false)
                console.log(error);
            });
    }

    if (loading) {
        return (
            <Loader />
        )
    }

    if (!loading && review?.length == 0) {
        return (
            <View style={styles.mainContainerStyle}>
                <Nocontribution
                    width={RFValue(80)}
                    height={RFValue(80)}
                    style={{ marginBottom: RFValue(15) }}
                />
                <Text style={styles.textStyles}>{Constants.no_review}</Text>
                <Text style={styles.subInfoStyle}>{Constants.no_review_msg + data.profileName}.</Text>
            </View>
        )
    }

    return (
        <FlatList
            style={{ flex: 1 }}
            data={review}
            renderItem={({ item, index }) => <ReviewComponents isLoggedIn={isLoggedIn} item={item} reviewUsername={data.tagName} />}
            keyExtractor={(item, index) => index.toString()}
            onEndReachedThreshold={0.7}
            onEndReached={() => hasMore ? getData() : null}
            ListFooterComponent={() => {
                return (
                    <View>
                        {hasMore &&
                            <ActivityIndicator color={Colors.color_black} style={{ alignSelf: 'center', marginVertical: RFValue(10) }} />
                        }
                    </View>
                )
            }}
        />
    )
}

const styles = StyleSheet.create({
    mainContainerStyle: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: RFValue(10)
    },
    textStyles: {
        fontSize: RFValue(18),
        color: Colors.color_black,
        fontFamily: Constants.font_regular
    },
    subInfoStyle: {
        fontSize: RFValue(14),
        color: Colors.color_gray,
        fontFamily: Constants.font_regular,
        textAlign: 'center'
    }

})