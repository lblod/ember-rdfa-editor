import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { render } from '@ember/test-helpers';
import replaceTextWithHtml from 'dummy/utils/replace-text-with-html';
import NodeWalker from 'dummy/utils/node-walker';
import { module, test } from 'qunit';
import 'ember-qunit';

module('Unit | Utility | replace text with html', function(hooks){

  setupRenderingTest(hooks);

  test('Basic insert', async function(assert) {

    let htmlToInject = '<h1>test</h1>';

    await render(hbs`<editor>0123</editor>`);

    let node = new NodeWalker().processDomNode(this.$('editor').get(0));

    let changedNode = replaceTextWithHtml(node, 1, 3, htmlToInject);

    assert.equal(changedNode.domNode.innerHTML, `0${htmlToInject}3`);

  });

  test('Insert along multiple children', async function(assert) {

    let htmlToInject = '<h1>test</h1>';

    await render(hbs`<editor>012<span>34</span>56<span>67</span>89</editor>`);

    let node = new NodeWalker().processDomNode(this.$('editor').get(0));

    let changedNode = replaceTextWithHtml(node, 5, 6, htmlToInject);

    assert.equal(changedNode.domNode.innerHTML, `012<span>34</span>${htmlToInject}6<span>67</span>89`);

  });

  test('Plain insert (no character replacement)', async function(assert) {

    let htmlToInject = '<h1>test</h1>';

    await render(hbs`<editor>0123</editor>`);

    let node = new NodeWalker().processDomNode(this.$('editor').get(0));

    let changedNode = replaceTextWithHtml(node, 1, 1, htmlToInject);

    assert.equal(changedNode.domNode.innerHTML, `0${htmlToInject}123`);

  });
  
  test('Add html in nested tag. In the last child. Replaces 2/3 of the chars. Leaves 1 char untouched', async function(assert) {

    let htmlToInject = '<h1>test</h1>';

    await render(hbs`<editor>0123<span>456</span>789<div>01234<span>567</span>890</div></editor>`);

    let node = new NodeWalker().processDomNode(this.$('editor').get(0));

    let changedNode = replaceTextWithHtml(node, 18, 20, htmlToInject);

    assert.equal(changedNode.domNode.innerHTML, `0123<span>456</span>789<div>01234<span>567</span>${htmlToInject}0</div>`);

  });
  
  test('Add html in nested tag. In the last child. Replaces all chars', async function(assert) {

    let htmlToInject = '<h1>test</h1>';

    await render(hbs`<editor>0123<span>456</span>789<div>01234<span>567</span>890</div></editor>`);

    let node = new NodeWalker().processDomNode(this.$('editor').get(0));

    let changedNode = replaceTextWithHtml(node, 18, 21, htmlToInject);

    assert.equal(changedNode.domNode.innerHTML, `0123<span>456</span>789<div>01234<span>567</span>${htmlToInject}</div>`);

  });
  
  test('Add html in nested tag. In the first child. Leaves first char untouched', async function(assert) {

    let htmlToInject = '<h1>test</h1>';

    await render(hbs`<editor>0123<span>456</span>789<div>01234<span>567</span>890</div></editor>`);

    let node = new NodeWalker().processDomNode(this.$('editor').get(0));

    let changedNode = replaceTextWithHtml(node, 11, 15, htmlToInject);

    assert.equal(changedNode.domNode.innerHTML, `0123<span>456</span>789<div>0${htmlToInject}<span>567</span>890</div>`);
  });

  test('Add html in nested tag. In the first child. Leaves last char untouched', async function(assert) {

    let htmlToInject = '<h1>test</h1>';

    await render(hbs`<editor>0123<span>456</span>789<div>01234<span>567</span>890</div></editor>`);

    let node = new NodeWalker().processDomNode(this.$('editor').get(0));

    let changedNode = replaceTextWithHtml(node, 10, 14, htmlToInject);

    assert.equal(changedNode.domNode.innerHTML,`0123<span>456</span>789<div>${htmlToInject}4<span>567</span>890</div>`);

  });
  
});
