/* eslint-env node */
'use strict';

module.exports = {
  name: 'rdfa-context-plugin',

  isDevelopingAddon() {
    return true;
  },


  included(app, parentAddon) {
    let target = (parentAddon || app);
    target.options = target.options || {};
    target.options.babel = target.options.babel || {includePolyfill: true};
    return this._super.included.apply(this, arguments);
  }
};
