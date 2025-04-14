'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

const { compatBuild } = require('@embroider/compat');

module.exports = async function (defaults) {
  const { buildOnce } = await import('@embroider/vite');

  let app = new EmberApp(defaults, {
    // We don't use ember-data or even depend on it directly, but it seems to get pulled in, even
    // though it's an optional peer dependency of ember-changeset. This removes the deprecation.
    emberData: {
      deprecations: {
        DEPRECATE_STORE_EXTENDS_EMBER_OBJECT: false,
      },
    },
  });

  return compatBuild(app, buildOnce);
};
