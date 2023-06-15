import React, { useEffect, useState } from "react";
import { Platform, View, Text } from "react-native";
import ActiveRepresentationIcon from '../../../../assets/images/icn_representation_selected.svg';
import InActiveRepresentationIcon from '../../../../assets/images/icn_representation.svg';
import ActiveSearchIcon from '../../../../assets/images/icn_search_selected.svg';
import InActiveSearchIcon from '../../../../assets/images/icn_search.svg';
import ActivePostAReviewIcon from '../../../../assets/images/icn_post_review_selected.svg';
import InActivePostAReviewIcon from '../../../../assets/images/icn_post_review.svg';
import ActiveNotificationIcon from '../../../../assets/images/icn_notification_selected.svg';
import InActiveNotificationIcon from '../../../../assets/images/icn_notification.svg';
import ActiveMoreIcon from '../../../../assets/images/icn_more_selected.svg';
import InActiveMoreIcon from '../../../../assets/images/icn_more.svg';
import * as UserData from '../../../../localStorage/UserData';
import * as ApiManager from '../../../../apiManager/ApiManager';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';

import { RFValue } from "react-native-responsive-fontsize";
import * as Constants from '../../../../res/strings';

const iconDimension = Platform.OS === 'android' ? RFValue(25) : RFValue(23);


export const BottomMenuItem = (props) => {
  const [profileId, setProfileId] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  let notifCount = 0;
  let tabProp = props.props;

  const isFocused = useIsFocused();

  useEffect(() => {
    tabProp > 9 ? setNotificationCount("9+") : setNotificationCount(tabProp);
    fetchUserData();
  }, [tabProp]);

  const fetchUserData = () => {
    UserData.getUserData()
      .then(data => {
        ApiManager.fetchNotificationCount(data.defaultProfileId)
          .then((data) => {
            tabProp = data.data;
          })
          .catch((error) => {
            console.log(error);
          })
      })
      .catch(error => {
        console.log('error while getting data from local storage');
      });
  }

  function getIconSelected(tab, notifCount) {

    let iconSelected = {
      TabRepresentative: <ActiveRepresentationIcon width={iconDimension} height={iconDimension} />,
      TabSearch: <ActiveSearchIcon width={iconDimension} height={iconDimension} />,
      TabPostAReview: <ActivePostAReviewIcon width={iconDimension} height={iconDimension} />,
      TabNotification: <View>
        <ActiveNotificationIcon width={iconDimension} height={iconDimension} />
        <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center', backgroundColor: '#131313', position: 'absolute', top: 0, right: 0, width: RFValue(13), height: RFValue(13), borderRadius: RFValue(13) }}>
          <Text style={{ fontSize: RFValue(9), color: 'white', fontFamily: Constants.font_semibold, }}>{notificationCount}</Text>
        </View>
      </View>,
      TabMore: <ActiveMoreIcon width={iconDimension} height={iconDimension} />,
    };
    return iconSelected[tab];
  }

  function getIconNotSelected(tab, notifCount) {

    let iconNotSelected = {
      TabRepresentative: <InActiveRepresentationIcon width={iconDimension} height={iconDimension} />,
      TabSearch: <InActiveSearchIcon width={iconDimension} height={iconDimension} />,
      TabPostAReview: <InActivePostAReviewIcon width={iconDimension} height={iconDimension} />,
      TabNotification:
        <View>
          <InActiveNotificationIcon width={iconDimension} height={iconDimension} />
          <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center', backgroundColor: '#131313', position: 'absolute', top: 0, right: 0, width: RFValue(13), height: RFValue(13), borderRadius: RFValue(13) }}>
            <Text style={{ fontSize: RFValue(8), color: 'white', fontFamily: Constants.font_semibold, }}>{notificationCount}</Text>
          </View>
        </View>
      ,
      TabMore: <InActiveMoreIcon width={iconDimension} height={iconDimension} />,
    };

    return iconNotSelected[tab];
  }

  return (

    <View
      style={{
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {props?.isCurrent ? getIconSelected(props.tabName) : getIconNotSelected(props.tabName)}

    </View>

  );
};