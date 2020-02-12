'use strict';

module.exports = function(environment , appConfig) {
  var ENV = {
    featureFlags: {
      'editor-html-paste': true
    }
  };

  if (environment === 'production') {
    ENV.featureFlags['editor-html-paste'] = false;
  }
  return ENV;;
};
