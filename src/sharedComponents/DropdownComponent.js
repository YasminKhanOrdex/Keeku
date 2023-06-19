import React, { Component } from "react";
import { StyleSheet, View, Text } from "react-native";
import { TextInput } from "react-native-paper";
import DropDown from "react-native-paper-dropdown";
import { RFValue } from "react-native-responsive-fontsize";
import * as Colors from './../res/colors';
import globalStyles from '../res/styles';
import DropDownIcon from '../assets/images/icn_drop_down.svg';
import DownIcon from '../assets/images/icn_down.svg';

export default class DropdownComponent extends Component {
  constructor(props) {
    super(props);
    this.item = this.props.component;
    this.title = this.item.required === 'Yes' ? this.item.title + ' *' : this.item.title;
    this.componentHeight = this.props.componentHeight;
    this.index = this.props.index;
    this.state = {
      listItem: !!this.item.value ? this.item.value : '',
      showDropDown: false,
      content: this.getItemList()
    }
  }

  render() {
    if (this.item.title === "city") {
      var arrayList = new Array();
      this.props.component.content.map((item) => {
        let mItem = {
          label: item,
          value: item
        }
        arrayList.push(mItem);
        this.state.content = arrayList
      });
    } else if (this.item.title === "office name") {
      var arrayList = new Array();
      this.props.component.content.map((item) => {
        let mItem = {
          label: item,
          value: item
        }
        arrayList.push(mItem);
        this.state.content = arrayList
      });
    } else {
      // console.log("");
    }

    return <View style={globalStyles.customComponentContainer}>
      <DropDown
        label={this.title}
        mode={"outlined"}

        value={this.state.listItem}
        setValue={(value) => { this.setValue(value) }}
        list={this.state.content}
        visible={this.state.showDropDown}
        showDropDown={() => this.setShowDropDown(true)}
        onDismiss={() => this.setShowDropDown(false)}
        // theme={{
        //     colors : { background: 'white'}
        // }}
        inputProps={{
          // right:<TextInput.Icon icon={()=><DropDownIcon width={RFValue(10)} height={RFValue(18)} style={{marginTop:10}}/>}/>,
          right:<TextInput.Icon icon={()=><DownIcon width={RFValue(12)} height={RFValue(16)} style={{marginTop:10}}/>}/>,

          style: { ...styles.dropDownStyle, height: this.componentHeight, },
        }}
        dropDownItemStyle={{ backgroundColor: 'white', height: this.componentHeight, }}
      />
      {this.item.showError && <Text style={[{ ...globalStyles.errorTextStyle, marginTop: 0 }]}>{this.item.requiredText}</Text>}
    </View>
  }

  getItemList() {
    var arrayList = new Array();
    this.item.content.map((item) => {
      let mItem = {
        label: item,
        value: item
      }
      arrayList.push(mItem);
    });
    return arrayList;
  }

  setShowDropDown(value) {
    this.setState({
      showDropDown: value
    })
  }

  setValue(value) {
    this.saveItemToState(value);
    this.setState({ listItem: value });
  }

  saveItemToState(text) {
    let resultItem = this.item;
    resultItem.value = text;
    if (this.item.required === 'Yes') {
      resultItem.showError = false;
    }
    this.index ? this.props.saveItemToState(resultItem, this.index - 1) : this.props.saveItemToState(resultItem);
  }
}

const styles = StyleSheet.create({
  dropDownStyle: {
    fontSize: RFValue(14),
    backgroundColor: Colors.color_white,
  }
});