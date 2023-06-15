import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Alert, Platform } from 'react-native';
import { Button, TextInput, RadioButton, Modal } from 'react-native-paper';
import { RFValue } from 'react-native-responsive-fontsize';
import BackMenuBar from '../../../../sharedComponents/BackMenuBar';
import Loader from '../../../../sharedComponents/Loader';
import * as Colors from '../../../../res/colors';
import UserIcon from '../../../../assets/images/icn_user.svg';
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
import { StackActions } from '@react-navigation/routers';
import * as localUserData from './../../../../localStorage/UserData';

const profileDimension = RFValue(90);
const iconSize = RFValue(27);

export default class EditBasicDetail extends Component {
    constructor(props) {
        super(props);
        this.params = this.props.route.params;
        this.onBackPress = this.onBackPress.bind(this);
        this.userData = JSON.parse(JSON.stringify(this.params.userData));
        this.isMainProfile = this.params.isMainProfile || false;
        this.edit_page_json_payload = { imageFile: null, profileDTO: JSON.parse(JSON.stringify(this.params.userData)) };
        this.state = {
            isLoaderVisible: false,
            pageName: this.userData.profileName,
            userName: this.userData.tagName,
            profileImage: this.userData.profileImage,
            categoryData: [...this.userData?.categories],
            subCategoryData: [...this.userData?.categories[0]?.subCategories],
            selectedSubcategoryIds: this.getSelectedSubCategory(this.userData?.categories[0]?.subCategories, true),
            isSelectionModalVisible: false,
            isCategorySelected: false,
            showNextButton: false,
            id: this.userData?.categories[0]?.id,
            height: 0,
        };
    }

    getSelectedSubCategory(subCategories, ignoreIsSelected) {
        let selectedSubcategoryIds = [];
        selectedSubcategoryIds = subCategories?.reduce((obj, item) => {
            if (item.isSelected || ignoreIsSelected) {
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
                <View style={styles.categoryContainer}>
                    {/* <TouchableOpacity style={styles.categoryContainer} onPress={() => { this.onSelectCategory(item) }}> */}
                    {!!item.iconPath ?
                        <Image resizeMode='contain' style={{ width: RFValue(20), height: RFValue(20) }} source={{ uri: item.iconPath }} />
                        :
                        <Image resizeMode='contain' style={{ width: RFValue(20), height: RFValue(20) }} source={require('./../../../../assets/images/icon_logo.png')} />
                    }
                    <Text style={[{ ...styles.categoryText, color: selectedTextColor }]}>{item.name}</Text>
                    {item.isSelected ? this.renderSelectedRadioButton() : this.renderNotSelectedRadioButton()}
                    {/* </TouchableOpacity> */}
                </View>
            )
        })
    }

    renderSubcategory() {
        let data = this.state.subCategoryData;
        return data.map((item, key) => {
            let selectedTextColor = item.isSelected ? Colors.color_black : Colors.color_gray;
            return (
                <View style={styles.categoryContainer}>
                    {/* <TouchableOpacity style={styles.categoryContainer} onPress={() => { this.onSelectSubCategory(item) }} > */}
                    {!!item.iconPath ?
                        <Image resizeMode='contain' style={{ width: RFValue(20), height: RFValue(20) }} source={{ uri: item.iconPath }} />
                        :
                        <Image resizeMode='contain' style={{ width: RFValue(20), height: RFValue(20) }} source={require('./../../../../assets/images/icon_logo.png')} />
                    }
                    <Text style={[{ ...styles.categoryText, color: selectedTextColor }]}>{item.name}</Text>
                    {item.isSelected ? this.renderSelectedCheckboxButton() : this.renderNotSelectedCheckboxButton()}
                    {/* </TouchableOpacity> */}
                </View>
            )
        })
    }

