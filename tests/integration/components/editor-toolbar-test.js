import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | editor toolbar', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    await render(hbs`{{editor-toolbar}}`);

    assert.dom('*').hasText('');

    // Template block usage:
    await render(hbs`
      {{#editor-toolbar}}
        template block text
      {{/editor-toolbar}}
    `);

    assert.dom('*').hasText('template block text');
  });
});
