'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function (defaults) {
  let app = new EmberAddon(defaults, {
    babel: {
      sourceMaps: 'inline',
    },
    sassOptions: {
      sourceMapEmbed: true,
    },
    autoprefixer: {
      enabled: true,
      cascade: true,
      sourcemap: true,
    },
    '@appuniversum/ember-appuniversum': {
      disableWormholeElement: true,
    },
    'ember-cli-babel': {
      enableTypeScriptTransform: true,
    },
  });

  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */
  const { maybeEmbroider } = require('@embroider/test-setup');
  return maybeEmbroider(app, {
    packagerOptions: {
      webpackConfig: require('./webpack-config'),
    },
  });

  //Older config to check if still needed
  //const { maybeEmbroider } = require('@embroider/test-setup');
  //return maybeEmbroider(app, {
  //  skipBabel: [
  //    {
  //      package: 'qunit',
  //    },
  //  ],
  //});
};
