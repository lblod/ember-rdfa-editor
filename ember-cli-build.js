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
    autoImport: {
      webpack: {
        node: {
          global: true,
          __filename: true,
          __dirname: true,
        },
        module: {
          rules: [{ test: /\.handlebars$/, loader: 'handlebars-loader' }],
        },
        // plugins: [
        //   new webpack.ProvidePlugin({
        //     process: 'process/browser'
        //   })
        // ],
        resolve: {
          fallback: {
            stream: require.resolve('stream-browserify'),
            // buffer: require.resolve('buffer/'),
            // events: require.resolve("events/"),
            crypto: require.resolve('crypto-browserify'),
          },
        },
      },
    },
    '@appuniversum/ember-appuniversum': {
      disableWormholeElement: true,
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
      webpackConfig: {
        // Config copied from the auto-import config in index.js
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
