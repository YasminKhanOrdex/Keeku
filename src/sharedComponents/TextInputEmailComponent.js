import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import globalStyles from '../res/styles';
import * as Colors from './../res/colors';
import * as Constants from './../res/strings';
const utils = require('./../utils/Utils');

export default class TextInputEmailComponent extends Component {
    constructor(props) {
        super(props);
        this.item = this.props.component;
        this.index = this.props.index;
        this.value = !!this.item.value ? this.item.value : '';
        this.state = {
            value: this.value,
            isValidEmail : true
        }
    }

    render() {
        return <View style={globalStyles.customComponentContainer}> 
        <TextInput
            style = {globalStyles.textInputStyle}
            selectionColor = {Colors.color_black}
            label = {this.item.title}
            mode = 'outlined'
            value = {this.state.value}
            dense={true}
            textContentType={'emailAddress'}
            returnKeyType='next'
            blurOnSubmit={false}
            onChangeText={(text) => {this.onTextChangeEmail(text.trim())}}
            maxLength={!!this.item.maxLength ? this.item.maxLength : 0}
        />
        {!this.state.isValidEmail && <Text style={globalStyles.errorTextStyle}>{Constants.invalid_email}</Text>}
    </View>
    }

    onTextChangeEmail(text){
        let isValidEmail;
        if(text.length > 0){
            if(!utils.validateField(text, Constants.regex_email)){
                isValidEmail = true;
            } else {
                isValidEmail = false;
            }
            this.saveItemToState(text);
        } else {
            isValidEmail = true;
        }
        this.setState({
            isValidEmail
        })
    }

    saveItemToState(text){
        this.setState({
            value: text
        })

        let resultItem = this.item;
        resultItem.value = text;
        this.index ? this.props.saveItemToState(resultItem, this.index - 1) : this.props.saveItemToState(resultItem);
    }
}