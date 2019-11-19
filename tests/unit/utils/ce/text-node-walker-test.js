import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { render } from '@ember/test-helpers';
import TextNodeWalker from 'dummy/utils/ce/text-node-walker';
import { module, test } from 'qunit';
import 'ember-qunit';

module('Unit | Utility | text node walker', function(hooks){

  setupRenderingTest(hooks);

  test('processes a compplex document tree, checks whether all text is properly concatenated', async function(assert) {

    await render(hbs`<editor>felix <span> tests </span> the <div>shit out of <span> the editor.</span> </div></editor>`);

    let node = new TextNodeWalker().processDomNode(this.$('editor').get(0));

    assert.equal(node.get('text'), 'felix  tests  the shit out of  the editor. ');
  });

});