    onSelectCategory(item) {
        let selectedId = item.id;
        if (selectedId !== this.state.id) {
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
                selectedSubcategoryIds: this.getSelectedSubCategory(subCategoryData)
            })
        }
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
    }

    componentWillUnmount() {
        if (this.params && this.params.callBack) {
            this.params.callBack();
        }
    }

    getCategoryData() {
        const onSuccess = (response) => {
            this.hideIndicator();
            let categoryData = response.data;
            let selectedId = 0;

            let selectedSubcategoryIds = this.getSelectedSubCategory(this.userData?.categories[0]?.subCategories, true);

            let subCategoryData;
            let sortedData = categoryData.sort((a, b) => a.displayOrder >= b.displayOrder);
            sortedData.map((item) => {
                if (item.id === this.userData?.categories[0]?.id) {
                    selectedId = item.id;
                    item.isSelected = true;

                    subCategoryData = item.subCategories;
                    subCategoryData.map((item) => {
                        item.isSelected = selectedSubcategoryIds.includes(item.subCategoryId) ? true : false;
                    });
                }
                else {
                    item.isSelected = false;
                }
            });

            if (this.isMainProfile) {
                sortedData = sortedData.filter((item) => { return item.name === 'Individual' });
            }

            this.setState({
                categoryData: sortedData,
                subCategoryData: subCategoryData,
                isCategorySelected: true,
                id: selectedId,
                selectedSubcategoryIds: this.getSelectedSubCategory(subCategoryData)
            })

            this.renderCategory()
            this.renderSubcategory()
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
        let flexValue = this.showNextButton ? 0.65 : 1;
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
                            defaultValue={this.state.pageName}
                            returnKeyType="next"
                            onSubmitEditing={() => {
                                this.userNameTextInput.focus();
                            }}
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
                            disabled={true}
                            defaultValue={this.state.userName}
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
                    {/* {this.state.showNextButton && <TouchableOpacity activeOpacity={0.8} style={[{ ...styles.btnNextStyle, flex: flexValue }]} onPress={() => { this.validateFields() }}>
                        <Text style={styles.btnNextTextStyle}>{Constants.next}</Text>
                    </TouchableOpacity>} */}
                    <TouchableOpacity activeOpacity={0.8} style={[{ ...styles.btnNextStyle, flex: flexValue }]} onPress={() => { this.validateFields() }}>
                        <Text style={styles.btnNextTextStyle}>{Constants.save}</Text>
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

    validateFields = () => {
        if (this.state.pageName.length < 1) {
            Alert.alert(Constants.invalid, Constants.pagename_required);
        } else if (!this.state.isCategorySelected) {
            Alert.alert(Constants.invalid, Constants.select_category);
        } else {
            this.collectSelectedData();
        }
    }

    collectSelectedData() {
        let dataToPass = this.getEditPageJSONPayload();

        const formData = new FormData();
        formData.append('imageFile', dataToPass.imageFile);
        formData.append('profileDTO', JSON.stringify(dataToPass.profileDTO));
        this.callUpdatePageAPI(formData);
    }

    getEditPageJSONPayload() {
        this.edit_page_json_payload.profileDTO.tagName = this.state.userName;
        this.edit_page_json_payload.profileDTO.profileName = this.state.pageName;
        this.edit_page_json_payload.profileDTO.id = this.edit_page_json_payload.profileDTO.profileId;


        localUserData.getUserData().then(data => {
            if (data !== null) {
                this.edit_page_json_payload.profileDTO.updatedBy = data.userId;
            }
        });


        if (this.edit_page_json_payload.profileDTO.categories[0].id !== this.state.id) {
            this.edit_page_json_payload.profileDTO.categories = [];

            let categoryId = this.state.id;
            let categoryArray = this.state.categoryData;
            let selectedCategoryData = categoryArray.find((category) => {
                return category.id === categoryId
            })

            // Remove extra flag variable
            delete selectedCategoryData.isSelected;

            this.edit_page_json_payload.profileDTO.categories.push(selectedCategoryData);
            this.edit_page_json_payload.profileDTO.categories[0].subCategories = [];

            let subCategoryData = this.state.subCategoryData;
            subCategoryData = subCategoryData.filter((item) => {
                return item.isSelected
            });

            subCategoryData.forEach((element) => {
                delete element.isSelected;
                delete element.fetchAllSectionsFromAPI;
                this.edit_page_json_payload.profileDTO.categories[0].subCategories.push(element);
            })

        }
        else {
            let previousSubcatIds = this.getSelectedSubCategory(this.userData?.categories[0]?.subCategories, true);
            let newSubcatIds = this.state.selectedSubcategoryIds;

            if (!this.arrayEquals(previousSubcatIds, newSubcatIds)) {

                /* To remove previous Subcategory form json */
                let oldSubcategoryData = this.edit_page_json_payload.profileDTO.categories[0].subCategories.filter((element) => {
                    if (newSubcatIds.includes(element.subCategoryId)) {
                        return element
                    }
                })

                /* For New added Subcategory to json */
                let selectedSubCategoryData = this.state.subCategoryData;
                selectedSubCategoryData = selectedSubCategoryData.filter((item) => {
                    return item.isSelected
                });
                let newSubcategoryData = selectedSubCategoryData.filter((element) => {
                    delete element.isSelected;
                    delete element.fetchAllSectionsFromAPI;

                    if (!previousSubcatIds.includes(element.subCategoryId)) {
                        return element;
                    }
                })

                let subcategoryData = [...oldSubcategoryData, ...newSubcategoryData];
                this.edit_page_json_payload.profileDTO.categories[0].subCategories = []

                subcategoryData.forEach(element => {

                    /* Remove Show Error Variable from fields */
                    element?.sections?.forEach(section => {
                        section?.fields?.forEach(field => {
                            delete field.showError;
                        })
                        section?.subSection?.fields?.forEach(field => {
                            delete field.showError;
                        })
                    })


                    this.edit_page_json_payload.profileDTO.categories[0].subCategories.push(element)
                });
            }
        }

        return this.edit_page_json_payload;
    }

    callUpdatePageAPI(formData) {
        const onSuccess = (response) => {
            this.hideIndicator();
            if (response.success === 0) {
                this.gotoMenuDashboardScreen();
                Alert.alert(Constants.success, response.message);
            }
        }

        const onFailure = (message) => {
            this.hideIndicator();
        };

        NetInfo.fetch().then(state => {
            if (state.isConnected) {
                this.showIndicator();
                ApiManager.updateProfileDetails(formData, true)
                    .then(onSuccess)
                    .catch(onFailure);
            } else {
                Alert.alert(Constants.network, Constants.please_check_internet);
            }
        });
    }

    gotoMenuDashboardScreen() {
        const popAction = StackActions.pop(2);
        this.props.navigation.dispatch(popAction);
        this.props.navigation.navigate(Constants.screen_menu_dashboard);
    }


    arrayEquals(a, b) {
        return Array.isArray(a) &&
            Array.isArray(b) &&
            a.length === b.length &&
            a.every((val, index) => val === b[index]);
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
        this.props.navigation.goBack();
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
        this.edit_page_json_payload.imageFile = null;
        this.edit_page_json_payload.profileDTO.profileImage = '';
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
            this.edit_page_json_payload.imageFile = fileJson;
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
        return <View style={[{ ...styles.checkboxButtonOuterSide, borderColor: Colors.color_black }]}>
            <View style={styles.radioButtonInnerSide} />
        </View>
    }
    hideModal() {
        this.setState({ isSelectionModalVisible: false });
    }

    showModal() {
        this.setState({ isSelectionModalVisible: true });
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
        alignItems: 'center',
        justifyContent: 'center'
    },
    checkboxButtonInnerSide: {
        height: RFValue(10),
        width: RFValue(10),
        borderRadius: RFValue(10),
        borderBottomWidth: 2,
        borderRightWidth: 2,
        borderBottomColor: Colors.color_black,
        borderRightColor: Colors.color_black
    }
})