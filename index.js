'use strict';

module.exports = {
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
