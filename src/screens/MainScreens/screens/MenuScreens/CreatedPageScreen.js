import React, { Component } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import BackMenuBar from '../../../../sharedComponents/BackMenuBar';
import * as Colors from '../../../../res/colors';
import * as Constants from '../../../../res/strings';
import UserIcon from '../../../../assets/images/icn_user.svg';

export default class CreatedPageScreen extends Component {

  constructor(props){
    super(props);
    this.onBackPress = this.onBackPress.bind(this);
    this.state={
      createdProfiles : props.route.params.listOfData,
    }
  }

  render() {
    return (
        <View style={styles.container}>       
          <BackMenuBar 
            title={Constants.created_pages}
            action={this.onBackPress}/>

          <FlatList
            style={{flex : 1}}
            data={this.state.createdProfiles}
            renderItem={item => this.renderItemComponent(item)}
            keyExtractor={(item, index) => index.toString()}
            ItemSeparatorComponent={() => this.displayDivider()}
          />
        </View>
    );
  }

  componentWillUnmount(){
    this.props.route.params.callBack();
  }

  displayDivider(){
    return <View
      style={{
        borderBottomColor: '#D0D0D0',
        borderBottomWidth: 1
      }}
    />
  }

  renderItemComponent(item){
    let mItem = item.item;
    let profileImage = mItem.profileImage;

    return <TouchableOpacity activeOpacity={1} onPress={() => this.goToEditProfile(mItem.profileId)}>
      <View style={styles.horizontalItemContainer}>
        <View style={styles.profileImageContainer}>
          {profileImage ? <Image style={styles.profileImageStyle} source={{uri : profileImage}}/> : <UserIcon height={RFValue(25)} width={RFValue(25)}/>}
        </View>
        <View style ={{marginStart : RFValue(15)}}>
          <Text style={styles.profileNameStyle}>{mItem.profileName}</Text>
          <Text style={styles.tagNameStyle}>@{mItem.tagName}</Text>
        </View>
      </View>
    </TouchableOpacity>
  }

  onBackPress(){
    this.props.navigation.goBack();
  }

  goToEditProfile (profileId) {
    this.props.navigation.navigate(Constants.screen_profile, { id: profileId, isEditProfile: true });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor : Colors.color_white
  }, 
  horizontalItemContainer : {
    flexDirection : 'row', 
    alignItems : 'center', 
    margin : RFValue(13)
  },
  tagNameStyle : {
    fontFamily : Constants.font_regular,
    fontSize : RFValue(14),
    color : Colors.color_gray
  },
  profileNameStyle : { 
    fontFamily : Constants.font_regular, 
    fontSize : RFValue(16),
    color : Colors.color_black
  },
  profileImageContainer : {
    height : RFValue(45),
    width : RFValue(45),
    borderRadius : RFValue(45),
    alignItems : 'center',  
    justifyContent : 'center',
    backgroundColor : Colors.color_user_bg
  },
  profileImageStyle : {
    width : RFValue(45),
    height : RFValue(45),
    borderRadius : RFValue(45)
  },
});