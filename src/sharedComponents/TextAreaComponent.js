import React, { Component } from 'react';
import { TextInput as NativeTextInput, View, Text } from 'react-native';
import { TextInput } from 'react-native-paper';
import { RFValue } from 'react-native-responsive-fontsize';
import * as Colors from './../res/colors';
const utils = require('./../utils/Utils');
import globalStyles from '../res/styles';

export default class TextAreaComponent extends Component {
    constructor(props) {
        super(props);
        this.item = this.props.component;
        this.title = this.item.required === 'Yes' ? this.item.title + ' *' : this.item.title;
        this.index = this.props.index;
        this.value = !!this.item.value ? this.item.value : '';
        this.state = {
            value: this.value,
        }
    }

    render() {
        return <View style={globalStyles.customComponentContainer}> 
            <TextInput
                label = {this.title}
                mode="outlined"
                value={this.state.value}
                multiline
                numberOfLines={1}
                style={{
                    height: RFValue(80),
                    backgroundColor : Colors.color_white,
                    fontSize : RFValue(14)
                }}
                onChangeText={(text) => {this.changeText(text)}}
                maxLength={!!this.item.maxLength ? this.item.maxLength : 0}
                render={(innerProps) => {
                return (
                    <NativeTextInput
                    {...innerProps}
                    style={[
                        innerProps.style,
                        {
                        paddingTop: RFValue(10),
                        paddingBottom: RFValue(10),
                        height: RFValue(80),
                        },
                    ]}
                    />
                );
                }}
            />
            {this.item.showError ? <Text style={[{...globalStyles.errorTextStyle, marginTop : 0}]}>{this.item.requiredText}</Text> : null}
    </View>
    }

    changeText(text){
        this.setState({
            value: text
        })

        let resultItem = this.item;
        resultItem.value = text;
        if(this.item.required === 'Yes' && text.length > 0){
            resultItem.showError = false;
        }
        this.index ? this.props.saveItemToState(resultItem, this.index - 1) : this.props.saveItemToState(resultItem);
    }
}