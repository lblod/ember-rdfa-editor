'use strict';

module.exports = {
  isDevelopingAddon() {
    return this.app.env === 'development';
  },
  name: require('./package').name,
  options: {
    babel: {
      sourceMaps: "inline"
    },
  },

  included() {
     this._super.included.apply(this, arguments);
  },
};
