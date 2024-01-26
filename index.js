'use strict';

module.exports = {
  isDevelopingAddon() {
    return process.env.EMBER_ENV === 'development';
  },
  name: require('./package').name,
  options: {
    babel: {
      sourceMaps: 'inline',
      plugins: [require.resolve('ember-auto-import/babel-plugin')],
    },
    autoImport: {
      webpack: require('./webpack-config'),
    },
    'ember-cli-babel': {
      enableTypescriptTransform: true,
    },
  },

  included: function (app) {
    this._super.included.apply(this, arguments);

    app.options.sassOptions = app.options.sassOptions || {};
    app.options.sassOptions.includePaths =
      app.options.sassOptions.includePaths || [];
  },
};
