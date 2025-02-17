'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    'ember-cli-babel': { enableTypeScriptTransform: true },
    autoImport: {
      watchDependencies: ['@lblod/ember-rdfa-editor'],
    },
    babel: {
      plugins: [
        require.resolve('ember-concurrency/async-arrow-task-transform'),
      ],
      sourceMaps: 'inline',
    },

    sassOptions: {
      sourceMap: true,
      sourceMapEmbed: true,
      includePaths: ['node_modules/@appuniversum/ember-appuniversum'],

      silenceDeprecations: ['import', 'global-builtin'],
    },
  });

  const { maybeEmbroider } = require('@embroider/test-setup');
  return maybeEmbroider(app);
};
