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

  included: function (app) {
    this._super.included.apply(this, arguments);

    app.options.sassOptions = app.options.sassOptions || {};
    app.options.sassOptions.includePaths =
      app.options.sassOptions.includePaths || [];

    app.options.sassOptions.includePaths.push(
      'node_modules/@appuniversum/appuniversum',
      'node_modules/@appuniversum/ember-appuniversum/app/styles'
    );
  },
};
