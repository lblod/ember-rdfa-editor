/* eslint-disable no-undef */
const { defineConfig } = require('cypress');
const { configureVisualRegression } = require('cypress-visual-regression');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    env: {
      visualRegression: {
        type: 'regression',
      },
    },
    screenshotsFolder: './cypress/snapshots/actual',
    setupNodeEvents(on, config) {
      require('@cypress/grep/src/plugin')(config);
      configureVisualRegression(on);

      return config;
    },
  },
});
