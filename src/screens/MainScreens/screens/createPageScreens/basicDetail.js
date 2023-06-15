import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image, ScrollView, BackHandler, Dimensions, Alert, Platform } from 'react-native';
import { Button, TextInput, RadioButton, Modal } from 'react-native-paper';
import { RFValue } from 'react-native-responsive-fontsize';
import BackMenuBar from '../../../../sharedComponents/BackMenuBar';
import Loader from '../../../../sharedComponents/Loader';
import * as Colors from '../../../../res/colors';
import UserIcon from '../../../../assets/images/icn_user.svg';
import Tick from '../../../../assets/images/tick.svg';
import CameraIcon from '../../../../assets/images/icn_camera.svg';
import globalStyles from '../../../../res/styles';
import * as Constants from '../../../../res/strings';
import * as ApiManager from '../../../../apiManager/ApiManager';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import SelectionModal from '../MenuScreens/ProfilephotoModel';
import Utils from '../../../../utils/Utils';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';

const profileDimension = RFValue(90);
const iconSize = RFValue(27);

let create_page_json_payload = {
    imageFile: null,
    profileDTO: {
        id: null,
        profileId: null,
        profileName: "",
        claimedFlag: "N",
        profileImage: "",
        claimedUserId: null,
        categories: [],
        createdDate: null,
        details: null,
        createdBy: "",
        tagName: "",
        defaultProfile: false,
        officename: "",
        officailname: "",
        iconFilepath: "",
        divisionname: "",
        level: ""
    }
}

export default class BasicDetail extends Component {
    constructor(props) {
        super(props);
        this.params = this.props.route.params;
        this.onBackPress = this.onBackPress.bind(this);
        this.showSkipButton = this.params.stackComponent === Constants.screen_congratulation;
        this.userData = this.params.userData;
        this.defaultPageName = this.params.userData.firstName + ' ' + this.params.userData.lastName;
        this.setUserName = !!this.params?.setUserName;
        this.defaultUserName = this.params?.userData?.userName;
        this.firstLogIn = this.params.userData.firstLogIn;
        this.state = {
            isLoaderVisible: false,
            pageName: '',
            userName: '',
            profileImage: '',
            categoryData: [],
            subCategoryData: [],
            isSelectionModalVisible: false,
            isCategorySelected: false,
            id: 0,
            subCategoryIds: [],
            height: 0,
        };

        this.hideBottomBar();
    }

    getSelectedSubCategory(subCategories) {
        let selectedSubcategoryIds = [];
        selectedSubcategoryIds = subCategories?.reduce((obj, item) => {
            if (item.isSelected) {
                return obj = [...obj, item.subCategoryId]
            }
            return obj
        }, selectedSubcategoryIds);
        return selectedSubcategoryIds
    }

    renderCategory() {
        let data = this.state.categoryData;
        return data.map((item, key) => {
            let selectedTextColor = item.isSelected ? Colors.color_black : Colors.color_gray;
            return (
                <TouchableOpacity style={styles.categoryContainer} onPress={() => {
                    this.onSelectCategory(item)
                }}>
                    {!!item.iconPath ?
                        <Image resizeMode='contain' style={{ width: RFValue(20), height: RFValue(20) }} source={{ uri: item.iconPath }} />
                        :
                        <Image resizeMode='contain' style={{ width: RFValue(20), height: RFValue(20) }} source={require('./../../../../assets/images/icon_logo.png')} />
                    }
                    <Text style={[{ ...styles.categoryText, color: selectedTextColor }]}>{item.name}</Text>
                    {item.isSelected ? this.renderSelectedRadioButton() : this.renderNotSelectedRadioButton()}
                </TouchableOpacity>
            )
        })
    }

