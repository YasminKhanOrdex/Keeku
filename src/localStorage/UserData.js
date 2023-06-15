const { default: AsyncStorage } = require("@react-native-async-storage/async-storage");
import * as Constants from '../res/strings';

export const saveUserData = (data) => {
    setData(Constants.userData, data);
};

export const getUserData = () => {
    return getData(Constants.userData);
};

function setData(key, value) {
    let dataToStore = value;
    try {
        AsyncStorage.getItem(key).then((data) => {
            if (data) {
                let previousData = JSON.parse(data);
                Object.assign(previousData, value);
                dataToStore = previousData;
            }
            AsyncStorage.setItem(key, JSON.stringify(dataToStore));
        });
    } catch (error) {
        console.log('Error in saving data : ', error);
    }
}

function getData(key) {
    return AsyncStorage.getItem(key)
        .then((data) => {
            if (data) {
                return JSON.parse(data);
            }
            return data;
        })
        .catch((error) => { console.log('Error in fetching data : ', error) });
}

export const storeDynamicLinkData = async (value) => {
    try {
        await AsyncStorage.setItem(Constants.linkData, value)
    } catch (e) {
        console.log('Error', e)
    }
}

export const getDynamicLinkData = async () => {
    try {
        const value = await AsyncStorage.getItem(Constants.linkData)
        if (value !== null) {
            return value
        }
    } catch (e) {
        console.log('Error', e)
    }
}


export const removeDynamicLinkData = async () => {
    try {
        await AsyncStorage.removeItem(Constants.linkData)
    } catch (e) {
        console.log('Error', e)
    }
}