import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import TreeDiffer from '@lblod/ember-rdfa-editor/model/util/tree-differ';
import { vdom } from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import { module, test } from 'qunit';

module('Unit | utils | array-utils', function () {
  module('Unit | utils | tree-differ | getDifference', function () {
    test('two identical documents have no difference', function (assert) {
      const { root: initial } = vdom`
        <modelRoot>
          <text>abc</text>
          <span><text>test</text></span>
        </modelRoot>
      `;
      const { root: expected } = vdom`
        <modelRoot>
          <text>abc</text>
          <span><text>test</text></span>
        </modelRoot>
      `;
      const differ = new TreeDiffer(
        initial as ModelElement,
        expected as ModelElement
      );
      assert.strictEqual(differ.getDifference().length, 0);
    });
    test('different amount of children', function (assert) {
      const { root: initial } = vdom`
        <modelRoot>
          <text>abc</text>
          <span><text>test</text></span>
        </modelRoot>
      `;
      const { root: expected } = vdom`
        <modelRoot>
          <text>abc</text>
          <span><text>test</text></span>
          <text>text</text>
        </modelRoot>
      `;
      const differ = new TreeDiffer(
        initial as ModelElement,
        expected as ModelElement
      );
      const differences = differ.getDifference();
      assert.strictEqual(differences.length, 1);
      assert.strictEqual(differences[0].node, expected);
      assert.true(differences[0].changes?.has('content'));
    });
    test('modified text', function (assert) {
      const { root: initial } = vdom`
        <modelRoot>
          <text __id="text">abc</text>
          <span><text>test</text></span>
        </modelRoot>
      `;
      const {
        root: expected,
        textNodes: { text },
      } = vdom`
        <modelRoot>
          <text __id="text">abcdef</text>
          <span><text>test</text></span>
        </modelRoot>
      `;
      const differ = new TreeDiffer(
        initial as ModelElement,
        expected as ModelElement
      );
      const differences = differ.getDifference();
      assert.strictEqual(differences.length, 1);
      assert.strictEqual(differences[0].node, text);
      assert.true(differences[0].changes?.has('content'));
    });
    test('mark added to text', function (assert) {
      const { root: initial } = vdom`
        <modelRoot>
          <text>abc</text>
          <span><text>test</text></span>
        </modelRoot>
      `;
      const { root: expected } = vdom`
        <modelRoot>
          <strong><text>abc</text></strong>
          <span><text>test</text></span>
        </modelRoot>
      `;
      const differ = new TreeDiffer(
        initial as ModelElement,
        expected as ModelElement
      );
      const differences = differ.getDifference();
      assert.strictEqual(differences.length, 1);
      assert.strictEqual(differences[0].node, expected);
      assert.true(differences[0].changes?.has('content'));
    });

    test('list item is added', function (assert) {
      const { root: initial } = vdom`
        <modelRoot>
          <ul>
            <li><text>item1</text></li>
            <li><text>item2</text></li>
          </ul>
        </modelRoot>
      `;
      const {
        root: expected,
        elements: { list },
      } = vdom`
      <modelRoot>
        <ul __id="list">
          <li><text>item1</text></li>
          <li><text>item2</text></li>
          <li><text>item3</text></li>
        </ul>
      </modelRoot>
      `;
      const differ = new TreeDiffer(
        initial as ModelElement,
        expected as ModelElement
      );
      const differences = differ.getDifference();
      assert.strictEqual(differences.length, 1);
      assert.strictEqual(differences[0].node, list);
      assert.true(differences[0].changes?.has('content'));
    });
    test('text in list item is edited', function (assert) {
      const { root: initial } = vdom`
        <modelRoot>
          <ul>
            <li><text>item1</text></li>
            <li><text>item2</text></li>
          </ul>
        </modelRoot>
      `;
      const {
        root: expected,
        textNodes: { text },
      } = vdom`
      <modelRoot>
        <ul __id="list">
          <li><text __id="text">item1test</text></li>
          <li><text>item2</text></li>
        </ul>
      </modelRoot>
      `;
      const differ = new TreeDiffer(
        initial as ModelElement,
        expected as ModelElement
      );
      const differences = differ.getDifference();
      assert.strictEqual(differences.length, 1);
      assert.strictEqual(differences[0].node, text);
      assert.true(differences[0].changes?.has('content'));
    });
  });
});
