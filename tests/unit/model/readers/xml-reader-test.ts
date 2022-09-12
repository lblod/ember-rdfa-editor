import ModelElement from '@lblod/ember-rdfa-editor/model/nodes/model-element';
import { parseXml, vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import { module, test } from 'qunit';

module('Unit | model | readers | xml-reader-test', function () {
  test('rootNode gets read as a modelrootnode', function (assert) {
    // language=XML
    const { root } = vdom`<modelRoot />`;
    const rootNode = new ModelElement('div');
    rootNode.setAttribute('class', 'say-editor_inner say_content');
    rootNode.setAttribute('contenteditable', '');

    assert.true(root.sameAs(rootNode));
  });
  test('test xml', function (assert) {
    const xml = `
      <div>
        this text will be ignored because it's not inside a text node
        this is also the case for whitespace, so you can format this however you want
        <span __id="coolSpan">
<!--          this is a comment, it will also be ignored -->
          <text __id="myText" bold="true">content</text>
          <span>
            <text>inside test</text>
          </span>
          <text>content2</text>
        </span>
        <p testAttr="value" __id="paragraph" />
        <span>this text is also ignored<text>but this isn't</text></span>
        <img><document><invalidNodeName>warning: there are no checks for invalid html/model state</invalidNodeName></document></img>
      </div>`;

    const {
      root,
      elements: { coolSpan, paragraph },
      textNodes: { myText },
    } = parseXml(xml);

    assert.strictEqual(root.length, 4);
    assert.strictEqual(coolSpan.length, 3);
    assert.strictEqual(myText.content, 'content');
    assert.strictEqual(paragraph.getAttribute('testAttr'), 'value');
  });
});
