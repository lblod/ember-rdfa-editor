'use strict';

module.exports = {
  isDevelopingAddon() {
    return this.app.env === 'development';
  },
  name: require('./package').name,
  options: {
    babel: {
      sourceMaps: 'inline',
    },
    autoImport: {
      webpack: {
        node: {
          global: true,
          __filename: true,
          __dirname: true,
        },
        resolve: {
          fallback: {
            stream: require.resolve('stream-browserify'),
            crypto: require.resolve('crypto-browserify'),
          },
        },
      },
    },
  },

  included() {
    this._super.included.apply(this, arguments);
  },
};
