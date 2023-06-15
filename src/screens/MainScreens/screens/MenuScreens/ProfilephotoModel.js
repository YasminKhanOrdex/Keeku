import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Modal,
} from 'react-native';
import * as Constants from '../../../../res/strings';
import { RFValue } from 'react-native-responsive-fontsize';
import * as Colors from '../../../../res/colors';
import CameraIcon from '../../../../assets/images/icn_camera_big.svg';
import GalleryIcon from '../../../../assets/images/icn_gallery.svg';
import DeleteIcon from '../../../../assets/images/icn_delete.svg';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfilephotoModel(props) {
  return (
    <Modal transparent={true} visible={props.visible}>
      <TouchableOpacity
        onPress={() => props.close()}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignContent: 'center',
          backgroundColor: '#131313aa',
        }}>
        <SafeAreaView style={styles.modelBottom}>
          <View style={styles.modelStyle}>
            <Text style={styles.txtStyle}>{props.title ? props.title : Constants.profile_photo}</Text>

            <View
              style={{ flexDirection: 'row', marginBottom: RFValue(15) }}>
              {props.showRemoveOption && <TouchableOpacity
                onPress={() => { props.removePhoto() }}
                style={[styles.iconStyleView, { marginLeft: RFValue(10) }]}>
                <DeleteIcon height={RFValue(42)} width={RFValue(42)} />
                <Text style={styles.styleText}>{Constants.remove_photo}</Text>
              </TouchableOpacity>
              }

              <TouchableOpacity
                onPress={() => { props.openGallery() }}
                style={[styles.iconStyleView, { marginLeft: RFValue(25) }]}>
                <GalleryIcon height={RFValue(42)} width={RFValue(42)} />
                <Text style={styles.styleText}>{Constants.gallery}</Text>
              </TouchableOpacity>


              <TouchableOpacity
                onPress={() => { props.imageCapture ? props.openCamera('photo') : props.openCamera() }}
                style={[styles.iconStyleView, { marginLeft: RFValue(35) }]}>
                <CameraIcon height={RFValue(42)} width={RFValue(42)} />
                <Text style={styles.styleText}>{props.imageCapture ? props.imageCapture : Constants.camera}</Text>
              </TouchableOpacity>

              {props.recordVideo && <TouchableOpacity
                onPress={() => { props.openCamera('video') }}
                style={[styles.iconStyleView, { marginLeft: RFValue(35) }]}>
                <CameraIcon height={RFValue(42)} width={RFValue(42)} />
                <Text style={styles.styleText}>{Constants.record_video}</Text>
              </TouchableOpacity>}
            </View>
          </View>
        </SafeAreaView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  btnStyle: {
    height: RFValue(40),
    borderColor: Colors.color_black,
    borderWidth: RFValue(1.5),
    justifyContent: 'center',
    marginHorizontal: RFValue(70),
    marginBottom: RFValue(10),
  },
  txtStyle: {
    fontSize: RFValue(16),
    color: Colors.color_dark_black,
    fontFamily: Constants.font_semibold,
    marginHorizontal: RFValue(10),
    marginTop: RFValue(10),
    marginBottom: RFValue(20),
  },
  styleText: {
    fontSize: RFValue(12),
    color: Colors.color_dark_black,
    fontFamily: Constants.font_semibold,
    marginTop: RFValue(4),
  },
  modelStyle: {
    backgroundColor: Colors.color_white,
    borderRadius: RFValue(4),
    marginHorizontal: RFValue(14),
    height: 'auto',
    width: 'auto',
  },
  modelBottom: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    marginBottom: RFValue(10),
  },
  iconStyleView: {
    flexDirection: 'column',
    alignItems: 'center',
  },
});
