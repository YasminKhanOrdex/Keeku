import React, {Component} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import * as Colors from './../res/colors';
import * as Constants from './../res/strings';
import BackMenuBar from './BackMenuBar';
import DatePickerComponent from './DatePickerComponent';
import KeekuUsernameComponent from './KeekuUsernameComponent';
import RadioGroupComponent from './RadioGroupComponent';
import TextAreaComponent from './TextAreaComponent';
import TextInputComponent from './TextInputComponent';
import TextInputEmailComponent from './TextInputEmailComponent';
import DropdownComponent from './DropdownComponent';
import CheckBoxComponnet from './CheckBoxComponent';
import MultiValueTextBoxComponent from './MultiValueTextBoxComponent';
import IconAdd from './../assets/images/icn_add_section.svg';
import IconRemove from './../assets/images/icn_remove_section.svg';
import CreatePageModal from './CreatePageModal';
import NetInfo from '@react-native-community/netinfo';
import * as ApiManager from '../apiManager/ApiManager';
import Loader from '../sharedComponents/Loader';
import {StackActions} from '@react-navigation/routers';
import * as UserData from '../localStorage/UserData';
import axios from 'axios';

const utils = require('./../utils/Utils');

const ElementList = {
  textbox: 'Textbox',
  email: 'Email',
  radiobutton: 'Radio Button',
  datepicker: 'Date Picker',
  dropdown: 'Dropdown',
  checkbox: 'Checkbox',
  multivaluetextbox: 'Multivalue Textbox',
  textarea: 'Textarea',
  keekuusername: 'CitizeX Username',
};

export default class DetailsForm extends Component {
  constructor(props) {
    super(props);
    this.onBackPress = this.onBackPress.bind(this);
    this.saveItemToState = this.saveItemToState.bind(this);
    this.saveItemToStateMultiple = this.saveItemToStateMultiple.bind(this);
    this.params = this.props.route.params;
    this.componentHeight = this.params.componentHeight;
    this.jsonPayload = this.params.jsonPayload;
    this.isIndividual =
      this.jsonPayload.profileDTO.categories[0].name === 'Individual'
        ? true
        : false;
    this.profileDTO = this.jsonPayload.profileDTO;
    this.selectedCategoryData = this.profileDTO.categories[0];
    this.sectionNumber = this.params.sectionNumber;
    this.totalSections = this.params.totalSections;
    this.isLastScreen = this.totalSections === this.sectionNumber + 1;
    this.state = {
      fields: null,
      subSections: [],
      isValidEmail: true,
      showCreatePageModal: false,
      isLoaderVisible: false,
      finalSectionNumber: 0,
      isFromSection: true,
      state: '',
      city: [],
      office: [],
      finalJSON: {},
    };
    this.currentSubcategoryIndex = 0;
    this.currentSection = this.getSection();
    this.state.fields = this.getFieldsByOrder();
    this.title = this.currentSection.name;
    this.firstLogin = '';
    this.fetchUserData();
  }

  fetchUserData() {
    UserData.getUserData()
      .then(data => {
        if (data !== null) {
          this.firstLogin = data.firstLogIn;
        }
      })
      .catch(error => {
        console.log('error while getting data from local storage');
      });
  }

  getSection() {
    let mainSectionCount = this.selectedCategoryData.sections.length;
    let tempSectionCount = mainSectionCount;
    if (mainSectionCount > this.sectionNumber) {
      this.state.isFromSection = true;
      this.state.finalSectionNumber = this.sectionNumber;
      return this.selectedCategoryData.sections[this.sectionNumber];
    } else {
      let extractNumberCount = mainSectionCount;
      let subCategoryArray = this.selectedCategoryData.subCategories;
      for (i = 0; i < subCategoryArray.length; i++) {
        let subCategory = subCategoryArray[i];
        let subSectionArray = subCategory.sections;
        let subSectionArraySize = subSectionArray ? subSectionArray.length : 0;
        tempSectionCount += subSectionArraySize;
        if (tempSectionCount > this.sectionNumber) {
          let updatedSectionNumber = this.sectionNumber - extractNumberCount;
          this.state.isFromSection = false;
          this.state.finalSectionNumber = updatedSectionNumber;

          this.currentSubcategoryIndex = i;
          return subSectionArray[updatedSectionNumber];
        } else {
          extractNumberCount += subSectionArraySize;
        }
      }
    }
  }

