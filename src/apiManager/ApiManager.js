import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import environment from '../environment/env';
import * as Constants from '../res/strings';

const ENVIRONMENT_URL = environment.getURL();

const SIGN_UP = '/rest/user/';
const RESEND_ACTIVATION_CODE = '/rest/user/resendActivationCode';
const VERIFY_ACTIVATION_CODE = '/rest/user/activationCodeVerify';
const VERIFY_USERNAME = '/rest/user/checkExistingUserName';
const SET_USERNAME_PASSWORD = '/rest/user/setUserNamePassword';
const AUTHENTICATE = '/rest/auth/authenticate';
const RESET_PASSWORD_LINK = '/rest/user/sendResetPasswordLink';
const RESET_PASSWORD = '/rest/user/resetPassword';
const FETCH_REPRESENTATIVES = '/rest/profiles/reprentativeV1';
const FETCH_CLAIMED_PROFILE = '/rest/profiles/claimed';
const FETCH_CREATED_PROFILE = '/rest/profiles/created';
const FETCH_USER_DETAILS = '/rest/user/getUserDetail';
const CHECK_EXISTING_NUMBER = '/rest/user/checkExistingPhoneNumber';
const SEND_OTP = '/rest/user/sendOTP';
const VERIFY_OTP = '/rest/user/otpVerify';
const TEMPLATE = '/rest/template/';
const SECTIONS = '/rest/template/sections';
const VERIFF_DETAILS = '/rest/user/veriffDetails';
const FETCH_TAG_NAMES = '/rest/search/tag-names';
const CREATE_PAGE = '/rest/profiles/';
const POST_A_REVIEW = "/rest/reviews/";
const FETCH_NOTIFICATION = '/rest/reviews/notification/getNotification';
const TRENDING_REVIEWS = ENVIRONMENT_URL + '/rest/reviews/level/v2';
const SEARCH_USER = ENVIRONMENT_URL + '/rest/search/tag-names';
const PROFILE_DETAIL = ENVIRONMENT_URL + '/rest/profiles/view-profile';
const GET_PROFILE_REVIEW = ENVIRONMENT_URL + '/rest/reviews';
const GET_CONTRIBUTION = ENVIRONMENT_URL + '/rest/reviews/V1/myContribution';
const GET_USER_PROFILE = ENVIRONMENT_URL + '/rest/profiles/mention';
const GET_REVIEW_DETAIL = ENVIRONMENT_URL + '/rest/reviews/nestedReview';
const GET_MENTION_USER = ENVIRONMENT_URL + '/rest/search/tag-names';
const GET_RESPONSE_DETAIL = ENVIRONMENT_URL + '/rest/reviews/v2/responses';
const NOTIFICATION_UPDATEREADFLAG = '/rest/reviews/notification/updateReadFlag';
const FETCH_NOTIFICATION_COUNT = '/rest/reviews/notification/getNotificationCount'
const EDIT_PROFILE_DETAIL = `${ENVIRONMENT_URL}/rest/profiles/profileDetails`;
const UPDATE_PROFILE_DETAIL = `${ENVIRONMENT_URL}/rest/profiles/edit`;
const IMAGE_CONTENT = `${ENVIRONMENT_URL}/rest/reviews/imageContent`;
const ADD_DEVICE_TOKEN = ENVIRONMENT_URL + '/rest/user/pushNotification';
const CLAIM_PROFILE = ENVIRONMENT_URL + '/rest/profiles/claim';


const USERVEB = '/rest/user/userVerb';
axios.defaults.baseURL = ENVIRONMENT_URL;
axios.defaults.headers = { 'Content-type': 'application/json' };

axios.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem(Constants.token)
    if (token && token !== Constants.guestToken) {
      config.headers.Authorization = "Bearer " + token;
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
);

function parseResponse(res, shouldReturnElse) {
  let status = res.status;
  if (status === 200 && (shouldReturnElse || res.data.success === 0)) {
    return res.data;
  } else {
    if (res.data !== undefined) {
      throw res.data;
    } else {
      throw new Error('error has occured');
    }
  }
}

