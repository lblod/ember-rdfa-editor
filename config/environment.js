'use strict';

module.exports = function (/* environment */) {
  var ENV = {
    featureFlags: {
      'editor-html-paste': true,
      'editor-extended-html-paste': false,
      'editor-cut': true,
      'editor-copy': true,
    },
  };

  return ENV;
};
