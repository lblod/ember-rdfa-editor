'use strict';

const sideWatch = require('@embroider/broccoli-side-watch');
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
module.exports = async function (defaults) {
  let app = new EmberApp(defaults, {
    'ember-cli-babel': { enableTypeScriptTransform: true },

    babel: {
      plugins: [
        require.resolve('ember-concurrency/async-arrow-task-transform'),
      ],
      sourceMaps: 'inline',
    },
    autoImport: {
      // Used by classic builds
      watchDependencies: ['@lblod/ember-rdfa-editor'],
    },
    trees: {
      // Used by embroider builds
      app: sideWatch('app', {
        watching: ['@lblod/ember-rdfa-editor'],
      }),
    },

    sassOptions: {
      sourceMap: true,
      sourceMapEmbed: true,
      includePaths: ['node_modules/@appuniversum/ember-appuniversum'],

      silenceDeprecations: ['import', 'global-builtin'],
    },
  });

  const { maybeEmbroider } = require('@embroider/test-setup');
  return maybeEmbroider(app, {
    packagerOptions: {
      webpackConfig: {
        devtool: 'source-map',
      },
    },
  });
};