export const signup = (data, shouldReturnElse) => {
  return axios
    .post(SIGN_UP, data)
    .then((data) => { return parseResponse(data, shouldReturnElse) })
    .catch(error => {
      throw error.message;
    });
};

export const resendActivationCode = userId => {
  return axios
    .post(RESEND_ACTIVATION_CODE, null, { params: { userId: userId } })
    .then((data) => { return parseResponse(data, false) })
    .catch(error => {
      throw error.message;
    });
};

export const verifyActivationCode = (userId, activationCode, shouldReturnElse) => {
  const data = {
    userId,
    activationCode
  }

  return axios
    .post(VERIFY_ACTIVATION_CODE, null, { params: { userId: userId, activationCode: activationCode } })
    .then((data) => { return parseResponse(data, shouldReturnElse) })
    .catch(error => {
      throw error.message;
    });
}

export const verifyUsername = text => {
  return axios
    .post(VERIFY_USERNAME, null, { params: { userName: text } })
    .then((data) => { return parseResponse(data, true) })
    .catch(error => {
      throw error.message;
    });
};

export const setUsernamePassword = (data, shouldReturnElse) => {
  return axios
    .post(SET_USERNAME_PASSWORD, data)
    .then((data) => { return parseResponse(data, shouldReturnElse) })
    .catch(error => {
      throw error.message;
    });
};

export const authenticate = (data, shouldReturnElse) => {
  return axios
    .post(AUTHENTICATE, data)
    .then((data) => { return parseResponse(data, shouldReturnElse) })
    .catch(error => {
      throw error.message;
    });
};

export const resetPasswordLink = (data, shouldReturnElse) => {
  return axios
    .post(RESET_PASSWORD_LINK, null, { params: data })
    .then((data) => { return parseResponse(data, shouldReturnElse) })
    .catch(error => {
      throw error.message;
    });
};

export const resetPassword = (data, shouldReturnElse) => {
  return axios
    .post(RESET_PASSWORD, null, { params: data })
    .then((data) => { return parseResponse(data, shouldReturnElse) })
    .catch(error => {
      throw error.message;
    });
}

export const fetchRepresentatives = (text, shouldReturnElse) => {
  return axios
    .get(FETCH_REPRESENTATIVES, { params: { address: text } })
    .then((data) => { return parseResponse(data, shouldReturnElse) })
    .catch(error => {
      throw error.message;
    });
}

export const fetchClaimedProfile = (userId, shouldReturnElse) => {
  return axios.get(FETCH_CLAIMED_PROFILE, { params: { userId: userId } })
    .then((data) => { return parseResponse(data, shouldReturnElse) })
    .catch(error => {
      throw error.message;
    });
}

export const fetchCreatedProfiles = (userId, shouldReturnElse) => {
  return axios.get(FETCH_CREATED_PROFILE, { params: { userId: userId } })
    .then((data) => { return parseResponse(data, shouldReturnElse) })
    .catch(error => {
      throw error.message;
    });
}

export const fetchUserDetails = (userId, shouldReturnElse) => {
  return axios.get(FETCH_USER_DETAILS, { params: { userId: userId } })
    .then((data) => { return parseResponse(data, shouldReturnElse) })
    .catch(error => {
      throw error.message;
    });
}

export const checkExistingNumber = (mobileNumber, shouldReturnElse) => {
  return axios
    .post(CHECK_EXISTING_NUMBER, null, { params: { phoneNumber: mobileNumber } })
    .then((data) => { return parseResponse(data, shouldReturnElse) })
    .catch(error => {
      throw error.message;
    });
}

export const sendOTP = (data, shouldReturnElse) => {
  return axios
    .post(SEND_OTP, null, { params: data })
    .then((data) => { return parseResponse(data, shouldReturnElse) })
    .catch(error => {
      throw error.message;
    });
}

