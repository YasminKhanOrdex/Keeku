import React, { Component } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Colors from '../../../../res/colors';
import * as Constants from '../../../../res/strings';
import LoaderWithoutModal from '../../../../sharedComponents/LoaderWithoutModal';
import NetInfo from '@react-native-community/netinfo';
import * as ApiManager from '../../../../apiManager/ApiManager';
import globalStyles from '../../../../res/styles';
import TitleMenuBar from '../../../../sharedComponents/TitleMenuBar';
import CustomTabView from './CustomTabView';

export default class ListOfRepresentative extends Component {
  constructor(props) {
    super(props);
    this.close = this.close.bind(this);
    this.address = this.props.address;
    this.state = {
      isLoaderVisible: false,
      nationalRepesentatives: [],
      stateRepesentatives: [],
      localRepesentatives: [],
      routes: []
    }
  }

  render() {
    return (
      <SafeAreaView style={[{ ...globalStyles.container, padding: 0 }]} >
        <View style={{ flex: 1 }}>
          <TitleMenuBar title={Constants.your_representative} action={this.close} />
          {this.state.isLoaderVisible ?
            <LoaderWithoutModal /> :
            <CustomTabView routes={this.state.routes}
              action={this.close}
              navigation={this.props.navigation}
              nationalRepesentatives={this.state.nationalRepesentatives}
              stateRepesentatives={this.state.stateRepesentatives}
              localRepesentatives={this.state.localRepesentatives}
            />}
        </View>
      </SafeAreaView>
    );
  }

  close = () => {
    this.props.close();
  }

  showIndicator = () => {
    this.setState({
      isLoaderVisible: true
    })
  };

  hideIndicator = () => {
    this.setState({
      isLoaderVisible: false
    })
  };

  componentDidMount() {
    this.getData();
  }

  getData = () => {
    const onSuccess = (response) => {
      this.filterList(response.data);
    };

    const onFailure = (message) => {
      this.showAlert('', message)
      this.hideIndicator();
    };

    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        this.showIndicator();
        ApiManager.fetchRepresentatives(this.address, true)
          .then(onSuccess)
          .catch(onFailure);
      } else {
        this.showAlert(Constants.network, Constants.please_check_internet);
      }
    });
  }

  filterList = (data) => {
    if (data.length > 0) {
      data.map((item) => {
        if (item.level) {
          if (item.level === 'country') {
            this.state.nationalRepesentatives.push(item);
          } else if (item.level === 'administrativeArea1') {
            this.state.stateRepesentatives.push(item);
          } else if (item.level === 'administrativeArea2' || item.level === 'locality') {
            this.state.localRepesentatives.push(item);
          }
        }
      })
      this.manageTabData();
    } else {
      Alert.alert('', 'No data found!!!', [{ text: 'Ok', onPress: this.close }]);
      this.hideIndicator();
    }
  }

  manageTabData = () => {
    if (this.state.localRepesentatives.length > 0) {
      this.state.routes.push({
        key: 'Local', title: 'Local'
      });
    }
    if (this.state.stateRepesentatives.length > 0) {
      this.state.routes.push({
        key: 'State', title: 'State'
      });
    }
    if (this.state.nationalRepesentatives.length > 0) {
      this.state.routes.push({
        key: 'National', title: 'National'
      });
    }
    this.hideIndicator();
  }

  showAlert = (title, msg) => {
    Alert.alert(title, msg);
  }
}


const styles = StyleSheet.create({

});