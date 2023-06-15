module.exports = {
  validateField: function (text, regex) {
    return !regex.test(text);
  },

  getAcronym: function (fullName) {
    var matches = fullName.match(/\b(\w)/g);
    var acronym =  matches.join('').toUpperCase();
    return acronym.substr(0,2);
  },

  getNumericString: function(text) {
    var numberPattern = /\d+/g;
    var matches = text.match(numberPattern);
    var theNum = '';
    if(matches){
      theNum = matches.join('');
    }
    return theNum;
  }
};
