import NetInfo from '@react-native-community/netinfo';
import moment from 'moment';
import React, { Component } from 'react';
import { Alert, Keyboard, ScrollView, StyleSheet, Text, TouchableOpacity, View, KeyboardAvoidingView } from 'react-native';
import CheckBox from 'react-native-check-box';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Button, TextInput } from 'react-native-paper';
import { RFValue } from "react-native-responsive-fontsize";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ApiManager from '../../apiManager/ApiManager';
import AppLogo from '../../assets/images/keeku_logo.svg';
import * as Colors from '../../res/colors';
import * as Constants from '../../res/strings';
import Loader from '../../sharedComponents/Loader';
import TermsAndCondition from '../SignUpScreens/TermsAndCondition';
import globalStyles from '../../res/styles';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import DatePicker from 'react-native-date-picker'

const utils = require('../../utils/Utils');
const maxDate = new Date(moment().subtract(18, 'years'));

class SignUp extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isAgreeTerms: false,
            isDatePickerVisible: false,
            date: maxDate,
            firstName: '',
            lastName: '',
            dob: '',
            email: '',
            isLoaderVisible: false,
            isTermsAndConditionVisible: false,
            isDateSet: false
        }
    }

    getParameterFromUrl = (url, parm) => {
        var re = new RegExp('.*[?&]' + parm + '=([^&]+)(&|$)');
        var match = url.match(re);
        return match ? match[1] : '';
    };

    handleDynamicLink = link => {
        if (link?.url) {
            const post_id = this.getParameterFromUrl(link?.url, 'post_id');
            const response_id = this.getParameterFromUrl(link?.url, 'response_id');
            if (response_id) {
                let paramsReview = {
                    reviewId: post_id,
                    responseId: response_id
                }
                NetInfo.fetch().then(state => {
                    if (state.isConnected) {
                        var myHeaders = new Headers();
                        myHeaders.append("Content-type", "application/json");
                        ApiManager.getReviewDetails(paramsReview, myHeaders)
                            .then(success => {
                                let data = success.data;
                                this.props.navigation.push(Constants.screen_nested_review, { item: data, responce1: data?.response, responce2: data?.response?.response, responce3: data?.response?.response?.response, responce4: data?.response?.response?.response?.response });
                            }).catch(error => {
                                console.log(error);
                            });
                    } else {
                        Alert.alert(Constants.network, Constants.please_check_internet);
                    }
                });
            } else {
                this.props.navigation.navigate(Constants.screen_review_detail, { item: { id: post_id } })
            }
        }
    };

    componentDidMount() {
        const unsubscribe = dynamicLinks().onLink(this.handleDynamicLink);
        return () => unsubscribe();
    }

    render() {
        return (
            <SafeAreaView style={globalStyles.container}>
                <View style={{ flex: 1 }}>
                    <AppLogo style={globalStyles.appLogoStyle} />
                    <Text style={globalStyles.titleStyle}>{Constants.sign_up}</Text>
                    <Text style={globalStyles.instructionStyle}>{Constants.sign_up_instruction}</Text>
                    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" enabled={true} keyboardVerticalOffset={20}>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            style={styles.scrollContainer}
                            bounces={false}>

                            <TextInput
                                style={globalStyles.textInputStyle}
                                selectionColor={Colors.color_black}
                                label={Constants.first_name}
                                mode='outlined'
                                dense={true}
                                returnKeyType='next'
                                textContentType='name'
                                onSubmitEditing={() => { this.lastNameInput.focus(); }}
                                blurOnSubmit={false}
                                onChangeText={(text) => { this.state.firstName = text.trim() }}
                            />

                            <TextInput
                                ref={(input) => { this.lastNameInput = input; }}
                                style={[{ ...globalStyles.textInputStyle, marginTop: RFValue(12) }]}
                                selectionColor={Colors.color_black}
                                label={Constants.last_name}
                                mode='outlined'
                                dense={true}
                                returnKeyType='next'
                                textContentType='name'
                                onSubmitEditing={() => {
                                    Keyboard.dismiss();
                                    this.showPicker();
                                }}
                                blurOnSubmit={false}
                                onChangeText={(text) => { this.state.lastName = text.trim() }}
                            />

                            <TouchableOpacity activeOpacity={1} onPress={() => { this.showPicker() }}>
                                <TextInput
                                    ref={(input) => { this.dateOfBirthInput = input; }}
                                    style={[{ ...globalStyles.textInputStyle, marginTop: RFValue(12) }]}
                                    selectionColor={Colors.color_black}
                                    label={Constants.date_of_birth}
                                    mode='outlined'
                                    dense={true}
                                    pointerEvents='none'
                                    returnKeyType='next'
                                    editable={false}
                                    value={this.state.isDateSet ? this.getFormattedDate() : ''}
                                    onSubmitEditing={() => { this.emailIdInput.focus(); }}
                                    blurOnSubmit={false}
                                />
                            </TouchableOpacity>

                            <TextInput
                                ref={(input) => { this.emailIdInput = input; }}
                                style={[{ ...globalStyles.textInputStyle, marginTop: RFValue(12) }]}
                                label={Constants.email_id}
                                mode='outlined'
                                dense={true}
                                returnKeyType='done'
                                textContentType='emailAddress'
                                onChangeText={(text) => { this.state.email = text.trim() }}
                            />

                            <View style={styles.checkboxContainer}>
                                <CheckBox
                                    isChecked={this.state.isAgreeTerms}
                                    onClick={() =>
                                        this.setState({ isAgreeTerms: !this.state.isAgreeTerms })
                                    }
                                    style={styles.checkbox}
                                    uncheckedCheckBoxColor={Colors.color_gray}
                                    checkedCheckBoxColor={Colors.color_black}
                                />
                                <Text style={styles.textStyle}>{Constants.i_agree_with}
                                    <Text style={{ ...styles.textStyle, fontFamily: Constants.font_bold }} onPress={() => { this.showTermsAndConditions() }}>
                                        {Constants.terms_and_conditions}</Text>
                                </Text>
                            </View>

                        </ScrollView>
                    </KeyboardAvoidingView>

                    <View style={styles.bottomContainer}>
                        <Button
                            style={[{ ...globalStyles.btnStyle, marginBottom: RFValue(15) }]}
                            labelStyle={globalStyles.btnLabelStyle}
                            uppercase={true}
                            mode='contained'
                            onPress={() => { this.validateFields() }}>{Constants.continues}
                        </Button>
                        <Text style={styles.textStyle}>{Constants.already_have_an_account}
                            <Text style={{ ...styles.textStyle, fontFamily: Constants.font_bold }} onPress={() => this.goToSignIn()}>{Constants.sign_in}</Text>
                        </Text>
                        <Text style={{ ...styles.textStyle, fontFamily: Constants.font_bold, marginTop: 5 }}
                            onPress={() => { this.continueAsGuest() }}>{Constants.continue_as_guest}
                        </Text>
                    </View>
                    <DatePicker
                        modal
                        open={this.state.isDatePickerVisible}
                        mode="date"
                        date={this.state.date}
                        maximumDate={maxDate}
                        onConfirm={(mDate) => { this.onDateChange(mDate) }}
                        onCancel={() => { this.onDateChange() }}
                        textColor="#000000"
                    />

                    {/* <DateTimePickerModal
                        isVisible={this.state.isDatePickerVisible}
                        mode="date"
                        date={this.state.date}
                        onConfirm={(mDate) => { this.onDateChange(mDate) }}
                        onCancel={() => { this.onDateChange() }}
                        maximumDate={maxDate}
                    /> */}

                    {this.state.isLoaderVisible && <Loader />}

                    <TermsAndCondition
                        isVisible={this.state.isTermsAndConditionVisible}
                        close={() => { this.hideTermsAndConditions() }} />

                </View>
            </SafeAreaView>
        );
    }

    showPicker = () => {
        this.setState({ isDatePickerVisible: true })
    }

    goToSignIn = () => {
        this.props.extraData.screenProps.gotoLogin();
    }

    continueAsGuest = () => {
        this.props.extraData.screenProps.gotoMain();
    }

    goToActivateAccount = (data) => {
        setTimeout(() => {
            this.props.navigation.navigate(Constants.screen_actiavte_account, data);
        }, 0);
    }

    validateFields = () => {
        let title = Constants.invalid;
        if (this.state.firstName.length < 1) {
            this.showAlert(title, Constants.empty_first_name);
        } else if (utils.validateField(this.state.firstName, Constants.regex_name)) {
            this.showAlert(title, Constants.valid_first_name);
        } else if (this.state.lastName.length < 1) {
            this.showAlert(title, Constants.empty_last_name);
        } else if (utils.validateField(this.state.lastName, Constants.regex_name)) {
            this.showAlert(title, Constants.valid_last_name);
        } else if (!this.state.isDateSet) {
            this.showAlert(title, Constants.empty_date_of_birth);
        } else if (this.state.email.length < 1) {
            this.showAlert(title, Constants.empty_email_id);
        } else if (utils.validateField(this.state.email, Constants.regex_email)) {
            this.showAlert(title, Constants.valid_email_id);
        } else if (!this.state.isAgreeTerms) {
            this.showAlert(title, Constants.check_terms_and_conditions);
        } else {
            let dateToPass = this.getFormattedDate();
            var data = new SignUpdata(this.state.firstName, this.state.lastName, this.state.email.toLowerCase(), dateToPass);
            this.callSignUpApi(data);
        }

        //var data = new SignUpdata('test', 'bugtwo', 'testbugtwo@mailinator.com', '03-15-1998');
        //this.callSignUpApi(data);
    }

    showAlert = (title, msg) => {
        Alert.alert(title, msg);
    }

    getFormattedDate = () => {
        return moment(this.state.date).format(Constants.MM_DD_YYYY);
    }

    onDateChange = (dateValue) => {
        if (dateValue) {
            this.setState({ date: dateValue, isDatePickerVisible: false, isDateSet: true })
        } else {
            this.setState({ isDatePickerVisible: false })
        }
    }

    callSignUpApi = (data) => {

        const onSuccess = (data) => {
            this.hideIndicator();
            if (data.success === 0) {
                this.goToActivateAccount(data);
            } else {
                this.showAlert('', data.message);
            }
        };

        const onFailure = (message) => {
            this.hideIndicator();
        };

        NetInfo.fetch().then(state => {
            if (state.isConnected) {
                this.showIndicator();
                ApiManager.signup(data, true)
                    .then(onSuccess)
                    .catch(onFailure);
            } else {
                this.showAlert(Constants.network, Constants.please_check_internet);
            }
        });
    }

    showIndicator = () => {
        this.setState({
            isLoaderVisible: true
        })
    }

    hideIndicator = () => {
        this.setState({
            isLoaderVisible: false
        })
    }

    showTermsAndConditions = () => {
        this.setState({
            isTermsAndConditionVisible: true
        })
    }

    hideTermsAndConditions = () => {
        this.setState({
            isTermsAndConditionVisible: false
        })
    }
}

function SignUpdata(firstName, lastName, email, dateOfBirth) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.dateOfBirth = dateOfBirth;
    this.signupStep = 1;
}

const styles = StyleSheet.create({
    checkboxContainer: {
        flexDirection: "row",
        marginTop: RFValue(10),
        alignItems: "center",
    },
    checkbox: {
        alignSelf: "center",
        marginEnd: RFValue(5)
    },
    textStyle: {
        fontSize: RFValue(13),
        fontFamily: Constants.font_regular,
        color: Colors.color_black,
        textAlign: "center"
    },
    bottomContainer: {
        paddingBottom: RFValue(10),
        justifyContent: "center",
        alignSelf: "center",
        flexDirection: "column",
        width: '100%'
    },
    scrollContainer: {
        flex: 1,
        marginVertical: RFValue(12)
    },
});

export default SignUp;