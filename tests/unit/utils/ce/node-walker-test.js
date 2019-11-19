import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { render } from '@ember/test-helpers';
import NodeWalker from 'dummy/utils/ce/node-walker';
import { module, test } from 'qunit';
import 'ember-qunit';

module('Unit | Utility | node walker', function(hooks){

  setupRenderingTest(hooks);

  test('processes 1 node document, checks text correponds', async function(assert) {
    await render(hbs`<editor> hello </editor>`);

    let node = new NodeWalker().processDomNode(this.$('editor').get(0));

    assert.equal(node.get('children')[0].get('text').trim(), 'hello');
  });

  test('processes 1 node nested document, checks text correponds', async function(assert) {
    await render(hbs`<editor>  <foo> felix </foo> </editor>`);

    let node = new NodeWalker().processDomNode(this.$('editor').get(0));

    assert.equal(node.get('children')[0].get('text'), '  ');
    assert.equal(node.get('children')[1].get('children')[0].get('text').trim(), 'felix');
  });

  test('processes complex node struture, checks text correponds', async function(assert) {
    await render(hbs`<editor>felix <span> tests </span> the <div>shit out of <span> the editor.</span> </div></editor>`);

    let node = new NodeWalker().processDomNode(this.$('editor').get(0));

    assert.equal(node.get('children')[0].text, 'felix ');
    assert.equal(node.get('children')[1].get('children')[0].get('text'), ' tests ');
    assert.equal(node.get('children')[2].get('text'), ' the ');
    assert.equal(node.get('children')[3].get('children')[0].get('text'), 'shit out of ');
    assert.equal(node.get('children')[3].get('children')[1].get('children')[0].get('text'), ' the editor.');
  });

  test('processes complex node struture, checks regions are ok', async function(assert) {
    await render(hbs`<editor>01234<span>5678</span>9<div>0123<span>456</span>7</div></editor>`);

    let node = new NodeWalker().processDomNode(this.$('editor').get(0));

    assert.deepEqual(node.get('children')[1].get('children')[0].get('region'), [5, 9]);
    assert.deepEqual(node.children[2].get('region'), [9, 10]);
    assert.deepEqual(node.children[3].children[0].get('region'), [10, 14]);
    assert.deepEqual(node.children[3].children[1].children[0].get('region'), [14, 17]);
    assert.deepEqual(node.children[3].children[2].get('region'), [17, 18]);
  });

  test('processes complex node struture, checks lengths are ok', async function(assert) {
    await render(hbs`<editor>01234<span>5678</span>9<div>0123<span>456</span>7</div></editor>`);

    let node = new NodeWalker().processDomNode(this.$('editor').get(0));

    assert.equal(node.get('children')[1].get('children')[0].get('length'), 4);
    assert.equal(node.children[2].get('length'), 1);
    assert.equal(node.children[3].children[0].get('length'), 4);
    assert.equal(node.children[3].children[1].children[0].get('length'), 3);
    assert.equal(node.children[3].children[2].get('length'), 1);
  });

});
