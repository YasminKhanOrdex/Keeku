import moment from 'moment';
import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { TextInput } from 'react-native-paper';
import { RFValue } from 'react-native-responsive-fontsize';
import globalStyles from '../res/styles';
import * as Colors from './../res/colors';
import * as Constants from './../res/strings';
const utils = require('./../utils/Utils');

export default class DatePickerComponent extends Component {
    constructor(props) {
        super(props);
        this.item = this.props.component;
        this.title = this.item.required === 'Yes' ? this.item.title + ' *' : this.item.title;
        this.index = this.props.index;
        this.state = {
            date : new Date(),
            isDateSet : false,
            isDatePickerVisible : false
        }
    }

    componentDidMount() {
        if(!!this.item.value) {
            const date = new Date(this.item.value);
            this.setState({isDateSet: true, date:date })
        }
    }

    render() {
        return <TouchableOpacity activeOpacity = {1} style={globalStyles.customComponentContainer} onPress={() => {this.showPicker()}}>
        <TextInput
            ref={(input) => { this.dateOfBirthInput = input; }}
            style = {[{...globalStyles.textInputStyle}]}
            selectionColor = {Colors.color_black}
            label = {this.title}
            mode = 'outlined'
            dense={true}
            pointerEvents='none'
            returnKeyType='next'
            editable={false}
            value={this.state.isDateSet ? this.getFormattedDate() : ''}
            blurOnSubmit={false}
        />

        {this.item.showError && <Text style={globalStyles.errorTextStyle}>{this.item.requiredText}</Text>}

        <DateTimePickerModal
            isVisible={this.state.isDatePickerVisible}
            mode="date"
            date={this.state.date}
            onConfirm={(mDate) => {this.onDateChange(mDate)}}
            onCancel={() => {this.onDateChange()}}
        />  

    </TouchableOpacity>
    }

    onDateChange = (dateValue) => {
        if(dateValue){
            this.saveItemToState(dateValue);
            this.setState({date : dateValue, isDatePickerVisible : false, isDateSet : true});
        } else{
            this.setState({isDatePickerVisible : false})
        }
    }

    getFormattedDate = () => {
        return moment(this.state.date).format(Constants.YYYY_MM_DD);
    }

    getDateToSave = (date) => {
        return moment(date).format(Constants.YYYY_MM_DD);
    }

    saveItemToState(date){
        let resultItem = this.item;
        resultItem.value = this.getDateToSave(date);
        if(this.item.required === 'Yes'){
            resultItem.showError = false;
        }
        this.index ? this.props.saveItemToState(resultItem, this.index - 1) : this.props.saveItemToState(resultItem);
    }

    showPicker = () => {
        this.setState({isDatePickerVisible: true})
    }
}

const styles = StyleSheet.create({
    errorTextStyle : {
        color : Colors.color_red_border,
        fontFamily : Constants.font_regular,
        fontSize : RFValue(14)
    },
})