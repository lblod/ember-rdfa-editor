'use strict';

module.exports = {
  name: require('./package').name,
  options: {
    babel: {
      sourceMaps: "inline"
    },
  },

  isDevelopingAddon() {
    return this.app.env === 'development';
  },

  included() {
     this._super.included.apply(this, arguments);
  },
};
