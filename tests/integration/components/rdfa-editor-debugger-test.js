import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rdfa editor debugger', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    await render(hbs`{{rdfa-editor-debugger}}`);

    assert.dom('*').hasText('');

    // Template block usage:
    await render(hbs`
      {{#rdfa-editor-debugger}}
        template block text
      {{/rdfa-editor-debugger}}
    `);

    assert.dom('*').hasText('template block text');
  });
});
