import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TextInput, Platform, TouchableOpacity, Text, FlatList, BackHandler, Image, Alert, StatusBar } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import * as Colors from '../../../res/colors';
import * as Constants from './../../../res/strings';
import SearchIcon from '../../../assets/images/icon_search.svg';
import BackIcon from '../../../assets/images/icon_arrow.svg';
import SearchScreenTabView from './SearchScreens/SearchScreenTabView';
import * as ApiManager from '../../../apiManager/ApiManager'
import GreenTick from '../../../assets/images/icn_green_tick.svg';
import ProfileMenuBar from '../../../sharedComponents/ProfileMenuBar'
import UserIcon from '../../../assets/images/icn_user.svg';

const iconDimension = Platform.OS === 'android' ? RFValue(20) : RFValue(20);

export default function SearchScreen(props) {
  const [searchToggle, setSearchToggle] = useState(false)
  const [searchList, setSearchList] = useState([])
  const [value, setValue] = useState('')

  const navigationHandle = () => {
    setSearchToggle(false);
    setValue('');
    setSearchList([]);
  }
  useEffect(() => {
    const backAction = () => {
      if (searchToggle == true) {
        navigationHandle()
        return true
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const serchUser = (text) => {
    setValue(text)
    let params = {
      text: text,
      limit: 5
    }
    var myHeaders = new Headers();
    myHeaders.append("Content-type", "application/json");
    ApiManager.searchUser(params, myHeaders)
      .then(success => {
        let data = success.data;
        setSearchList(data)
      })
      .catch(error => {
        console.log(error);
      });
  }

  const SerchListRender = (item) => {
    return (
      <TouchableOpacity
        style={[styles.rowCenterStyle, { paddingHorizontal: RFValue(15) }]}
        onPress={() => props.navigation.navigate(Constants.screen_profile, { id: item.profileId })}
      >
        <View style={styles.ImageContainer}>
          {item.profileImage ?
            <Image style={styles.profileImageStyle} source={{ uri: item.profileImage }} />
            :
            <UserIcon height={RFValue(30)} width={RFValue(30)} />
          }
        </View>

        <View style={{ marginHorizontal: RFValue(10) }}>
          <View style={styles.rowCenterStyle}>
            <Text style={styles.reviewUserName}>{item.profileName}</Text>
            <GreenTick
              width={RFValue(13)}
              height={RFValue(13)}
              style={{ marginLeft: RFValue(8) }}
            />
          </View>
          <Text style={styles.reviewTagname}>@{item.tagName}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <View style={styles.searchBox}>
        {searchToggle ? (
          <TouchableOpacity onPress={() => { setSearchToggle(false), setValue(''), setSearchList([]) }}>
            <BackIcon style={styles.backIcon} fill={'#131313'} width={iconDimension} height={iconDimension} />
          </TouchableOpacity>
        ) : null}
        <TextInput
          style={[
            { ...styles.txtInputStyle },
            { paddingLeft: searchToggle ? RFValue(10) : RFValue(40) },
            { marginRight: searchToggle ? RFValue(10) : null }
          ]}
          value={value}
          placeholder={Constants.search_here}
          mode='outlined'
          returnKeyType='done'
          onPressIn={() => setSearchToggle(true)}
          onChangeText={(val) => serchUser(val)}
        />
        {searchToggle ? null : (
          <SearchIcon style={styles.searchIcon} width={iconDimension} height={iconDimension} />
        )}

        {searchToggle ? null : (
          <View style={{ marginHorizontal: RFValue(5) }}>
            <ProfileMenuBar
              navigation={props.navigation}
              gotoLogin={props.screenProps.gotoLogin}
              gotoSignUp={props.screenProps.gotoSignUp}
              logout={props.screenProps.logout}
              hideIndicator={() => null}
              showIndicator={() => null}
              gotoMoreTab={() => props.navigation.navigate(Constants.tab_more)}
              gotoBasicDetailScreen={() => null}
            />
          </View>
        )}
      </View>

      {searchToggle ? (
        <View style={{ backgroundColor: Colors.color_white, flex: 1, paddingBottom: RFValue(60) }}>
          {searchList.length > 0
            ?
            <FlatList
              data={searchList}
              style={{ marginTop: RFValue(10) }}
              renderItem={({ item, index }) => SerchListRender(item)}
              keyExtractor={(item, index) => index.toString()}
              ItemSeparatorComponent={() => <View style={styles.itemSeparatorStyle} />}
            />
            :
            <Text style={styles.searchFixText}>
              {Constants.try_searching_for_people_topic_or_keywords}
            </Text>}

        </View>
      ) : (
        <View style={{ backgroundColor: Colors.color_white, flex: 1, paddingBottom: RFValue(60) }}>
          <SearchScreenTabView />
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.color_white,
  },
  searchBox: {
    flexDirection: 'row',
    marginLeft: RFValue(10),
    marginTop: RFValue(10),
    alignItems: 'center',
  },
  searchFixText: {
    paddingVertical: RFValue(20),
    color: Colors.color_gray,
    fontFamily: Constants.font_semibold,
    fontSize: RFValue(12),
    textAlign: 'center'
  },
  backIcon: {
    marginVertical: RFValue(10),
    marginRight: RFValue(10)
  },
  searchIcon: {
    position: 'absolute',
    alignSelf: 'center',
    left: RFValue(12),
  },
  txtInputStyle: {
    backgroundColor: Colors.color_user_bg,
    height: RFValue(40),
    flex: 1,
    width: '100%',
    borderRadius: RFValue(10),
    fontSize: RFValue(16),
  },
  reviewTagname: {
    fontSize: RFValue(14),
    fontFamily: Constants.font_regular,
    color: Colors.color_gray,
  },
  reviewUserName: {
    fontSize: RFValue(16),
    fontFamily: Constants.font_regular,
    color: Colors.color_black,
  },
  rowCenterStyle: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  ImageContainer: {
    height: RFValue(45),
    width: RFValue(45),
    borderRadius: RFValue(45) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.color_user_bg
  },
  itemSeparatorStyle: {
    borderWidth: 0.5,
    borderColor: Colors.color_gray,
    width: '90%',
    alignSelf: 'center',
    marginVertical: RFValue(8)
  },
  profileImageStyle: {
    width: RFValue(45),
    height: RFValue(45),
    borderRadius: RFValue(45) / 2
  },
});