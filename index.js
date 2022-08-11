'use strict';

module.exports = {
  isDevelopingAddon() {
    return process.env.EMBER_ENV === 'development';
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
      // This is needed for the editor plugins dummy app styles to work.
      // They import the ember-rdfa-editor/a-dummy file, which imports the appuniversum styles
      // with an absolute path which only works if this includePath is added.
      'node_modules/@appuniversum/ember-appuniversum/app/styles'
    );
  },
};
