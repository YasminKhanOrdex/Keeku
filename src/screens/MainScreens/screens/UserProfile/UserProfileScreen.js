import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image, StatusBar, BackHandler, Alert } from 'react-native';
import Header from '../../../../sharedComponents/Header';
import * as Colors from '../../../../res/colors'
import GreenTick from './../../../../assets/images/icn_green_tick.svg';
import { RFValue } from 'react-native-responsive-fontsize';
import * as Constants from './../../../../res/strings';
import UserProfileTabbar from './UserProfileTabbar';
import * as ApiManager from '../../../../apiManager/ApiManager';
import moment from 'moment';
import ClaimProfileModal from '../../screens/UserProfile/ClaimProfileModal';
import CongratulationModal from '../../screens/UserProfile/CongratulationModal';
import PostReviewRestrictModal from '../../screens/PostReviewRestrictModal';
import Loader from '../../../../sharedComponents/Loader';
import Calendar from './../../../../assets/images/calendar.svg';
import UserIcon from './../../../../assets/images/icn_user.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as UserData from '../../../../localStorage/UserData';
import { Avatar } from 'react-native-paper';
export default function UserProfileScreen({ navigation, route }) {
    const [data, setData] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isVerified, setIsVerified] = useState(false)
    const [isVisible, setVisible] = useState(false);
    const [isVisibleRestrict, setVisibleRestrict] = useState(false);
    const [isCongratulationsVisible, setIsCongratulationsVisible] = useState(false);
    const [defaultProfileId, setIsDefaultProfileId] = useState('');
    const [isUserId, setUserId] = useState(false)
    const profile_id = route.params.id;
    const [profileImage, setProfileImage] = useState('');
    const [profileTagName, setProfileTagName] = useState('');
    const [profileName, setProfileName] = useState('');
    const isEditProfile = route.params.isEditProfile || false;
    const isMainProfile = route.params.mainProfile || false;
    let userData = [];

    useEffect(() => {
        if (isEditProfile) {
            getEditProfileData()
        } else {
            getData()
        }
        refresh()
        UserData.getUserData()
            .then(data => {
                // fetchRequiredData(data);
                if (data !== null) {
                    userData = data;

                    setIsVerified(data.verified)
                    setIsDefaultProfileId(data.defaultProfileId)
                    setUserId(data.userId)

                }

            });
    }, [])

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => navigation.goBack());
        return () => backHandler.remove();
    }, []);


    const refresh = () => {
        AsyncStorage.getItem(Constants.token).then((token) => {

            if (token) {
                if (token !== Constants.guestToken) {
                    setIsLoggedIn(true)
                } else {
                    setIsLoggedIn(false)
                }
            }

        })
    }


    const getData = () => {
        let params = {
            id: profile_id
        }
        var myHeaders = new Headers();
        myHeaders.append("Content-type", "application/json");
        ApiManager.profileDetail(params, myHeaders)
            .then(success => {
                let data = success.data;

                setProfileImage(data.profileImage)
                setProfileTagName(data.tagName);
                setProfileName(data.profileName)

                setData(data)

            })
            .catch(error => {
                console.log(error);
                Alert.alert("", "Profile Data not Found", [
                    { text: 'ok', onPress: () => navigation.goBack() },]);
            });
    }

    const getEditProfileData = () => {

        let params = {
            profileId: profile_id
        }
        var myHeaders = new Headers();
        myHeaders.append("Content-type", "application/json");
        ApiManager.fatchEditProfileDetails(params, myHeaders)
            .then(success => {
                let data = success.data;

                setData(data)

            })
            .catch(error => {
                console.log(error);
            });
    }

    const checkoutProfile = (name) => {
        let params = {
            name: name
        }
        var myHeaders = new Headers();
        myHeaders.append("Content-type", "application/json");
        ApiManager.getUserProfile(params, myHeaders)
            .then(success => {
                let data = success.data;
                navigation.push(Constants.screen_profile, { id: data.profileId })
            })
            .catch(error => {
                console.log(error);
            });
    }


    const claimProfile = () => {
        console.log("profileId === ", profile_id);
        console.log('userId === ', isUserId);
        claimHideModal();
        congratsShowModal();
        ApiManager.claimProfile(profile_id, isUserId)
            .then((data) => {
                console.log("claimed profile data === ", data);
                congratsShowModal();
                UserData.getUserData()
                    .then(user => {
                        if (user !== null) {
                            user.defaultProfileId = profile_id;
                            user.defaultProfileImage = profileImage;
                            user.defaultProfileName = profileName;
                            user.defaultProfileTagName = profileTagName;
                            user.firstLogIn = false;
                            console.log("============== ", user);
                            UserData.saveUserData(user);
                        }

                    });
            }).catch((error) => {
                console.log("claimed error === ", error);
            })
    }

    if (data !== null) {
        return (
            <View style={{ flex: 1, backgroundColor: Colors.color_white }}>
                <StatusBar backgroundColor="white" barStyle="dark-content" />
                <Header
                    back={() => navigation.goBack()}
                    openModal={null}
                    title={data?.profileName}
                />
                <SafeAreaView style={{ flex: 1 }}>
                    {/* ---------USER INFORMATION TOP VIEW---------  */}
                    <View style={{ padding: RFValue(12) }}>
                        <View style={styles.mainContainer}>
                            <View style={{ flexDirection: 'row', width: '70%' }}>
                                <View style={styles.ImageContainer}>
                                    {data?.profileImage ?
                                        <Image style={{ height: RFValue(65), width: RFValue(65), borderRadius: RFValue(65) / 2 }} source={{ uri: data?.profileImage }} />
                                        :
                                        <Avatar.Text size={RFValue(65)} style={{ backgroundColor: Colors.color_user_bg }} label={nameInitial(data?.profileName)} />
                                    }
                                </View>
                                <View style={styles.nameMainContainer}>
                                    <View style={styles.nameSubContainer}>
                                        <Text numberOfLines={1} style={styles.reviewUserName}>{data?.profileName}</Text>
                                        <GreenTick
                                            width={RFValue(13)}
                                            height={RFValue(13)}
                                            style={{ marginLeft: RFValue(6) }}
                                        />
                                    </View>
                                    <Text style={styles.reviewTagname}>@{data?.tagName}</Text>


                                    <Text style={styles.reviewTagname}>{data?.categories[0]?.subCategories[0]?.name || null}</Text>
                                </View>
                            </View>
                            {!isEditProfile && isLoggedIn && isVerified == true && <View style={{ marginTop: RFValue(2), width: '30%' }}>
                                <TouchableOpacity
                                    style={styles.btnStyle}
                                    onPress={createPageModalShow}
                                >
                                    <Text numberOfLines={1} style={styles.btnText}>{Constants.post_review}</Text>
                                </TouchableOpacity>

                                {data.claimedFlag == 'N' && defaultProfileId == null && isVerified == true && data.categories[0].name == "Individual" && isUserId != null && <TouchableOpacity
                                    style={[styles.btnStyle, { marginTop: RFValue(5) }]} onPress={claimShowModal}>
                                    <Text numberOfLines={1} style={styles.btnText}>claim</Text>
                                </TouchableOpacity>}
                            </View>}
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: RFValue(4) }}>
                            <Calendar
                                width={RFValue(13)}
                                height={RFValue(13)}
                                style={{ marginRight: RFValue(4) }}
                            />
                            <Text style={styles.textStyle}>{Constants.joined} {moment(data?.createdDate).format('MMMM YYYY')}</Text>
                        </View>
                        {data.ownedByUser == null &&
                            <Text style={styles.textStyle}>
                                Created By
                                <Text
                                    style={[styles.textStyle, { fontFamily: Constants.font_semibold }]}
                                    onPress={() => checkoutProfile(data.createdByUser)}
                                > @{data.createdByUser}</Text>
                            </Text>
                        }
                        {data.ownedByUser != null &&
                            <Text style={styles.textStyle}>
                                {/* {Constants.claimedBy} */}
                                {Constants.claimedBy}
                                <Text
                                    style={[styles.textStyle, { fontFamily: Constants.font_semibold }]}
                                    onPress={() => checkoutProfile(data.ownedByUser)}
                                > @{data.ownedByUser}</Text>
                            </Text>
                        }


                    </View>
                    {/* ------------------TAB BAR VIEW------------------ */}
                    {data && <UserProfileTabbar data={data} navigation={navigation} isEditProfile={isEditProfile} isMainProfile={isMainProfile} />}
                </SafeAreaView>

                <ClaimProfileModal visible={isVisible}
                    close={claimHideModal}
                    claim={claimProfile}
                    navigation={navigation}
                />

                <CongratulationModal visible={isCongratulationsVisible}
                    close={congratsHideModal} navigation={navigation} />
                <PostReviewRestrictModal visible={isVisibleRestrict}
                    createPageBtn={() => goToCreatePage()} />
            </View>
        )
    }
    else {
        return (
            <Loader />

        )
    }

    function nameInitial(name) {
        return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
    }

    function goToCreatePage() {
        setVisibleRestrict(false);
        navigation.navigate(Constants.tab_more, {
            screen: Constants.screen_basic_details,
            formDetailsScreen: Constants.screen_form_details_menu,
            tabComponent: Constants.tab_more,
            stackComponent: Constants.screen_menu_dashboard,
            callBack: () => { },
            userData: userData,
            setUserName: true
        })
    }

    function createPageModalShow() {
        if (defaultProfileId == null) {
            restrictShowModal();
        }
        else {
            navigation.navigate(Constants.screen_addReview, { item: data })
        }
    }
    function claimHideModal() {
        setVisible(false);
    }

    function claimShowModal() {
        setVisible(true);
    }

    function congratsHideModal() {
        setIsCongratulationsVisible(false);
    }

    function congratsShowModal() {
        setIsCongratulationsVisible(true);
    }
    function restrictHideModal() {
        setVisibleRestrict(false);
    }
    function restrictShowModal() {
        setVisibleRestrict(true);
    }


}


