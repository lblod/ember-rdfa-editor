'use strict';

module.exports = {
  description: '',

  normalizeEntityName() { },

  async afterInstall(options) {
    // setting star as version because the dependency is managed in this addons package.json file
    return this.addAddonToProject('@lblod/ember-rdfa-editor-plugin-system-dispatcher', '*');
  }
};
