'use strict';

module.exports = function(environment) {
  var ENV = {
    featureFlags: {
      'editor-html-paste': true,
      'editor-force-paragraph': false
    }
  };

  if (environment === 'production') {
    ENV.featureFlags['editor-html-paste'] = false;
  }
  return ENV;
};