    renderSubcategory() {
        let data = this.state.subCategoryData;
        return data.map((item, key) => {
            let selectedTextColor = item.isSelected ? Colors.color_black : Colors.color_gray;
            return (
                <TouchableOpacity style={styles.categoryContainer} onPress={() => {
                    this.onSelectSubCategory(item)
                }}>
                    {!!item.iconPath ?
                        <Image resizeMode='contain' style={{ width: RFValue(20), height: RFValue(20) }} source={{ uri: item.iconPath }} />
                        :
                        <Image resizeMode='contain' style={{ width: RFValue(20), height: RFValue(20) }} source={require('./../../../../assets/images/icon_logo.png')} />
                    }
                    <Text style={[{ ...styles.categoryText, color: selectedTextColor }]}>{item.name}</Text>
                    {item.isSelected ? this.renderSelectedCheckboxButton() : this.renderNotSelectedCheckboxButton()}
                </TouchableOpacity>
            )
        })
    }

    onSelectCategory(item) {
        let selectedId = item.id;
        let updatedData = this.state.categoryData.map((item) => {
            if (item.id.toString() === selectedId.toString()) {
                item.isSelected = true;
            } else {
                item.isSelected = false;
            }
            return item;
        });
        let subCategoryData = item.subCategories;
        subCategoryData.map((item) => {
            item.isSelected = false;
        });
        this.setState({
            categoryData: updatedData,
            subCategoryData,
            isCategorySelected: true,
            id: selectedId,
            subCategoryIds: []
        })
    }

    onSelectSubCategory(item) {
        let selectedId = item.subCategoryId;
        if (!item.fetchAllSectionsFromAPI) {
            this.fetchSubCategoryData(selectedId);
        }
        else {
            let updatedData = this.state.subCategoryData.map((item) => {
                if (item.subCategoryId.toString() === selectedId.toString()) {
                    item.isSelected = !item.isSelected;
                }
                return item;
            });
            this.setState({
                subCategoryData: updatedData,
                selectedSubcategoryIds: this.getSelectedSubCategory(updatedData)
            })
        }

    }