export const verifyOTP = (userId, verificationCode, shouldReturnElse) => {
  return axios
    .post(VERIFY_OTP, null, { params: { userId: userId, otp: verificationCode } })
    .then((data) => { return parseResponse(data, shouldReturnElse) })
    .catch(error => {
      throw error.message;
    });
}

export const fetchCategoryDetails = (myHeaders) => {
  return fetch(ENVIRONMENT_URL + TEMPLATE, {
    headers: myHeaders
  })
    .then((response) => {
      return response.json()
    })
    .catch(error => {
      throw error.message;
    });
}

export const fetchSections = (categoryId, myHeaders) => {
  return fetch(ENVIRONMENT_URL + SECTIONS + '?categoryId=' + categoryId, {
    headers: myHeaders,
  })
    .then((response) => {
      return response.json();
    })
    .catch(error => {
      throw error.message;
    });
}

export const veriffDetails = (userId, sessionId, shouldReturnElse) => {
  return axios
    .post(VERIFF_DETAILS, null, { params: { userId: userId, sessionId: sessionId } })
    .then((data) => { return parseResponse(data, shouldReturnElse) })
    .catch(error => {
      throw error.message;
    });
}

export const fetchTagNames = (text, limit, shouldReturnElse) => {
  return axios
    .get(FETCH_TAG_NAMES, { params: { tagNameSubString: text, limit } })
    .then((data) => { return parseResponse(data, shouldReturnElse) })
    .catch(error => {
      throw error.message;
    });
}

export const postReview = (data, shouldReturnElse) => {
  return axios
    .post(POST_A_REVIEW, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept-Encoding': 'gzip, deflate',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive'
      }
    })
    .then((data) => {
      return parseResponse(data, shouldReturnElse)
    })
    .catch(error => {
      console.log("errorrrr>>>>>>>> ", error);
      throw error.message;
    });
};

export const createPage = (formData, shouldReturnElse) => {
  return axios.post(CREATE_PAGE, formData, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    }
  }).
    then((data) => { return parseResponse(data, shouldReturnElse) })
    .catch(error => {
      throw error.message;
    });
}

// friendlyreminder
export const setVerbDetail = (userId, verbShowingDate, verbFrequency) => {

  return axios
    .put(USERVEB,
      null,
      {
        headers: {
          'Access-Control-Allow-Methods': 'PUT',
          Accept: 'application/json',
          'Content-Type': 'application / json,charset=UTF - 8',
          'Accept-Encoding': 'gzip, deflate',
          Authorization: AsyncStorage.getItem(Constants.token)
        },
        params: {
          userId: userId,
          verbShowingDate: verbShowingDate,
          verbFrequency: verbFrequency
        }
      })
    .then(data => {
      return parseResponse(data);
    })
    .catch(error => {
      console.log(("error >>>>>>>>>> ", error));
      throw error.message;
    });
};


export const fetchNotificationByProfileId = (profileId, start, limit) => {
  return axios
    .get(FETCH_NOTIFICATION, {
      params: {
        profileId: profileId,
        start: start,
        limit: limit
      }
    })
    .then(data => {
      return parseResponse(data);
    })
    .catch(error => {
      throw error.message;
    });
};

export const trendingReviews = (params, myHeaders) => {
  return fetch(TRENDING_REVIEWS + `?level=${params.type}`, {
    headers: myHeaders,
  })
    .then(response => {
      return response.json();
    })
    .catch(error => {
      throw error.message;
    });
}

