'use strict';

module.exports = function(environment , appConfig) {
  var ENV = {
    featureFlags: {
      'standard-editor-html-paste': true,
      'extended-editor-html-paste': false,
      'editor-force-paragraph': false
    }
  };

  if (environment === 'production') {
    ENV.featureFlags['standard-editor-html-paste'] = false;
    ENV.featureFlags['extended-editor-html-paste'] = false;
  }
  return ENV;
};
