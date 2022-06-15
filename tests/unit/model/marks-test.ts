import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import MarkOperation from '@lblod/ember-rdfa-editor/model/operations/mark-operation';
import HashSet from '@lblod/ember-rdfa-editor/model/util/hash-set';
import {
  domStripped,
  vdom,
} from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import { boldMarkSpec } from '@lblod/ember-rdfa-editor/plugins/basic-styles/marks/bold';
import { italicMarkSpec } from '@lblod/ember-rdfa-editor/plugins/basic-styles/marks/italic';
import { strikethroughMarkSpec } from '@lblod/ember-rdfa-editor/plugins/basic-styles/marks/strikethrough';
import { underlineMarkSpec } from '@lblod/ember-rdfa-editor/plugins/basic-styles/marks/underline';
import {
  isElement,
  isTextNode,
  tagName,
} from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import {
  stateFromDom,
  testState,
  testView,
  vdomToDom,
} from 'dummy/tests/test-utils';
import { module, test } from 'qunit';

function testMarkToggling(assert: Assert, start: number, end: number) {
  const {
    root: initial,
    textNodes: { text },
  } = vdom`
      <modelRoot>
        <text __id="text" __marks="italic">abcdefghi</text>
      </modelRoot>`;

  const rangeBeginning = new ModelRange(
    ModelPosition.fromInTextNode(text, start),
    ModelPosition.fromInTextNode(text, end)
  );
  const op1 = new MarkOperation(
    undefined,
    rangeBeginning,
    boldMarkSpec,
    {},
    'add'
  );
  const op2 = new MarkOperation(
    undefined,
    rangeBeginning,
    boldMarkSpec,
    {},
    'remove'
  );
  let result;
  op1.execute();
  result = vdomToDom(initial);
  op2.execute();
  result = vdomToDom(initial);
  op1.execute();
  result = vdomToDom(initial);
  op2.execute();
  result = vdomToDom(initial);

  assert.strictEqual(result.childNodes.length, 1);
  const emNode = result.childNodes[0];
  assert.strictEqual(tagName(emNode), 'em');
  assert.strictEqual(emNode.childNodes.length, 1);
  assert.true(emNode.childNodes[0] instanceof Text);
  assert.strictEqual(emNode.textContent, 'abcdefghi');
}

module('Unit | model | marks-test', function () {
  test('reading works', function (assert) {
    const html = domStripped`
    <div>
      <strong>abc</strong>
    </div>
    `.body.children[0];

    const { root: expected } = vdom`
        <div>
          <text __marks="bold">abc</text>
        </div>`;

    const result = stateFromDom(html);
    assert.true(result.document.sameAs(expected));
  });

  test('writing works', function (assert) {
    const { root: initial } = vdom`
      <modelRoot>
        <text __marks="bold">abc</text>
      </modelRoot>`;

    const result = vdomToDom(initial).childNodes[0];
    assert.true(isElement(result));
    assert.strictEqual(tagName(result), 'strong');
    assert.strictEqual(result.childNodes.length, 1);
    assert.strictEqual((result.firstChild as Text).textContent, 'abc');
  });
  test('writing works with multiple marks', function (assert) {
    const { root: initial } = vdom`
      <modelRoot>
        <text __marks="bold,italic">abc</text>
      </modelRoot>`;
    const result = vdomToDom(initial).childNodes[0];

    assert.true(isElement(result));
    assert.strictEqual(tagName(result), 'em');
    assert.strictEqual(result.childNodes.length, 1);

    const fc = result.firstChild!;

    assert.true(isElement(fc));
    assert.strictEqual(tagName(fc), 'strong');
    assert.strictEqual(fc.childNodes.length, 1);
    assert.true(isTextNode(fc.firstChild!));
    assert.strictEqual(fc.firstChild!.textContent, 'abc');
  });
  test('marks are correctly merged and nested: simple case', function (assert) {
    const { root: initial } = vdom`
      <modelRoot>
        <text __marks="italic">abc</text>
        <text __marks="bold,italic">def</text>
        <text __marks="italic">ghi</text>
      </modelRoot>`;

    const result = vdomToDom(initial);
    assert.strictEqual(result.childNodes.length, 1);
    const emNode = result.childNodes[0];
    assert.strictEqual(tagName(emNode), 'em');
    assert.strictEqual(emNode.childNodes.length, 3);
    assert.strictEqual(tagName(emNode.childNodes[1]), 'strong');
  });
  test('adjacent marks are merged when set', function (assert) {
    const {
      root: initial,
      textNodes: { text },
    } = vdom`
      <modelRoot>
        <text __id="text">abcdefghi</text>
      </modelRoot>`;

    const state = testState({ document: initial });
    const tr = state.createTransaction();
    const range1 = ModelRange.fromInNode(text, 3, 6);
    const range2 = ModelRange.fromInNode(text, 6, 9);
    tr.addMark(range1, boldMarkSpec, {});
    tr.addMark(range2, boldMarkSpec, {});
    const resultState = tr.apply();
    const view = testView();
    view.update(resultState);
    const result = view.domRoot;

    console.log(result);
    assert.strictEqual(result.childNodes.length, 2);
    const boldNode = result.childNodes[1];
    assert.strictEqual(tagName(boldNode), 'strong');
    assert.strictEqual(boldNode.childNodes.length, 1);
    assert.strictEqual(boldNode.childNodes[0].textContent, 'defghi');
  });
  test('mark toggling on beginning of text works with different nested marks', function (assert) {
    assert.expect(5);
    testMarkToggling(assert, 0, 3);
  });
  test('mark toggling on middle of text works with different nested marks', function (assert) {
    assert.expect(5);
    testMarkToggling(assert, 3, 6);
  });
  test('mark toggling on end of text works with different nested marks', function (assert) {
    assert.expect(5);
    testMarkToggling(assert, 6, 9);
  });

  test('marks are rendered in the correct order following priority in the DOM', function (assert) {
    const { root: initial } = vdom`
      <modelRoot>
        <text __id="text" __marks="bold,italic,underline,strikethrough">abcdefghi</text>
      </modelRoot>`;
    assert.expect(8);
    const markSpecs = [
      italicMarkSpec,
      boldMarkSpec,
      underlineMarkSpec,
      strikethroughMarkSpec,
    ];

    markSpecs.sort((m1, m2) => m2.priority - m1.priority);

    let node = vdomToDom(initial);

    for (const markSpec of markSpecs) {
      assert.strictEqual(node.childNodes.length, 1);
      node = node.childNodes[0];
      assert.true(
        !!markSpec.matchers.find((matcher) => matcher.tag === tagName(node))
      );
    }
  });
  test('reading highlights works', function (assert) {
    const html = domStripped`
      <div>
        <span data-editor-highlight>abc</span>
      </div>
    `.body.children[0];
    const { root: expected } = vdom`
        <div>
          <text __marks="highlighted">abc</text>
        </div>`;

    const result = stateFromDom(html);
    assert.true(result.document.sameAs(expected));
  });
  test("reading non-highlight spans doesn't read highlight marks", function (assert) {
    const html = domStripped`
      <div>
        <span>abc</span>
      </div>
    `.body.children[0];

    const result = stateFromDom(html);

    const { root: expected } = vdom`
        <div>
          <span>
            <text>abc</text>
          </span>
        </div>`;
    assert.true(result.document.sameAs(expected));
  });
  test('hashset', function (assert) {
    const set = new HashSet({
      hashFunc: (item) => item.name,
      init: [{ name: 'test1' }, { name: 'test2' }],
    });

    set.deleteHash('test2');
    assert.strictEqual(set.size, 1);
  });
});
