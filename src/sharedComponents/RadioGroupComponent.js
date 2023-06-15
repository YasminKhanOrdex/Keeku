import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import * as Colors from '../res/colors';
import * as Constants from '../res/strings';
const utils = require('../utils/Utils');
import globalStyles from '../res/styles';

export default class RadioGroupComponent extends Component {
    constructor(props) {
        super(props);
        this.item = this.props.component;
        this.title = this.item.required === 'Yes' ? this.item.title + ' * :' : this.item.title + ' :';
        this.content = this.item.content;
        this.index = this.props.index;
        this.state = {
            itemList : this.getItemList(),
        }
    }

    getItemList(){
        var arrayList = new Array();
        this.content.map((item, index) => {
            let mItem = {
                id : index,
                isSelected : this.item.value === item ? this.item.value : false,
                title : item
            }
            arrayList.push(mItem);
        });
        return arrayList;
    }

    render() {
        return (
            <View style={globalStyles.customComponentContainer}>
                <Text style={styles.titleTextStyle}>{this.title}</Text>
                {this.renderRadioButtons()}
                {this.item.showError && <Text style={[{...globalStyles.errorTextStyle, marginTop : 0}]}>{this.item.requiredText}</Text>}
            </View>
        )
    }

    renderRadioButtons(){
        return <View style={styles.categoryContainer}>
       {
       this.state.itemList.map((item) => {
            return <TouchableOpacity style={styles.itemContainer} activeOpacity={0.5} onPress={() => {
                this.selectOption(item);
            }}>
                {item.isSelected ? this.renderSelectedRadioButton() : this.renderNotSelectedRadioButton()}
                <Text style={styles.textStyle}>{item.title}</Text>
            </TouchableOpacity>
        })
        }
        </View>
    }

    selectOption(item){
        let selectedId = item.id;
        let selectedOption = item.title;
        let resultItem = this.item;
        resultItem.value = selectedOption;
        if(this.item.required === 'Yes'){
            resultItem.showError = false;
        }
        const modifiedList = this.state.itemList.map((item) => {
            if(selectedId.toString() === item.id.toString()){
                item.isSelected = true;
            } else {
                item.isSelected = false;
            }
            return item;
        });
        this.setState({
            itemList : modifiedList
        })
        this.index ? this.props.saveItemToState(resultItem, this.index - 1) : this.props.saveItemToState(resultItem);
    }

    renderNotSelectedRadioButton(){
        return <View style={[{...styles.radioButtonOuterSide, borderColor : Colors.color_gray}]}/>
    }

    renderSelectedRadioButton(){
        return <View style={[{...styles.radioButtonOuterSide, borderColor : Colors.color_black}]}>
            <View style={styles.radioButtonInnerSide}/>
        </View>
    }
}

const styles = StyleSheet.create({
   titleTextStyle : {
        fontSize: RFValue(15),
        fontFamily : Constants.font_regular
   },
   radioButtonOuterSide : {
    height : RFValue(18), 
    width : RFValue(18), 
    borderRadius : RFValue(18),
    borderWidth : 1.5,
    alignItems : 'center', 
    justifyContent : 'center'
  },
  radioButtonInnerSide : {
    height : RFValue(8), 
    width : RFValue(8), 
    borderRadius : RFValue(8),
    backgroundColor : Colors.color_black
  },
  categoryContainer : {
    flexWrap : 'wrap', 
    flexDirection : 'row', 
    marginVertical : RFValue(5)
  },
  itemContainer : {
    flexDirection : 'row', 
    alignItems : 'center',
    marginEnd : RFValue(10), 
    marginVertical : RFValue(3)
  },
  textStyle : {
      fontSize : RFValue(14),
      fontFamily : Constants.font_regular,
      marginLeft : RFValue(8)
  }
})