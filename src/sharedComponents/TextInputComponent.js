import React, { Component } from 'react';
import { Alert, Text, View, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-paper';
import { RFValue } from 'react-native-responsive-fontsize';
import globalStyles from '../res/styles';
import * as Colors from './../res/colors';
import * as Constants from './../res/strings';
const utils = require('./../utils/Utils');
import InfoIcon from '../assets/images/info_icon.svg';
import * as UserData from '../localStorage/UserData';

export default class TextInputComponent extends Component {
    constructor(props) {
        super(props);
        this.item = this.props.component;
        this.title = this.item.required === 'Yes' ? this.item.title + ' *' : this.item.title;
        this.firstName = '';
        this.lastName = '';
        this.firstLogin = false;
        this.componentHeight = this.props.componentHeight;
        this.index = this.props.index;
        this.value = !!this.item.value ? this.item.value : ''
        this.state = {
            firstName: '',
            lastName: '',
            value: this.value,
            show: false
        }
    }

    componentDidMount() {
        this.fetchUserData()
    }

    fetchUserData() {
        UserData.getUserData()
            .then(data => {

                if (data !== null) {
                    // console.log(">>>>>>>>>>>> USER DATA >>>>>>>>>>>>>>>> ", JSON.stringify(data));
                    this.firstLogin = data.firstLogIn;
                    this.firstName = data.firstName;
                    this.lastName = data.lastName;
                    if (this.title == "First Name *" && this.firstLogin) {
                        this.changeText(data.firstName)
                        this.state.value = this.firstName;
                    } else if (this.title == "Last Name *" && this.firstLogin) {
                        this.changeText(data.lastName);
                        this.state.value = this.lastName;
                    }

                }
            })
            .catch(error => {
                console.log('error while getting data from local storage');
            });
    }

    render() {
        return <View style={globalStyles.customComponentContainer}>
            <TextInput
                style={[{ ...globalStyles.textInputStyle }]}
                selectionColor={Colors.color_black}
                label={this.title}
                value={this.state.value}
                mode='outlined'
                dense={true}
                returnKeyType='next'
                blurOnSubmit={false}
                onChangeText={(text) => { this.changeText(text) }}
                right={this.item.hintText ? <TextInput.Affix text={Constants.space_five_times} textStyle={{ fontSize: RFValue(13) }} /> : null} // used for set padding
                maxLength={!!this.item.maxLength ? this.item.maxLength : 0}
            />
            {this.item.showError && <Text style={globalStyles.errorTextStyle}>{this.item.requiredText}</Text>}
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
                </TouchableOpacity> : null
            }

        </View>
    }

    changeText(text) {
        this.setState({
            value: text
        })

        let resultItem = this.item;
        resultItem.value = text;
        if (this.item.required === 'Yes' && text.length > 0) {
            resultItem.showError = false;
        }

        this.index ? this.props.saveItemToState(resultItem, this.index - 1) : this.props.saveItemToState(resultItem);
    }
}