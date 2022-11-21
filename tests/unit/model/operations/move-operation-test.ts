import { module, test } from 'qunit';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';
import { AssertionError } from '@lblod/ember-rdfa-editor/utils/errors';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import { testState } from 'dummy/tests/test-utils';

module('Unit | model | operations | move-operation-test', function () {
  test('move simple range', function (assert) {
    // language=XML
    const {
      root: initial,
      elements: { target },
      textNodes: { source },
    } = vdom`
      <modelRoot>
        <div __id="target"/>
        <text __id="source">abcd</text>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot __dirty="content">
        <div __dirty="content">
          <text>abcd</text>
        </div>
      </modelRoot>
    `;
    ModelNode.assertModelElement(initial);

    const srcRange = ModelRange.fromInTextNode(initial, source, 0, 4);
    const targetPos = ModelPosition.fromInElement(initial, target, 0);
    const initialState = testState({ document: initial });
    const tr = initialState.createTransaction();
    tr.moveToPosition(srcRange, targetPos);

    const actual = tr.apply();
    const resultRange = tr.mapModelRange(srcRange);
    assert.true(actual.document.sameAs(expected));
    assert.true(
      resultRange.sameAs(ModelRange.fromPaths(actual.document, [1], [1])),
      resultRange.toString()
    );
  });

  test('move simple range 2', function (assert) {
    // language=XML
    const {
      root: initial,
      elements: { target },
      textNodes: { source },
    } = vdom`
      <modelRoot>
        <div __id="target"/>
        <text __id="source">abcd</text>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <div>
          <text>bc</text>
        </div>
        <text>a</text>
        <text>d</text>
      </modelRoot>
    `;

    ModelNode.assertModelElement(initial);
    const srcRange = ModelRange.fromInTextNode(initial, source, 1, 3);
    const targetPos = ModelPosition.fromInElement(initial, target, 0);
    const initialState = testState({ document: initial });
    const tr = initialState.createTransaction();
    tr.moveToPosition(srcRange, targetPos);
    const actual = tr.apply();
    const resultRange = tr.mapModelRange(srcRange);

    assert.true(actual.document.sameAs(expected));
    assert.true(
      resultRange.sameAs(ModelRange.fromPaths(actual.document, [2], [2]))
    );
  });
  test('move uneven range inside textnode', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { rangeStart, rangeEnd, target },
    } = vdom`
      <modelRoot>
        <div>
          <text __id="target">abcd</text>
        </div>
        <div>
          <span>
            <text __id="rangeStart">efgh</text>
            <span>
              <span>
                <text>ijkl</text>
              </span>
              <text>mnop</text>
              <text __id="rangeEnd">qrst</text>
            </span>
          </span>
        </div>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <div>
          <text>abgh</text>
          <span>
            <text>ijkl</text>
          </span>
          <text>mnop</text>
          <text>qrcd</text>
        </div>
        <div>
          <span>
            <text>ef</text>
            <span>
              <text __id="rangeEnd">st</text>
            </span>
          </span>
        </div>
      </modelRoot>
    `;

    ModelNode.assertModelElement(initial);
    const start = ModelPosition.fromInTextNode(initial, rangeStart, 2);
    const end = ModelPosition.fromInTextNode(initial, rangeEnd, 2);
    const srcRange = new ModelRange(start, end);
    const targetPos = ModelPosition.fromInTextNode(initial, target, 2);

    const initialState = testState({ document: initial });
    const tr = initialState.createTransaction();
    tr.moveToPosition(srcRange, targetPos);
    const actual = tr.apply();
    const resultRange = tr.mapModelRange(srcRange);

    assert.true(
      actual.document.sameAs(expected),
      QUnit.dump.parse(actual.document.toXml())
    );
    assert.true(
      resultRange.sameAs(
        ModelRange.fromPaths(actual.document, [1, 0, 2], [1, 0, 2, 0])
      ),
      resultRange.toString()
    );
  });
  test('throws when target inside src', function (assert) {
    // language=XML
    const {
      root: initial,
      elements: { target },
      textNodes: { rangeStart, rangeEnd },
    } = vdom`
      <div>
        <text __id="rangeStart">ab</text>
        <div __id="target"/>
        <text __id="rangeEnd">cd</text>
      </div>
    `;
    ModelNode.assertModelElement(initial);
    const start = ModelPosition.fromInTextNode(initial, rangeStart, 0);
    const end = ModelPosition.fromInTextNode(initial, rangeEnd, 2);
    const targetPos = ModelPosition.fromInElement(initial, target, 0);
    const srcRange = new ModelRange(start, end);
    const initialState = testState({ document: initial });
    const tr = initialState.createTransaction();

    assert.throws(() => {
      tr.moveToPosition(srcRange, targetPos);
      tr.apply();
    }, new AssertionError('Cannot move range to position within that range'));
  });
});
