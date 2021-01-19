'use strict';

module.exports = {
  name: require('./package').name,

  included() {
    let hasSass = !!app.registry.availablePlugins['ember-cli-sass'];

    // Don't include the precompiled css file if the user uses a supported CSS preprocessor
    if (!hasSass) {
      app.import('vendor/ember-rdfa-editor.css');
    }
  },
};