const styles = StyleSheet.create({
    reviewUserName: {
        fontSize: RFValue(16),
        fontFamily: Constants.font_regular,
        maxWidth: '85%'
    },
    mainContainer: {
        flexDirection: 'row',
        marginVertical: RFValue(10),
        justifyContent: 'space-between',
        width: '100%',
    },
    nameMainContainer: {
        paddingVertical: RFValue(2),
        marginLeft: RFValue(8),
        justifyContent: 'space-between',
        width: '68%',

    },
    nameSubContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    btnStyle: {
        backgroundColor: Colors.color_black,
        borderRadius: RFValue(6),
        width: '94%',
        height: RFValue(25),
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    ImageContainer: {
        height: RFValue(65),
        width: RFValue(65),
        borderRadius: RFValue(65) / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.color_user_bg
    },
    btnText: {
        textTransform: 'uppercase',
        fontSize: RFValue(10),
        maxWidth: '90%',
        color: Colors.color_white,
        fontFamily: Constants.font_regular,
    },
    reviewTagname: {
        fontSize: RFValue(12),
        fontFamily: Constants.font_regular,
        color: Colors.color_gray,
    },
    textStyle: {
        fontSize: RFValue(12),
        fontFamily: Constants.font_regular,
        color: Colors.color_gray,
    }
})
