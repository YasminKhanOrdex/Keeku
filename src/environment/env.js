const isProduction = true;
const DEV_URL = 'http://20.41.52.160:8111';
const PROD_URL = 'https://keekuedgeservice.azurewebsites.net';
const DEV_RESET_PASSWORD_URL = 'https://keekuedgeservice.azurewebsites.net/resetPassword/';
const PROD_RESET_PASSWORD_URL = 'https://keekuedgeservice.azurewebsites.net/resetPassword/';

module.exports = {
    getURL: function () { 
        return isProduction ? PROD_URL : DEV_URL;
    },

    getResetPasswordPrefix: function(){
        return isProduction ? PROD_RESET_PASSWORD_URL : DEV_RESET_PASSWORD_URL;
    }
};