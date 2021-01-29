'use strict';

module.exports = {
  name: require('./package').name,
  options: {
    babel: {
      sourceMaps: "inline"
    },
  },

  included() {
    /**
     * detect whether the parent app has sass installed. only import css if sass isn't installed
     * this was inspired by https://github.com/cibernox/ember-power-select/blob/1d867972607784354cf819740e9e716db1cb923a/index.js
     */
    let app = this._findHost();
    let hasSass = !!app.registry.availablePlugins['ember-cli-sass'];
     this._super.included.apply(this, arguments);
    // Don't include the precompiled css file if the user uses a supported CSS preprocessor
    if (!hasSass) {
      app.import('vendor/ember-rdfa-editor.css');
    }
  },
};
