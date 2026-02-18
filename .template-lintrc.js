'use strict';

module.exports = {
  extends: 'recommended',
  rules: {
    // FIXME We should migrate away from using did-insert and did-update
    'no-at-ember-render-modifiers': false,
    // FIXME We only use Input in table-menu, we should refactor to use <input>
    'no-builtin-form-components': false,
  },
};
