'use strict';

module.exports = function(environment) {
  var ENV = {
    featureFlags: {
      'editor-html-paste': true,
      'editor-force-paragraph': false,
      'editor-cut': true
    }
  };

  if (environment === 'development') {
    ENV.featureFlags['editor-extended-html-paste'] = true;
  }

  if (environment === 'production') {
    ENV.featureFlags['editor-html-paste'] = false;
  }

  return ENV;
};
