import React, { Component } from 'react';
import { Text, View, StyleSheet, Dimensions, Alert, ScrollView, Image, TouchableOpacity } from 'react-native';
import * as Colors from './../res/colors';
import * as Constants from './../res/strings';
import { RFValue } from 'react-native-responsive-fontsize';
import { TextInput } from 'react-native-paper';
import globalStyles from '../res/styles';
import NetInfo from '@react-native-community/netinfo';
import * as ApiManager from '../apiManager/ApiManager';
import UserIcon from './../assets/images/icn_user.svg';
import InfoIcon from '../assets/images/info_icon.svg';
const MARGIN_VERTICAL = RFValue(5);

export default class KeekuUsernameComponent extends Component {
    constructor(props) {
        super(props);
        this.item = this.props.component;
        this.title = this.item.required === 'Yes' ? this.item.title + ' *' : this.item.title;
        this.componentHeight = this.props.componentHeight;
        this.index = this.props.index;
        this.state = {
            isLoaderVisible: false,
            queryResult: [],
            selectedItem: !!this.item.value ? this.item.value : '',
            show: false
        }
    }

    renderTextInput() {
        return (
            <View style={{ marginVertical: MARGIN_VERTICAL }}>
                <TextInput
                    style={globalStyles.textInputStyle}
                    selectionColor={Colors.color_black}
                    label={this.title}
                    value={this.state.selectedItem}
                    mode='outlined'
                    dense={true}
                    onChangeText={(text) => this.changeText(text)}
                    returnKeyType='next'
                    blurOnSubmit={false}
                    left={<TextInput.Affix text={'@'} textStyle={{ fontSize: RFValue(14), color: Colors.color_black }} />} // used for set padding
                    right={this.item.hintText ? <TextInput.Affix text={Constants.space_five_times} textStyle={{ fontSize: RFValue(13) }} /> : null} // used for set padding
                />
                {this.item.hintText ?
                    <TouchableOpacity style={{
                        position: 'absolute',
                        zIndex: 1,
                        right: 0,
                        top: RFValue(6),
                        height: this.componentHeight,
                        width: this.componentHeight,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                        onPress={() => {
                            Alert.alert('', this.item.hintText)
                        }}
                    >
                        <InfoIcon width={this.componentHeight / 2} height={this.componentHeight / 2} />
                    </TouchableOpacity>
                    : null}
                {this.item.showError && <Text style={globalStyles.errorTextStyle}>{this.item.requiredText}</Text>}
            </View>
        )
    }

    saveItemToState(text) {
        let resultItem = this.item;
        resultItem.value = text;
        if (this.item.required === 'Yes' && text !== null) {
            resultItem.showError = false;
        }
        this.index ? this.props.saveItemToState(resultItem, this.index - 1) : this.props.saveItemToState(resultItem);
    }

    changeText(text) {
        this.saveItemToState(null);
        this.setState({
            selectedItem: text,
        })

        const onSuccess = (response) => {
            this.hideIndicator();
            if (response.data.length > 0) {
                this.setState({
                    queryResult: response.data,
                    show: true
                })
            } else {
                this.setState({
                    queryResult: [],
                    show: false
                })
            }
        };

        const onFailure = (error) => {
            this.hideIndicator();
        };

        NetInfo.fetch().then(state => {
            if (state.isConnected) {
                this.showIndicator();
                ApiManager.fetchTagNames(text, 5, true)
                    .then(onSuccess)
                    .catch(onFailure);
            } else {
                this.showAlert(Constants.network, Constants.please_check_internet);
            }
        });
    }

    renderSuggestionList() {
        return this.state.queryResult.map((item, index) => {
            return <TouchableOpacity onPress={() => this.selectTagName(item)}>
                <View style={styles.horizontalItemContainer}>
                    {item.profileImage ? <Image style={styles.profileImageStyle} source={{ uri: item.profileImage }} /> : <UserIcon height={RFValue(30)} width={RFValue(30)} />}
                    <Text style={styles.profileNameStyle}>{item.tagName}</Text>
                </View>
                <View
                    style={{
                        borderBottomColor: Colors.color_input_border,
                        borderBottomWidth: 1
                    }} />
            </TouchableOpacity>
        })
    }

    selectTagName(item) {
        if (item.tagName !== "") {
            this.saveItemToState(item.tagName);
            this.setState({
                selectedItem: item.tagName,
                show: false
            })
        }
    }

    render() {
        return (
            <View>
                {this.renderTextInput()}
                {this.state.show && <ScrollView
                    nestedScrollEnabled={true}
                    style={[{
                        ...styles.listContainer,
                        bottom: this.props.componentHeight + ((MARGIN_VERTICAL * 2) + RFValue(5)),
                        width: Dimensions.get('window').width - RFValue(32),
                        maxHeight: RFValue(105)

                    }]}>
                    {this.renderSuggestionList()}
                </ScrollView>
                }
            </View>
        )
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

    showAlert = (title, msg) => {
        Alert.alert(title, msg);
    }
}

const styles = StyleSheet.create({
    listContainer: {
        backgroundColor: Colors.color_white,
        position: 'absolute',
        zIndex: 1,
        borderColor: Colors.color_black,
        borderRadius: 5,
        borderWidth: 1
    },
    profileImageStyle: {
        width: RFValue(30),
        height: RFValue(30),
        borderRadius: RFValue(30)
    },
    horizontalItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: RFValue(10)
    },
    profileNameStyle: {
        fontFamily: Constants.font_regular,
        fontSize: RFValue(16),
        color: Colors.color_black,
        marginLeft: RFValue(15)
    },
});