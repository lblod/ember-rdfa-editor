
import { module, test} from 'qunit';
import { render, triggerKeyEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('RDFA Editor', function() {

  // Replace this with your real tests.
  test('it works', async function(assert) {
    await render(hbs`
      <RdfaEditor />
    `);
    triggerKeyEvent('button', 'keydown', 'Enter');
    assert.ok(true);
  });
});
