import ModelElement from '@lblod/ember-rdfa-editor/model/nodes/model-element';
import ModelText from '@lblod/ember-rdfa-editor/model/nodes/model-text';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import { OutsideRootError } from '@lblod/ember-rdfa-editor/utils/errors';
import { module, test } from 'qunit';

module('Unit | model | model-node', function () {
  module('Unit | model | model-node | getOffsetPath', function () {
    test('path of root is empty list', function (assert) {
      const elem = new ModelElement('div');
      assert.strictEqual(elem.getOffsetPath().length, 0);
    });

    test('path of children of root', function (assert) {
      const root = new ModelElement('div');
      const div = new ModelElement('div');
      const text = new ModelText('abc');
      const div2 = new ModelElement('div');
      root.appendChildren(div, text, div2);

      assert.strictEqual(div.getOffsetPath().length, 1);
      assert.strictEqual(div.getOffsetPath()[0], 0);
      assert.strictEqual(text.getOffsetPath().length, 1);
      assert.strictEqual(text.getOffsetPath()[0], 1);
      assert.strictEqual(div2.getOffsetPath().length, 1);
      assert.strictEqual(div2.getOffsetPath()[0], 4);
    });
  });

  module('Unit | model | model-node | promote', function () {
    test('promote of child of root throws error', function (assert) {
      const {
        textNodes: { text },
      } = vdom`
        <modelRoot>
          <text __id="text">test</text>
        </modelRoot>`;

      assert.throws(() => text.promote(), new OutsideRootError());
    });

    test('promote(false) turns node into previoussibling of parent', function (assert) {
      const {
        elements: { div },
        textNodes: { content },
      } = vdom`
        <modelRoot>
          <div __id="div">
            <text __id="content">test</text>
          </div>
        </modelRoot>`;

      content.promote();
      assert.strictEqual(div.previousSibling, content);
    });

    test('promote returns old parent', function (assert) {
      const {
        elements: { div },
        textNodes: { content },
      } = vdom`
        <modelRoot>
          <div __id="div">
            <text __id="content">test</text>
          </div>
        </modelRoot>`;
      const result = content.promote();
      assert.strictEqual(result, div);
    });

    test('promote moves node into new parent', function (assert) {
      const {
        root,
        elements: { div },
        textNodes: { content },
      } = vdom`
        <modelRoot>
          <div __id="div">
            <text __id="content">test</text>
          </div>
        </modelRoot>`;
      const result = content.promote();
      assert.strictEqual(result, div);
      assert.strictEqual(root.firstChild, content);
      assert.strictEqual(root.lastChild, div);
      assert.strictEqual(div.length, 0);
      assert.strictEqual(root.length, 2);
    });

    test('promote(true) turns node into nextsibling of parent', function (assert) {
      const {
        elements: { div },
        textNodes: { content },
      } = vdom`
        <modelRoot>
          <div __id="div">
            <text __id="content">test</text>
          </div>
        </modelRoot>`;

      content.promote(true);
      assert.strictEqual(div.nextSibling, content);
    });

    test('promote(true) returns old parent', function (assert) {
      const {
        elements: { div },
        textNodes: { content },
      } = vdom`
        <modelRoot>
          <div __id="div">
            <text __id="content">test</text>
          </div>
        </modelRoot>`;

      const result = content.promote(true);
      assert.strictEqual(result, div);
    });

    test('promote(true) moves node into new parent', function (assert) {
      const {
        root,
        elements: { div },
        textNodes: { content },
      } = vdom`
        <modelRoot>
          <div __id="div">
            <text __id="content">test</text>
          </div>
        </modelRoot>`;
      content.promote(true);
      assert.strictEqual(root.lastChild, content);
      assert.strictEqual(root.firstChild, div);
      assert.strictEqual(div.length, 0);
      assert.strictEqual(root.length, 2);
    });
  });

  module('Unit | model | model-node | sameAs', function () {
    test('returns true for identical models', function (assert) {
      // language=XML
      const { root: model1 } = vdom`
        <div>
          <span>
            <text>abc</text>
          </span>
          <ul>
            <li>
              <text>def</text>
            </li>
            <li>
              <text>def</text>
            </li>
            <li>
              <text>def</text>
            </li>
          </ul>
        </div>
      `;
      const model2 = model1.clone();
      assert.true(model1.sameAs(model2));
    });
    test('returns false for different models', function (assert) {
      // language=XML
      const { root: model1 } = vdom`
        <div>
          <span>
            <text>abc</text>
          </span>
          <ul>
            <li>
              <text>def</text>
            </li>
            <li>
              <text>def</text>
            </li>
            <li>
              <text>def</text>
            </li>
          </ul>
        </div>
      `;
      // language=XML
      const { root: model2 } = vdom`
        <div>
          <!--          difference-->
          <div>
            <text>abc</text>
          </div>
          <!--          difference-->
          <ul>
            <li>
              <text>def</text>
            </li>
            <li>
              <text>def</text>
            </li>
            <li>
              <text>def</text>
            </li>
          </ul>
        </div>
      `;
      assert.false(model1.sameAs(model2));
    });

    test('returns false models only differing in attributes', function (assert) {
      // language=XML
      const { root: model1 } = vdom`
        <div>
          <span>
            <text>abc</text>
          </span>
          <ul>
            <li>
              <text>def</text>
            </li>
            <li>
              <text>def</text>
            </li>
            <li>
              <text>def</text>
            </li>
          </ul>
        </div>
      `;
      // language=XML
      const { root: model2 } = vdom`
        <div>
          <span>
            <text bold="true">abc</text>
          </span>
          <ul>
            <li>
              <text>def</text>
            </li>
            <li>
              <text>def</text>
            </li>
            <li>
              <text>def</text>
            </li>
          </ul>
        </div>
      `;
      assert.false(model1.sameAs(model2));
    });
    test('returns true for models only differing in ignored attributes', function (assert) {
      // language=XML
      const { root: model1 } = vdom`
        <div>
          <span>
            <text>abc</text>
          </span>
          <ul>
            <li>
              <text>def</text>
            </li>
            <li>
              <text>def</text>
            </li>
            <li>
              <text>def</text>
            </li>
          </ul>
        </div>
      `;
      // language=XML
      const { root: model2 } = vdom`
        <div>
          <span>
            <text __dummy_test_attr="test">abc</text>
          </span>
          <ul>
            <li>
              <text>def</text>
            </li>
            <li>
              <text>def</text>
            </li>
            <li>
              <text>def</text>
            </li>
          </ul>
        </div>
      `;
      assert.true(model1.sameAs(model2));
    });
    test('returns false for models only differing in ignored attributes when strict', function (assert) {
      // language=XML
      const { root: model1 } = vdom`
        <div>
          <span>
            <text>abc</text>
          </span>
          <ul>
            <li>
              <text>def</text>
            </li>
            <li>
              <text>def</text>
            </li>
            <li>
              <text>def</text>
            </li>
          </ul>
        </div>
      `;
      // language=XML
      const { root: model2 } = vdom`
        <div>
          <span>
            <text __dummy_test_attr="test">abc</text>
          </span>
          <ul>
            <li>
              <text>def</text>
            </li>
            <li>
              <text>def</text>
            </li>
            <li>
              <text>def</text>
            </li>
          </ul>
        </div>
      `;
      assert.false(model1.sameAs(model2, { ignoredAttributes: new Set() }));
    });
  });
});
