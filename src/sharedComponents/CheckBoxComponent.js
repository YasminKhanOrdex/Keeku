import React, { Component } from 'react';
import { View, Text } from 'react-native';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import IconAdd from './../assets/images/icn_add_item.svg';
import IconRemove from './../assets/images/icn_remove_item.svg';
import IconBlank from './../assets/images/icn_blank.svg';
import { RFValue } from 'react-native-responsive-fontsize';
import globalStyles from '../res/styles';
import * as Colors from '../res/colors';
import * as Constants from '../res/strings';
let buttonPressed = false;

export default class CheckBoxComponent extends Component {
  constructor(props) {
    super(props);
    this.item = this.props.component;
    this.index = this.props.index;
    this.title = this.item.required === 'Yes' ? this.item.title + ' *' : this.item.title;
    this.items = this.getItemList();

    const value = !!this.item.value ? this.setSelectedItems(this.item.value) : []
    this.state = {
      selectedItems: value,
      selectText: this.title,
      shouldShowLabel: false
    };
  }
  setSelectedItems(value) {
    const finalValue = [];

    /* Create array of selected items index */
    this.items[0].children.filter((item) => {
      if (value.includes(item.name)) {
        finalValue.push(item.id);
      }
    });

    return finalValue;
  }

  onSelectedItemsChange = (selectedItems) => {
    this.setState({ selectedItems });
    let selectedArray = selectedItems.map((item) => {
      return this.items[0].children[item].name;
    });
    let valueToStore = selectedArray.length > 0 ? selectedArray : null;
    let resultItem = this.item;
    resultItem.value = valueToStore;
    if (this.item.required === 'Yes' && buttonPressed) {
      resultItem.showError = selectedArray.length < 1;
    }
    this.index ? this.props.saveItemToState(resultItem, this.index - 1) : this.props.saveItemToState(resultItem);
  };

  render() {
    if (!buttonPressed && this.item.showError) {
      buttonPressed = true;
    }
    return (
      <View style={[{ ...globalStyles.customComponentContainer, marginVertical: RFValue(7) }]}>
        <View style={{
          borderWidth: 1,
          borderColor: '#757575',
          borderRadius: 5
        }}>
          <SectionedMultiSelect
            items={this.items}
            IconRenderer={IconRemove}
            selectToggleIconComponent={IconBlank}
            selectedIconComponent={IconAdd}
            uniqueKey="id"
            subKey="children"
            showDropDowns={false}
            readOnlyHeadings={true}
            hideSearch={true}
            alwaysShowSelectText={false}
            onSelectedItemsChange={this.onSelectedItemsChange}
            selectedItems={this.state.selectedItems}
            styles={
              {
                chipsWrapper: {
                  marginHorizontal: RFValue(10),
                  marginBottom: RFValue(10)
                },
                subItemText: {
                  color: Colors.color_gray,
                  fontFamily: Constants.font_regular,
                  fontSize: RFValue(17)
                },
                selectedSubItemText: {
                  color: Colors.color_black,
                  fontFamily: Constants.font_regular,
                  fontSize: RFValue(17)
                },
                chipText: {
                  fontFamily: Constants.font_regular,
                  fontSize: RFValue(13),
                  color: Colors.color_black,
                },
                button: { borderRadius: RFValue(5), backgroundColor: Colors.color_black, color: 'white', marginHorizontal: RFValue(10), marginVertical: RFValue(10) }
              }
            }
            selectText={this.state.selectText}
            modalWithSafeAreaView={true}
            renderSelectText={(props) => {
              return this.renderSelectedText(props)
            }}
          />
          {this.state.shouldShowLabel && <View style={{ position: 'absolute', top: -7, backgroundColor: 'white', marginStart: 8, zIndex: 1, paddingHorizontal: 4 }}>
            <Text style={{ fontSize: 12, color: '#757575' }}>{this.title}</Text>
          </View>
          }

        </View>
        {this.item.showError && <Text style={[{ ...globalStyles.errorTextStyle, marginTop: 0 }]}>{this.item.requiredText}</Text>}
      </View>
    );
  }
  componentWillUnmount() {
    buttonPressed = false;
  }

  renderSelectedText(props) {
    let count = props.selectedItems.length;
    let isGreater = count > 0;
    if (isGreater !== this.state.shouldShowLabel) {
      this.setState({
        shouldShowLabel: isGreater,
      })
    }
    let textToShow = count > 0 ? "(" + count + " selected)" : this.title;
    return <Text style={{ color: '#757575', fontSize: RFValue(14) }}>{textToShow}</Text>
  }
  getItemList() {
    var arrayList = new Array();
    this.item.content.map((item, index) => {
      let mItem = {
        id: index,
        name: item
      }
      arrayList.push(mItem);
    });
    return [
      {
        children: arrayList
      }
    ]
  }
}
