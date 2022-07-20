import computeDifference from '@lblod/ember-rdfa-editor/model/util/tree-differ';
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
      const difference = computeDifference(initial, expected);
      assert.strictEqual(difference.length, 0);
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
      const differences = computeDifference(initial, expected);
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
      const differences = computeDifference(initial, expected);
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
      const differences = computeDifference(initial, expected);
      assert.strictEqual(differences.length, 1);
      assert.strictEqual(differences[0].node, expected);
      assert.true(differences[0].changes?.has('content'));
    });
    test('marks do not change', function (assert) {
      const { root: initial } = vdom`
        <modelRoot>
        <strong><text>abc</text></strong>
        <span><text>test</text></span>
        </modelRoot>
      `;
      const { root: expected } = vdom`
        <modelRoot>
          <strong><text>abc</text></strong>
          <span><text>test</text></span>
        </modelRoot>
      `;
      const differences = computeDifference(initial, expected);
      assert.strictEqual(differences.length, 0);
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
      const differences = computeDifference(initial, expected);
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
      const differences = computeDifference(initial, expected);
      assert.strictEqual(differences.length, 1);
      assert.strictEqual(differences[0].node, text);
      assert.true(differences[0].changes?.has('content'));
    });
    test('rdfa of an element has changed', function (assert) {
      const { root: initial } = vdom`
        <div vocab="http://xmlns.com/foaf/0.1/" typeof="Person"> <!-- about:alice -->
          <p __id="p1">
            <span __id="span1" property="name">
              <text __id="text1">Alice Birpemswick</text>
            </span>
            <text __id="text2">Email:</text>
            <a property="mbox" href="mailto:alice@example.com">
              <text __id="text3">alice@example.com</text>
            </a>
            <a property="mbox" href="mailto2:alice@example.com">
              <text __id="text4">alice@example.com</text>
            </a>
            <text __id="text5">Phone:</text>
            <a property="phone" href="tel:+1-617-555-7332">
              <text __id="text6">+1 617.555.7332</text>
            </a>
          </p>
        </div>
      `;
      const {
        root: expected,
        elements: { span1 },
      } = vdom`
        <div vocab="http://xmlns.com/foaf/0.1/" typeof="Person"> <!-- about:alice -->
          <p __id="p1">
            <span __id="span1">
              <text __id="text1">Alice Birpemswick</text>
            </span>
            <text __id="text2">Email:</text>
            <a property="mbox" href="mailto:alice@example.com">
              <text __id="text3">alice@example.com</text>
            </a>
            <a property="mbox" href="mailto2:alice@example.com">
              <text __id="text4">alice@example.com</text>
            </a>
            <text __id="text5">Phone:</text>
            <a property="phone" href="tel:+1-617-555-7332">
              <text __id="text6">+1 617.555.7332</text>
            </a>
          </p>
        </div>
      `;
      const differences = computeDifference(initial, expected);
      assert.strictEqual(differences.length, 1);
      assert.strictEqual(differences[0].node, span1);
      assert.strictEqual(differences[0].changes?.size, 1);
      assert.true(differences[0].changes?.has('node'));
    });
    test('different nodes are modified', function (assert) {
      const { root: initial } = vdom`
        <div>
          <div vocab="http://xmlns.com/foaf/0.1/" typeof="Person" __id="div1"> <!-- about:alice -->
            <p __id="p1">
              <span __id="span1" property="name">
                <text __id="text1">Alice Birpemswick</text>
              </span>
            </p>
          </div>
          <ul __id="ul">
            <li>
              <text __id="text2">test</text>
            </li>
            <li>
              <text __id="text3">test</text>    
            </li>
          </ul>
          <text __id="text4">test</text>
        </div>
      `;
      const {
        root: expected,
        elements: { div1, ul },
        textNodes: { text1, text4 },
      } = vdom`
        <div>
          <div typeof="Person" __id="div1"> <!-- about:alice -->
            <p __id="p1">
              <span __id="span1" property="name">
                <text __id="text1">Alice Birpems</text>
              </span>
            </p>
          </div>
          <ul __id="ul">
            <li>
              <text __id="text2">test</text>
            </li>
          </ul>
          <text __id="text4">te</text>
        </div>
      `;
      const differences = computeDifference(initial, expected);
      assert.strictEqual(differences.length, 4);

      assert.strictEqual(differences[0].node, div1);
      assert.strictEqual(differences[0].changes?.size, 1);
      assert.true(differences[0].changes?.has('node'));

      assert.strictEqual(differences[1].node, text1);
      assert.strictEqual(differences[1].changes?.size, 1);
      assert.true(differences[1].changes?.has('content'));

      assert.strictEqual(differences[2].node, ul);
      assert.strictEqual(differences[2].changes?.size, 1);
      assert.true(differences[2].changes?.has('content'));

      assert.strictEqual(differences[3].node, text4);
      assert.strictEqual(differences[3].changes?.size, 1);
      assert.true(differences[3].changes?.has('content'));
    });
  });
});