    componentDidMount() {
        this.getCategoryData();
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            this.hideBottomBar();
            this.params = this.props.route.params;
            this.setUserName = !!this.props.route.params?.setUserName;
            this.defaultUserName = this.props.route.params?.userData?.userName;
            if (this.setUserName) {
                this.setState({ userName: this.defaultUserName });
            }
        });

        BackHandler.addEventListener('hardwareBackPress', () => {return true});
    }

    componentWillUnmount() {
        if (this.params && this.params.callBack) {
            this.params.callBack();
        }
        this.props.route.params.userData = {};
        delete this.props.route.params.setUserName;

        this._unsubscribe();
        BackHandler.removeEventListener('hardwareBackPress', () => {return});
    }

    getCategoryData() {
        const onSuccess = (response) => {
            this.hideIndicator();
            let categoryData = response.data;
            let categoryArray = this.firstLogIn ? this.getIndividualCategoryData(categoryData) : categoryData;
            const sortedData = categoryArray.sort((a, b) => a.displayOrder >= b.displayOrder);
            sortedData.map((item) => {
                item.isSelected = false;
            })
            this.setState({
                categoryData: sortedData
            })
        }

        const onFailure = (message) => {
            this.hideIndicator();
        };

        NetInfo.fetch().then(state => {
            if (state.isConnected) {
                this.showIndicator();
                var myHeaders = new Headers();
                myHeaders.append("Content-type", "application/json");
                ApiManager.fetchCategoryDetails(myHeaders)
                    .then(onSuccess)
                    .catch(onFailure);
            } else {
                Alert.alert(Constants.network, Constants.please_check_internet);
            }
        });
    }

    getIndividualCategoryData(categoryArray) {
        let individualCategory = [];
        for (i = 0; i < categoryArray.length; i++) {
            // I'm looking for the index i, when the condition is true
            let item = categoryArray[i];
            if (item.name === 'Individual') {
                individualCategory.push(item);
                break;
            }
        }
        return individualCategory;
    }

    fetchSubCategoryData(subCategoryId) {
        const onSuccess = (response) => {
            this.hideIndicator();
            if (response.success === 0) {
                this.attachSubSections(response.data, subCategoryId);
            }
        };

        const onFailure = (message) => {
            this.hideIndicator();
        };

        NetInfo.fetch().then(state => {
            if (state.isConnected) {
                this.showIndicator();
                var myHeaders = new Headers();
                myHeaders.append("Content-type", "application/json");
                AsyncStorage.getItem(Constants.token)
                    .then((token) => {
                        myHeaders.append("Authorization", "Bearer " + token);
                        ApiManager.fetchSections(subCategoryId, myHeaders)
                            .then(onSuccess)
                            .catch(onFailure);
                    })
            } else {
                Alert.alert(Constants.network, Constants.please_check_internet);
            }
        });
    }

    attachSubSections(subCategorySections, subCategoryId) {
        let subCategoryArray = this.state.subCategoryData;
        subCategoryArray.map((item) => {
            if (item.subCategoryId === subCategoryId) {
                item.sections = subCategorySections.subData;
                item.isSelected = !item.isSelected
                item.fetchAllSectionsFromAPI = true;
            }
        });

        this.setState({
            subCategoryData: subCategoryArray,
            selectedSubcategoryIds: this.getSelectedSubCategory(subCategoryArray)
        })
    }

    render() {
        let ringColor = Colors.color_green;
        let flexValue = this.showSkipButton ? 0.65 : 1;
        let defaultPageName = this.firstLogIn ? this.defaultPageName : '';
        let defaultUserName = this.firstLogIn || this.setUserName ? this.defaultUserName : '';
        return (
            <View style={styles.mainContainer}>
                {this.state.isLoaderVisible && <Loader />}
                <BackMenuBar title={Constants.basic_details}
                    action={this.onBackPress} />
                <ScrollView style={{ flex: 1, marginBottom: RFValue(70) }}>
                    <TouchableOpacity style={{ alignItems: "center" }} onPress={() => { this.showModal() }}>
                        <View style={[{ ...styles.profileImageContainer, borderColor: ringColor }]}>
                            {this.state.profileImage ? <Image resizeMode='cover' style={styles.profileImageStyle} source={{ uri: this.state.profileImage }} /> : <UserIcon height={RFValue(55)} width={RFValue(55)} />}
                        </View>
                        <TouchableOpacity activeOpacity={0.7} style={styles.cameraIconStyle}
                            onPress={() => {
                                this.showModal()
                            }}
                        >
                            <CameraIcon width={iconSize} height={iconSize} />
                        </TouchableOpacity>
                    </TouchableOpacity>

                    <View style={{ marginHorizontal: RFValue(16), marginBottom: RFValue(16) }}>
                        <TextInput
                            ref={input => {
                                this.pageNameTextInput = input;
                            }}
                            onLayout={(event) => {
                                this.state.height = event.nativeEvent.layout.height;
                            }}
                            style={[{ ...globalStyles.textInputStyle }]}
                            selectionColor={Colors.color_black}
                            label={"Page Name*"}
                            mode="outlined"
                            dense={true}
                            defaultValue={defaultPageName}
                            returnKeyType="next"
                            onSubmitEditing={() => {
                                this.userNameTextInput.focus();
                            }}
                            disabled={this.firstLogIn}
                            blurOnSubmit={false}
                            onChangeText={text => {
                                this.state.pageName = text.trim();
                            }}
                        />
                        <TextInput
                            ref={input => {
                                this.userNameTextInput = input;
                            }}
                            style={[{ ...globalStyles.textInputStyle, marginTop: RFValue(12) }]}
                            selectionColor={Colors.color_black}
                            label={"Username*"}
                            mode="outlined"
                            dense={true}
                            disabled={this.firstLogIn || this.setUserName}
                            key={defaultUserName}
                            defaultValue={defaultUserName}
                            returnKeyType="done"
                            textContentType="name"
                            onChangeText={text => {
                                this.state.userName = text.trim();
                            }}
                            onBlur={() => { this.checkUsername(false) }}
                        />
                    </View>
                    <View style={styles.categoryView}>
                        <Text style={styles.text}>
                            Select your category
                        </Text>
                        <View style={{ marginTop: RFValue(10) }}>
                            {this.renderCategory()}
                        </View>
                    </View>
                    {this.state.subCategoryData.length > 0 && <View style={styles.categoryView}>
                        <Text style={styles.text}>
                            Select your subcategory
                        </Text>
                        <View style={{ marginTop: RFValue(20) }}>
                            {this.renderSubcategory()}
                        </View>
                    </View>}
                </ScrollView>

                <View style={styles.bottomContainer}>
                    {this.showSkipButton && <TouchableOpacity activeOpacity={0.8} style={styles.btnSkipStyle} onPress={() => this.skipBtn()}>
                        <Text style={styles.btnSkipTextStyle}>{Constants.skip}</Text>
                    </TouchableOpacity>}

                    <TouchableOpacity activeOpacity={0.8} style={[{ ...styles.btnNextStyle, flex: flexValue }]} onPress={() => { this.validateFields() }}>
                        <Text style={styles.btnNextTextStyle}>{Constants.next}</Text>
                    </TouchableOpacity>
                </View>

                <SelectionModal
                    visible={this.state.isSelectionModalVisible}
                    close={this.hideModal.bind(this)}
                    openGallery={this.openGallery.bind(this)}
                    openCamera={this.openCamera.bind(this)}
                    removePhoto={this.removePhoto.bind(this)}
                    showRemoveOption={this.state.profileImage ? true : false}
                />
            </View>
        )
    }
    skipBtn = () => {
        this.props.navigation.navigate(Constants.screen_dashboard);
    }
    validateFields = () => {
        if (!this.firstLogIn && this.state.pageName.length < 1) {
            Alert.alert(Constants.invalid, Constants.pagename_required);
        } else if (!this.firstLogIn && this.state.userName.length < 1) {
            Alert.alert(Constants.invalid, Constants.username_is_required);
        } else if (!this.firstLogIn && Utils.validateField(this.state.userName, Constants.regex_username)) {
            Alert.alert(Constants.invalid, Constants.invalid_username_instruction);
        } else if (!this.state.isCategorySelected) {
            Alert.alert(Constants.invalid, Constants.select_category);
        } else if (!this.firstLogIn) {
            this.checkUsername(true);
        } else {
            this.collectSelectedData();
        }
    }

    collectSelectedData() {
        let jsonPayload = this.getCreatePageJSONPayload();

        this.gotoFormDetails(jsonPayload);
    }

    gotoFormDetails(jsonPayload) {
        this.setState({ finalJson: jsonPayload });
        let totalSections = this.getTotalSectionCount(jsonPayload.profileDTO.categories[0]);

        console.log("dataToPass", totalSections);
        this.props.navigation.navigate(this.params.formDetailsScreen, {
            jsonPayload,
            sectionNumber: 0,
            totalSections,
            componentHeight: this.state.height,
            formDetailsScreen: this.params.formDetailsScreen
        });
    }

    getCreatePageJSONPayload() {
        /* Add First login username and page name */
        if (this.firstLogIn) {
            this.state.userName = this.defaultUserName;
            this.state.pageName = this.defaultPageName;
        }
        /* Set Required Basic detail */
        create_page_json_payload.profileDTO.tagName = this.state.userName;
        create_page_json_payload.profileDTO.profileName = this.state.pageName;
        create_page_json_payload.profileDTO.createdBy = this.userData.userId;
        create_page_json_payload.profileDTO.defaultProfile = this.userData.defaultProfileId ? false : true;

        /* Set slected category */
        create_page_json_payload.profileDTO.categories = [];

        let categoryId = this.state.id;
        let categoryArray = this.state.categoryData;
        let selectedCategoryData = categoryArray.find((category) => {
            return category.id === categoryId
        })

        create_page_json_payload.profileDTO.categories.push(selectedCategoryData);

        /* Set Selected Subcategory */
        create_page_json_payload.profileDTO.categories[0].subCategories = [];

        let subCategoryData = this.state.subCategoryData;
        subCategoryData.forEach((element) => {
            if (element.isSelected) {
                create_page_json_payload.profileDTO.categories[0].subCategories.push(element);
            }
        })

        return create_page_json_payload;
    }

    getTotalSectionCount(data) {
        let totalSections = data.sections.length;
        let subCategoriesArray = data.subCategories;
        subCategoriesArray.forEach(subCategory => {
            let subCategorySectionCount = subCategory.sections ? subCategory.sections.length : 0;
            console.log("subCategory", subCategorySectionCount);
            totalSections += subCategorySectionCount;
        });
        console.log("totalSections", totalSections);
        return totalSections;
    }

    checkUsername = (onButtonClick) => {
        let userName = this.state.userName;
        if (userName.length > 0 && !Utils.validateField(userName, Constants.regex_username)) {
            const onSuccess = (data) => {
                this.hideIndicator();
                if (data.success === 1) {
                    Alert.alert(Constants.invalid, Constants.username_already_exist);
                } else if (onButtonClick && data.success === 0) {
                    this.collectSelectedData();
                }
            };

            const onFailure = (message) => {
                this.hideIndicator();
            };

            NetInfo.fetch().then(state => {
                if (state.isConnected) {
                    this.showIndicator();
                    ApiManager.verifyUsername(userName)
                        .then(onSuccess)
                        .catch(onFailure);
                } else {
                    Alert.alert(Constants.network, Constants.please_check_internet);
                }
            });
        }
    }

    onBackPress() {
        //this.props.navigation.goBack();
        this.showBottomBar();
        this.props.navigation.navigate(this.props.route.params.tabComponent, { screen: this.props.route.params.stackComponent })
    }

    showIndicator = () => {
        this.setState({
            isLoaderVisible: true
        })
    };

    hideIndicator = () => {
        this.setState({
            isLoaderVisible: false
        })
    };

    openGallery = () => {
        this.hideModal();
        setTimeout(() => {
            launchImageLibrary({
                selectionLimit: 1
            }, response => {
                this.onResult(response)
            });
        }, 100);
    }

    openCamera = () => {
        this.hideModal();
        if (Platform.OS === 'ios') {
            this.launchCamera();
        } else {
            this.checkCameraPermission();
        }
    }

    launchCamera = () => {
        setTimeout(() => {
            launchCamera({
                saveToPhotos: false,
            }, response => {
                this.onResult(response)
            });
        }, 100);
    }

    checkCameraPermission = () => {
        let permission_request = PERMISSIONS.ANDROID.CAMERA;
        return check(permission_request)
            .then((result) => {
                if (result === RESULTS.DENIED) {
                    this.requestCameraPermission(permission_request);
                } else if (result === RESULTS.GRANTED) {
                    this.launchCamera();
                } else if (result == RESULTS.BLOCKED) {
                    Alert.alert(Constants.camera_permission, Constants.camera_instruction);
                }
            })
            .catch((error) => {
                console.log(error.message);
            });
    }

    requestCameraPermission = (permission_request) => {
        request(permission_request).then((result) => {
            if (result === RESULTS.GRANTED) {
                this.launchCamera();
            } else {
                Alert.alert(Constants.camera_permission, Constants.camera_instruction);
            }
        })
    }

    removePhoto = () => {
        this.setState({
            isSelectionModalVisible: false,
            profileImage: ''
        });
        create_page_json_payload.imageFile = null;
    }

    onResult = (response) => {
        if (response.didCancel) {
            console.log('User cancelled image picker');
        } else if (response.errorCode) {
            console.log('ImagePicker Error: ', response.errorMessage);
        } else {
            let imageData = response.assets[0];
            let profileImage = imageData.uri;
            this.setState({
                profileImage
            })
            var fileJson = {};
            fileJson.type = imageData.type;
            fileJson.uri = imageData.uri;
            fileJson.name = imageData.fileName;
            create_page_json_payload.imageFile = fileJson;
        }
    }

    renderNotSelectedRadioButton() {
        return <View style={[{ ...styles.radioButtonOuterSide, borderColor: Colors.color_gray }]} />
    }

    renderSelectedRadioButton() {
        return <View style={[{ ...styles.radioButtonOuterSide, borderColor: Colors.color_black }]}>
            <View style={styles.radioButtonInnerSide} />
        </View>
    }

    renderNotSelectedCheckboxButton() {
        return <View style={[{ ...styles.checkboxButtonOuterSide, borderColor: Colors.color_gray }]} />
    }

    renderSelectedCheckboxButton() {
        return <View style={[{ ...styles.checkboxButtonOuterSide, borderColor: Colors.color_black, backgroundColor: Colors.color_black }]}>
            {/* <View style={styles.checkBtnInnerSide} /> */}

            <Tick height={RFValue(13)} width={RFValue(13)} />
        </View>
    }

    hideModal() {
        this.setState({ isSelectionModalVisible: false });
    }

    showModal() {
        this.setState({ isSelectionModalVisible: true });
    }

    showBottomBar() {
        this.props.showBottomBar(true);
    }

    hideBottomBar() {
        this.props.showBottomBar(false);
    }
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.color_white,
    },
    profileImageContainer: {
        height: profileDimension,
        width: profileDimension,
        borderRadius: profileDimension,
        borderWidth: RFValue(2),
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: RFValue(16),
        backgroundColor: Colors.color_user_bg
    },
    profileImageStyle: {
        width: profileDimension,
        height: profileDimension,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: profileDimension
    },
    text: {
        color: Colors.color_black,
        fontSize: RFValue(18),
        fontWeight: "normal",
        fontFamily: Constants.font_regular
    },
    categoryContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        marginVertical: RFValue(8)
    },
    categoryText: {
        marginHorizontal: RFValue(16),
        fontFamily: Constants.font_regular,
        fontSize: RFValue(16),
        flex: 1
    },
    categoryView: {
        marginHorizontal: RFValue(16),
        marginTop: RFValue(10)
    },
    btnSkipStyle: {
        height: RFValue(40),
        backgroundColor: Colors.color_white,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        flex: 0.35
    },
    btnNextStyle: {
        height: RFValue(40),
        backgroundColor: Colors.color_black,
        borderRadius: RFValue(5),
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
    },
    btnSkipTextStyle: {
        color: Colors.color_black,
        fontSize: RFValue(14),
        fontFamily: Constants.font_semibold,
        textTransform: 'uppercase',
        letterSpacing: 0.8
    },
    btnNextTextStyle: {
        color: Colors.color_white,
        fontSize: RFValue(14),
        fontFamily: Constants.font_semibold,
        textTransform: 'uppercase',
        letterSpacing: 0.8
    },
    bottomContainer: {
        position: 'absolute',
        left: RFValue(16),
        right: RFValue(16),
        bottom: RFValue(15),
        flexDirection: 'row'
    },
    cameraIconStyle: {
        bottom: iconSize,
        left: profileDimension * 0.375
    },
    radioButtonOuterSide: {
        height: RFValue(20),
        width: RFValue(20),
        borderRadius: RFValue(20),
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    radioButtonInnerSide: {
        height: RFValue(10),
        width: RFValue(10),
        borderRadius: RFValue(10),
        backgroundColor: Colors.color_black
    },
    checkboxButtonOuterSide: {
        height: RFValue(20),
        width: RFValue(20),
        borderWidth: 1.5,
        borderRadius: RFValue(4),
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxButtonInnerSide: {
        height: RFValue(10),
        width: RFValue(10),
        borderRadius: RFValue(10),
        borderBottomWidth: 2,
        borderRightWidth: 2,
        borderBottomColor: Colors.color_black,
        borderRightColor: Colors.color_black,
    },
})