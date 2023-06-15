import React, { Component } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, ScrollView, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import * as Constants from './../res/strings';
import globalStyles from '../res/styles';
let buttonPressed = false;

export default class MultiValueTextBoxComponent extends Component {
    constructor(props) {
        super(props);
        this.item = this.props.component;
        this.index = this.props.index;
        this.title = this.item.required === 'Yes' ? this.item.title + ' *' : this.item.title;
        this.state = {
            items : !!this.item.value ? this.item.value : [],
            item : ''
        }
    }

    saveItemToState(){
        let resultItem = this.item;
        resultItem.value = this.state.items.length > 0 ? this.state.items : null;
        if(this.item.required === 'Yes' && buttonPressed){
            resultItem.showError = this.state.items.length < 1;
        }
        this.index ? this.props.saveItemToState(resultItem, this.index - 1) : this.props.saveItemToState(resultItem);
    }

    render(){
        if(!buttonPressed && this.item.showError){
            buttonPressed = true;
        }
        return(
            <View>
                <View style = {{
                    borderWidth : 1 , 
                    borderColor : '#757575', 
                    borderRadius : 5,
                    marginVertical : RFValue(7),
                    padding : RFValue(7),
                    paddingTop : RFValue(8)
                }}>
                    <View style={{flexDirection : 'row', flexWrap : 'wrap'}}>
                        {this.state.items.map((item, index) => {
                        return this.renderChip(item, index)
                        })}
                        <TextInput
                            ref={input => { this.textInput = input }}
                            placeholder={Constants.add_option}
                            style={styles.textInputStyle}
                            placeholderTextColor="#757575"
                            returnKeyType="done"
                            onSubmitEditing={() => {
                                this.addChip()
                            }}
                            onChangeText={(text) => this.state.item = text.trim()}
                        />
                    </View>
                                    
                    <View style={{position : 'absolute', top : -7, backgroundColor : 'white', marginStart : 8, zIndex : 1, paddingHorizontal : 4}}>
                        <Text style={{fontSize : 12, color : '#757575'}}>{this.title}</Text>
                    </View>   
                </View>
                {this.item.showError && <Text style={[{...globalStyles.errorTextStyle, marginTop : 0}]}>{this.item.requiredText}</Text>} 
            </View>
        )
    }

    renderChip(item, index){
        return <View style={styles.chip}>
            <Text style={styles.valueStyle}>
                {item}
            </Text>
            <TouchableOpacity onPress={() => {
                this.removeChip(index)
            }}>
                <Text style={styles.removeTextStyle}>x</Text>
            </TouchableOpacity>
        </View>
    }

    addChip(){
        let text = this.state.item;
        if(text){
            this.textInput.clear()
            let itemArray = this.state.items;
            if(!itemArray.includes(text)){
                itemArray.push(text);
                this.setState({
                    items : itemArray
                })
            }
        }
        this.saveItemToState();
    }

    removeChip(index){
        let itemArray = this.state.items;
        itemArray.splice(index, 1);
        this.setState({
            items : itemArray
        })
        this.saveItemToState();
    }

    componentWillUnmount(){
        buttonPressed = false;
    }
}

const styles = StyleSheet.create({
    chip: {
        backgroundColor:'#7e7e7e',
        borderColor: '#7e7e7e',
        borderWidth: 1,
        margin: RFValue(3),
        paddingHorizontal : RFValue(10),
        paddingVertical : RFValue(2),
        borderRadius: RFValue(20),
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection : 'row'
    },
    valueStyle:{
        color:'#FFF',
        fontSize:RFValue(13),
        fontFamily : Constants.font_regular
    },
    removeTextStyle : {
        color:'#FFF',
        fontSize:RFValue(18),
        marginStart : RFValue(5),
        fontFamily : Constants.font_regular,
        marginBottom : RFValue(2)
    },
    textInputStyle : {
        margin: RFValue(3),
        padding:RFValue(6),
        fontSize : RFValue(13)
    }
})