export const notificationUpdateFlag = (notificationId, isRead) => {
  return axios
    .put(NOTIFICATION_UPDATEREADFLAG, null, {
      headers: {
        'Access-Control-Allow-Methods': 'PUT',
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      params: { notificationId: notificationId, isRead: true }
    })
    .then((data) => { return parseResponse(data) })
    .catch(error => {
      throw error.message;
    });
}

export const fetchNotificationCount = (profileId) => {
  return axios
    .get(FETCH_NOTIFICATION_COUNT, {
      params: {
        profileId: profileId
      }
    })
    .then(data => {
      return parseResponse(data);
    })
    .catch(error => {
      throw error.message;
    });
}

export const searchUser = (params, myHeaders) => {
  return fetch(SEARCH_USER + `?tagNameSubString=${params.text}&limit=${params.limit}`, {
    headers: myHeaders,
  })
    .then(response => {
      return response.json();
    })
    .catch(error => {
      throw error.message;
    });
}

export const profileDetail = (params, myHeaders) => {
  return fetch(PROFILE_DETAIL + `?profileId=${params.id}`, {
    headers: myHeaders,
  })
    .then(response => {
      return response.json();
    })
    .catch(error => {
      throw error.message;
    });
}

export const getProfileReview = (params, myHeaders) => {
  return fetch(GET_PROFILE_REVIEW + `/?profileId=${params.id}&start=${params.start}&end=${params.end}`, {
    headers: myHeaders,
  })
    .then(response => {
      return response.json();
    })
    .catch(error => {
      throw error.message;
    });
}

export const getContribution = (params, myHeaders) => {
  return fetch(GET_CONTRIBUTION + `?byProfileId=${params.id}&start=${params.start}&end=${params.end}`, {
    headers: myHeaders,
  })
    .then(response => {
      return response.json();
    })
    .catch(error => {
      throw error.message;
    });
}

export const getUserProfile = (params, myHeaders) => {
  return fetch(GET_USER_PROFILE + `?tagName=${params.name}`, {
    headers: myHeaders,
  })
    .then(response => {
      return response.json();
    })
    .catch(error => {
      throw error.message;
    });
}

export const getReviewDetails = (params, myHeaders) => {
  return fetch(GET_REVIEW_DETAIL + `?reviewId=${params.reviewId}&responseId=${params.responseId || ''}`, {
    headers: myHeaders,
  })
    .then(response => {
      return response.json();
    })
    .catch(error => {
      throw error.message;
    });
}

export const getResponseDetail = (params, myHeaders) => {
  return fetch(GET_RESPONSE_DETAIL + `?reviewId=${params.reviewId}&responseId=${params.responseId || ''}&start=${params.start}&limit=${params.limit}`, {
    headers: myHeaders,
  })
    .then(response => {
      return response.json();
    })
    .catch(error => {
      throw error.message;
    });
}

export const fatchEditProfileDetails = (params, shouldReturnElse) => {
  return axios.get(`${EDIT_PROFILE_DETAIL}?profileId=${params.profileId}`)
    .then((data) => { return parseResponse(data, shouldReturnElse) })
    .catch(error => {
      throw error.message;
    });
}

export const getMentionUser = (params, myHeaders) => {
  return fetch(GET_MENTION_USER + `?tagNameSubString=${params.tagname}&limit=${params.limit}`, {
    headers: myHeaders,
  })
    .then(response => {
      return response.json();
    })
    .catch(error => {
      throw error.message;
    });
}

export const updateProfileDetails = (data, shouldReturnElse) => {
  return axios
    .post(UPDATE_PROFILE_DETAIL, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept-Encoding': 'gzip, deflate',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive'
      }
    })
    .then((data) => { return parseResponse(data, shouldReturnElse) })
    .catch(error => {
      throw error.message;
    });
}

export const imageContent = (data, shouldReturnElse) => {
  return axios
    .post(IMAGE_CONTENT, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept-Encoding': 'gzip, deflate',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive'
      }
    })
    .then((data) => {
      return parseResponse(data, shouldReturnElse)
    })
    .catch(error => {
      throw error.message;
    });
};

export const addDeviceToken = (userId, deviceToken) => {
  return axios
    .post(ADD_DEVICE_TOKEN, null, { params: { userId: userId, deviceToken: deviceToken } })
    .then((data) => { return parseResponse(data) })
    .catch(error => {
      throw error.message;
    });
}

export const claimProfile = (profileId, userId) => {
  return axios
    .put(CLAIM_PROFILE, null, { params: { profileId: profileId, userId: userId, defaultProfile: true } })
    .then((data) => { return parseResponse(data) })
    .catch(error => {
      throw error.message;
    });
}