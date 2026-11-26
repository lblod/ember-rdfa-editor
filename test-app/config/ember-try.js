'use strict';

module.exports = async function () {
  return {
    packageManager: 'pnpm',
    scenarios: [
      {
        name: 'ember-lts-6.12.0',
        npm: {
          devDependencies: {
            'ember-source': '~6.12.0',
          },
        },
      },
    ],
  };
};