  getFieldsByOrder() {
    let fields = JSON.parse(JSON.stringify(this.currentSection.fields));
    let sortedFields = fields.sort((a, b) => a.displayOrder >= b.displayOrder);
    sortedFields.map(item => {
      item.showError = false;
      if (item.value && item.value !== null) {
        item.value = null;
      }
      return item;
    });
    return sortedFields;
    //return this.currentSection.fields.sort((a, b) => a.displayOrder >= b.displayOrder);
  }

  render() {
    return (
      <View style={styles.mainContainer}>
        <BackMenuBar title={this.title} action={this.onBackPress} />
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior="padding"
          enabled={true}
          keyboardVerticalOffset={0}>
          <ScrollView style={styles.scrollContainer}>
            {this.currentSection.allowMultiple
              ? this.renderMultipleFields()
              : this.renderFields()}
          </ScrollView>
        </KeyboardAvoidingView>
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.btnNextStyle}
            onPress={() => {
              this.currentSection.allowMultiple
                ? this.validateMultipleFields()
                : this.validateFields();
              //this.validateFields()
            }}>
            <Text style={styles.btnNextTextStyle}>
              {this.isLastScreen ? Constants.create : Constants.next}
            </Text>
          </TouchableOpacity>
        </View>
        {this.state.showCreatePageModal && (
          <CreatePageModal
            visible={this.state.showCreatePageModal}
            close={this.hideModal.bind(this)}
          />
        )}
        {this.state.isLoaderVisible && <Loader />}
      </View>
    );
  }

  renderFields() {
    return this.state.fields.map(item => {
      if (item.title === 'state') {
        item.content = [
          'California',
          'Iowa',
          'New York',
          'New Jersey',
          'Massachusetts',
          'Connecticut',
          'Florida',
          'Texas',
          'Armed Forces US',
          'Tennessee',
          'Kentucky',
          'Georgia',
          'Illinois',
          'Colorado',
          'Utah',
          'Maryland',
          'South Carolina',
          'Montana',
          'Louisiana',
          'Washington',
          'Pennsylvania',
          'North Carolina',
          'Michigan',
          'Arkansas',
          'Wisconsin',
          'Ohio',
          'New Mexico',
          'Kansas',
          'Oregon',
          'Nebraska',
          'West Virginia',
          'Virginia',
          'Missouri',
          'Mississippi',
          'Rhode Island',
          'Indiana',
          'Oklahoma',
          'Minnesota',
          'Alabama',
          'Arizona',
          'South Dakota',
          'Nevada',
          'New Hampshire',
          'Maine',
          'Hawaii',
          'District of Columbia',
          'Delaware',
          'Idaho',
          'Wyoming',
          'North Dakota',
          'Vermont',
          'Alaska',
          'Guangdong',
        ];
      } else if (item.title === 'city') {
        item.content = this.state.city;
      } else if (item.title == 'office name') {
        item.content = this.state.office;
      }

      switch (item.elementType) {
        case ElementList.textbox:
          return (
            <TextInputComponent
              component={item}
              saveItemToState={this.saveItemToState}
              componentHeight={this.componentHeight}
            />
          );
        case ElementList.textarea:
          return (
            <TextAreaComponent
              component={item}
              saveItemToState={this.saveItemToState}
            />
          );
        case ElementList.email:
          return (
            <TextInputEmailComponent
              component={item}
              saveItemToState={this.saveItemToState}
            />
          );
        case ElementList.radiobutton:
          return (
            <RadioGroupComponent
              component={item}
              saveItemToState={this.saveItemToState}
            />
          );
        case ElementList.datepicker:
          return (
            <DatePickerComponent
              component={item}
              saveItemToState={this.saveItemToState}
            />
          );
        case ElementList.keekuusername:
          return (
            <KeekuUsernameComponent
              component={item}
              saveItemToState={this.saveItemToState}
              componentHeight={this.componentHeight}
            />
          );
        case ElementList.dropdown:
          if (item.multiselect === 'No')
            return (
              <DropdownComponent
                component={item}
                saveItemToState={this.saveItemToState}
                componentHeight={this.componentHeight}
              />
            );
          else
            return (
              <CheckBoxComponnet
                component={item}
                saveItemToState={this.saveItemToState}
              />
            );
        case ElementList.checkbox:
          return (
            <CheckBoxComponnet
              component={item}
              saveItemToState={this.saveItemToState}
            />
          );
        case ElementList.multivaluetextbox:
          return (
            <MultiValueTextBoxComponent
              component={item}
              saveItemToState={this.saveItemToState}
              componentHeight={this.componentHeight}
            />
          );
      }
    });
  }

  renderSubSectionFields(fields, index) {
    return fields.map(item => {
      switch (item.elementType) {
        case ElementList.textbox:
          return (
            <TextInputComponent
              component={item}
              saveItemToState={this.saveItemToStateMultiple}
              componentHeight={this.componentHeight}
              index={index + 1}
            />
          );
        case ElementList.textarea:
          return (
            <TextAreaComponent
              component={item}
              saveItemToState={this.saveItemToStateMultiple}
              index={index + 1}
            />
          );
        case ElementList.email:
          return (
            <TextInputEmailComponent
              component={item}
              saveItemToState={this.saveItemToStateMultiple}
              index={index + 1}
            />
          );
        case ElementList.radiobutton:
          return (
            <RadioGroupComponent
              component={item}
              saveItemToState={this.saveItemToStateMultiple}
              index={index + 1}
            />
          );
        case ElementList.datepicker:
          return (
            <DatePickerComponent
              component={item}
              saveItemToState={this.saveItemToStateMultiple}
              index={index + 1}
            />
          );
        case ElementList.keekuusername:
          return (
            <KeekuUsernameComponent
              component={item}
              saveItemToState={this.saveItemToStateMultiple}
              componentHeight={this.componentHeight}
              index={index + 1}
            />
          );
        case ElementList.dropdown:
          if (item.multiselect === 'No')
            return (
              <DropdownComponent
                component={item}
                saveItemToState={this.saveItemToState}
                componentHeight={this.componentHeight}
                index={index + 1}
              />
            );
          else
            return (
              <CheckBoxComponnet
                component={item}
                saveItemToState={this.saveItemToState}
                index={index + 1}
              />
            );
        case ElementList.checkbox:
          return (
            <CheckBoxComponnet
              component={item}
              saveItemToState={this.saveItemToStateMultiple}
              index={index + 1}
            />
          );
      }
    });
  }

  renderMultipleFields() {
    return (
      <View>
        <View style={styles.allowMultipleViewContainer}>
          <View style={{marginEnd: RFValue(50)}}>
            <Text
              style={[
                {...styles.textStyle, fontFamily: Constants.font_semibold},
              ]}>
              {this.title}
            </Text>
            <Text
              style={[
                {...styles.textStyle, fontFamily: Constants.font_regular},
              ]}>
              {this.currentSection.hintText}
            </Text>
          </View>
          {this.getIconAdd()}
        </View>
        {this.renderFields()}
        {this.renderSubSections()}
      </View>
    );
  }

  renderSubSections() {
    return this.state.subSections.map((section, index) => {
      return this.renderSection(section.fields, index);
    });
  }

  renderSection(fields, index) {
    return (
      <View>
        {this.displayDivider()}
        {this.getIconRemove(index)}
        {this.renderSubSectionFields(fields, index)}
      </View>
    );
  }

  displayDivider() {
    return <View style={styles.divider} />;
  }

  getIconAdd() {
    return (
      <TouchableOpacity
        style={styles.addSectionStyle}
        onPress={() => {
          this.addSection();
        }}>
        <IconAdd width={RFValue(25)} height={RFValue(25)} />
      </TouchableOpacity>
    );
  }

  getIconRemove(index) {
    return (
      <TouchableOpacity
        style={styles.removeSectionStyle}
        onPress={() => {
          this.removeSection(index);
        }}>
        <IconRemove width={RFValue(25)} height={RFValue(25)} />
      </TouchableOpacity>
    );
  }

  addSection() {
    const sectionToAdd = this.getNewSectionToAdd();
    let subSections = this.state.subSections;
    subSections.push(sectionToAdd);
    this.setState({
      subSections,
    });
  }

  removeSection(index) {
    let subSections = this.state.subSections;
    delete subSections[index];
    this.setState({
      subSections,
    });
  }

  getNewSectionToAdd() {
    return {
      sectionId: null,
      name: null,
      displayOrder: null,
      allowMultiple: false,
      hintText: null,
      forAdmin: false,
      fields: this.getFieldsByOrder(),
    };
  }

  async selectState(value) {
    this.showIndicator();
    let cityData = await axios.get(
      `http://20.41.52.160:8111/rest/profiles/city?stateId=${value}`,
    );
    let officeData = await axios.get(
      `http://20.41.52.160:8111/rest/profiles/officeName?city=${value}`,
    );
    let cityArray = [];
    cityData.data.data.forEach(city => {
      cityArray.push(city.name);
    });
    this.setState({
      city: cityArray,
      office: officeData.data.data,
    });
    this.hideIndicator();
  }

  saveItemToState(item) {
    if (item.title === 'state') {
      this.selectState(item.value);
    }
    let fieldId = item.fieldId;
    const updatedFields = this.state.fields.map(mItem => {
      if (mItem.fieldId === fieldId) {
        return item;
      }
      return mItem;
    });
    this.setState({
      fields: updatedFields,
    });
  }

  saveItemToStateMultiple(item, index) {
    let fieldId = item.fieldId;
    let subSections = this.state.subSections;
    let section = subSections[index];
    let fields = section.fields;
    const updatedFields = fields.map(mItem => {
      if (mItem.fieldId === fieldId) {
        return item;
      }
      return mItem;
    });
    subSections[index].fields = updatedFields;
    this.setState({
      subSections,
    });
  }

  onBackPress() {
    this.props.navigation.goBack();
  }

  gotoNextScreen() {
    this.props.navigation.push(this.params.formDetailsScreen, {
      jsonPayload: this.getUpdatedJsonPayload(),
      sectionNumber: this.sectionNumber + 1,
      totalSections: this.totalSections,
      componentHeight: this.componentHeight,
      formDetailsScreen: this.params.formDetailsScreen,
    });
  }

  gotoMainScreen() {
    const count = this.sectionNumber + 2;
    const popAction = StackActions.pop(count);
    this.props.navigation.dispatch(popAction);
    this.props.navigation.navigate(Constants.screen_dashboard);
  }

  getUpdatedJsonPayload() {
    let initialJsonPayload = JSON.parse(JSON.stringify(this.jsonPayload));
    if (this.state.isFromSection) {
      initialJsonPayload.profileDTO.categories[0].sections[
        this.state.finalSectionNumber
      ].fields = this.state.fields;
      if (this.currentSection.allowMultiple) {
        initialJsonPayload.profileDTO.categories[0].sections[
          this.state.finalSectionNumber
        ].subSections = this.state.subSections;
      }
    } else {
      initialJsonPayload.profileDTO.categories[0].subCategories[
        this.currentSubcategoryIndex
      ].sections[this.state.finalSectionNumber].fields = this.state.fields;
      if (this.currentSection.allowMultiple) {
        initialJsonPayload.profileDTO.categories[0].subCategories[
          this.currentSubcategoryIndex
        ].sections[this.state.finalSectionNumber].subSections =
          this.state.subSections;
      }
    }
    return initialJsonPayload;
  }

  validateFields() {
    let isAllValid = true;
    let modifiedFields = this.state.fields.map(item => {
      if (item.required === 'Yes' && !item.value) {
        item.showError = true;
        isAllValid = false;
      }
      return item;
    });
    if (isAllValid) {
      this.isLastScreen ? this.showModal() : this.gotoNextScreen();
    } else {
      this.setState({
        fields: modifiedFields,
      });
    }
  }

  onCreatePage(type) {
    let tempJsonPayload = this.getUpdatedJsonPayload();
    let dataToPass = this.getModifiedJSON(tempJsonPayload);
    dataToPass.profileDTO.claimedFlag =
      type === Constants.CREATE_AND_CLAIM ? 'Y' : 'N';
    dataToPass.profileDTO.claimedUserId =
      type === Constants.CREATE_AND_CLAIM
        ? this.jsonPayload.profileDTO.createdBy
        : null;
    const formData = new FormData();
    formData.append('imageFile', dataToPass.imageFile);
    formData.append('profileDTO', JSON.stringify(dataToPass.profileDTO));

    this.setState({finalJSON: dataToPass.profileDTO});
    console.log(
      'Final Data =============',
      JSON.stringify(dataToPass.profileDTO),
    );
    this.callCreatePageAPI(formData);
  }

  validateMultipleFields() {
    let isAllValidFields = true;
    let isAllValidSubSections = true;

    let modifiedFields = this.state.fields;
    modifiedFields.map(item => {
      if (item.required === 'Yes' && !item.value) {
        item.showError = true;
        isAllValidFields = false;
      }
      return item;
    });

    let modifiedSubSections = this.state.subSections;
    modifiedSubSections.map(item => {
      if (item) {
        item.fields.map(mItem => {
          if (mItem.required === 'Yes' && !mItem.value) {
            mItem.showError = true;
            isAllValidSubSections = false;
          }
          return mItem;
        });
        return item;
      }
    });

    if (isAllValidFields && isAllValidSubSections) {
      this.isLastScreen ? this.showModal() : this.gotoNextScreen();
    } else if (isAllValidFields && !isAllValidSubSections) {
      this.setState({subSections: modifiedSubSections});
    } else if (!isAllValidFields && isAllValidSubSections) {
      this.setState({fields: modifiedFields});
    } else if (!isAllValidFields && !isAllValidSubSections) {
      this.setState({
        fields: modifiedFields,
        subSections: modifiedSubSections,
      });
    }
  }

  // createPage(type){
  //     this.jsonPayload.profileDTO.claimedFlag = type === Constants.CREATE_AND_CLAIM ? 'Y' : 'N';
  //     this.jsonPayload.profileDTO.claimedUserId = type === Constants.CREATE_AND_CLAIM ? this.jsonPayload.profileDTO.createdBy : null;
  //     let dataToPass = this.getModifiedJSON();
  //     console.log('data to pass : ', JSON.stringify(dataToPass));
  //     const formData = new FormData();
  //     formData.append('imageFile', dataToPass.imageFile);
  //     formData.append('profileDTO',JSON.stringify(dataToPass.profileDTO));
  //     this.callCreatePageAPI(formData);
  // }

  getModifiedJSON(jsonPayload) {
    let updatedJsonpayload = this.getDeepCopyObject(jsonPayload);
    return this.removeExtraAddedVariables(updatedJsonpayload);
  }

  removeExtraAddedVariables(data) {
    let categories = data.profileDTO.categories;

    //remove isSelected variable from categories array
    categories.map(item => {
      delete item.isSelected;
    });

    //remove isSelected variable and showError variable from subCategories array
    //remove subcategory if sections is null
    let subCategories = categories[0].subCategories;

    subCategories.map((item, index) => {
      delete item.isSelected;
      delete item.fetchAllSectionsFromAPI;

      if (item.sections) {
        item.sections.map(sItem => {
          sItem.fields.map(mItem => {
            delete mItem.showError;
          });
          if (sItem.subSections && sItem.subSections.length > 0) {
            sItem.subSections.map(ssItem => {
              ssItem.fields.map(ssmItem => {
                delete ssmItem.showError;
              });
            });
          }
        });
      } else {
        subCategories.splice(index, 1);
      }
    });

    //remove showError variable from sections array
    let sections = categories[0].sections;
    sections.map(item => {
      item.fields.map(mItem => {
        delete mItem.showError;
      });
      if (item.subSections && item.subSections.length > 0) {
        item.subSections.map(ssItem => {
          ssItem.fields.map(ssmItem => {
            delete ssmItem.showError;
          });
        });
      }
    });

    return data;
  }

  callCreatePageAPI(formData) {
    const onSuccess = response => {
      this.hideIndicator();

      if (this.firstLogin) {
        UserData.getUserData().then(data => {
          data.defaultProfileId = response.data.profileId;
          UserData.saveUserData(data);
        });
      }
      if (response.success === 0) {
        this.gotoMainScreen();
        Alert.alert(Constants.success, response.message);
      }
    };

    const onFailure = message => {
      this.hideIndicator();
    };

    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        this.showIndicator();
        ApiManager.createPage(formData, true).then(onSuccess).catch(onFailure);
      } else {
        Alert.alert(Constants.network, Constants.please_check_internet);
      }
    });
  }

  hideModal(type) {
    this.setState({showCreatePageModal: false});
    if (type) {
      this.onCreatePage(type);
    }
  }

  showModal() {
    if (this.firstLogin) {
      this.onCreatePage(Constants.CREATE_AND_CLAIM);
    } else if (this.isIndividual) {
      this.onCreatePage(Constants.JUST_CREATE);
    } else {
      this.setState({showCreatePageModal: true});
    }
  }

  showIndicator = () => {
    this.setState({
      isLoaderVisible: true,
    });
  };

  hideIndicator = () => {
    this.setState({
      isLoaderVisible: false,
    });
  };

  getDeepCopyObject(item) {
    return JSON.parse(JSON.stringify(item));
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.color_white,
  },
  btnNextTextStyle: {
    color: Colors.color_white,
    fontSize: RFValue(14),
    fontFamily: Constants.font_semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  bottomContainer: {
    justifyContent: 'center',
    paddingBottom: RFValue(15),
    marginHorizontal: RFValue(16),
  },
  scrollContainer: {
    flex: 1,
    marginHorizontal: RFValue(16),
    marginVertical: RFValue(10),
  },
  btnNextStyle: {
    height: RFValue(40),
    width: '100%',
    backgroundColor: Colors.color_black,
    borderRadius: RFValue(5),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  errorTextStyle: {
    color: Colors.color_red_border,
    fontFamily: Constants.font_regular,
    fontSize: RFValue(14),
  },
  categoryContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: RFValue(8),
  },
  categoryText: {
    marginHorizontal: RFValue(16),
    fontFamily: Constants.font_regular,
    fontSize: RFValue(16),
    flex: 1,
  },
  radioButtonOuterSide: {
    height: RFValue(20),
    width: RFValue(20),
    borderRadius: RFValue(20),
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInnerSide: {
    height: RFValue(10),
    width: RFValue(10),
    borderRadius: RFValue(10),
    backgroundColor: Colors.color_black,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.color_black,
    marginVertical: RFValue(15),
  },
  addSectionStyle: {
    position: 'absolute',
    right: 0,
    width: RFValue(40),
    height: RFValue(40),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.color_black,
    borderRadius: RFValue(5),
  },
  removeSectionStyle: {
    width: RFValue(40),
    height: RFValue(40),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.color_black,
    borderRadius: RFValue(5),
    alignSelf: 'flex-end',
    marginBottom: RFValue(5),
  },
  allowMultipleViewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: RFValue(10),
  },
  textStyle: {
    color: Colors.color_black,
    fontSize: RFValue(15),
  },
});
