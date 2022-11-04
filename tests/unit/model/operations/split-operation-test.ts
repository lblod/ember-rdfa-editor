import { module, test } from 'qunit';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import { pathsToSimpleRange, testState } from 'dummy/tests/test-utils';
import SplitStep from '@lblod/ember-rdfa-editor/core/state/steps/split-step';
import { modelRangeToSimpleRange } from '@lblod/ember-rdfa-editor/core/model/simple-range';

module('Unit | model | operations | split-operation-test', function () {
  test("doesn't split root", function (assert) {
    // language=XML
    const { root: initial } = vdom`
      <modelRoot>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
      </modelRoot>
    `;
    ModelNode.assertModelElement(initial);
    const initialState = testState({ document: initial });

    const range = modelRangeToSimpleRange(
      ModelRange.fromPaths(initial, [0], [0])
    );
    const step = new SplitStep({ range });
    const actual = step.getResult(initialState);
    assert.true(actual.state.document.sameAs(expected));
    assert.deepEqual(actual.defaultRange, range);
  });

  test("doesn't split root with content", function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { rangeStart },
    } = vdom`
      <modelRoot>
        <text __id="rangeStart">abcd</text>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <text>ab</text>
        <text>cd</text>
      </modelRoot>
    `;

    ModelNode.assertModelElement(initial);
    const initialState = testState({ document: initial });

    const range = modelRangeToSimpleRange(
      ModelRange.fromInTextNode(initial, rangeStart, 2, 2)
    );
    const step = new SplitStep({ range });
    const actual = step.getResult(initialState);
    assert.true(actual.state.document.sameAs(expected));
    assert.deepEqual(actual.defaultRange, range);
  });
  test('splits an element', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { selectionStart },
    } = vdom`
      <modelRoot>
        <div>
          <text __id="selectionStart">abcd</text>
        </div>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <div>
          <text>ab</text>
        </div>
        <div>
          <text>cd</text>
        </div>
      </modelRoot>
    `;
    ModelNode.assertModelElement(initial);
    const initialState = testState({ document: initial });

    const range = modelRangeToSimpleRange(
      ModelRange.fromInTextNode(initial, selectionStart, 2, 2)
    );
    const step = new SplitStep({ range });

    const actual = step.getResult(initialState);
    const resultRange = actual.defaultRange;
    assert.true(
      actual.state.document.sameAs(expected),
      QUnit.dump.parse(actual.state.document)
    );

    assert.deepEqual(
      resultRange,
      pathsToSimpleRange(actual.state.document, [1], [1])
    );
  });
  test('only splits text when configured', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { selectionStart },
    } = vdom`
      <modelRoot>
        <div>
          <text __id="selectionStart">abcd</text>
        </div>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <div>
          <text>ab</text>
          <text>cd</text>
        </div>
      </modelRoot>
    `;

    ModelNode.assertModelElement(initial);
    const initialState = testState({ document: initial });
    const range = modelRangeToSimpleRange(
      ModelRange.fromInTextNode(initial, selectionStart, 2, 2)
    );
    const step = new SplitStep({ range, splitParent: false });
    const actual = step.getResult(initialState);
    const resultRange = actual.defaultRange;
    assert.true(actual.state.document.sameAs(expected));

    assert.deepEqual(resultRange, range);
  });
  test('uncollapsed splits both ends', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { selectionStart },
    } = vdom`
      <modelRoot>
        <div>
          <text __id="selectionStart">abcd</text>
        </div>
      </modelRoot>
    `;
    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <div>
          <text __id="selectionStart">a</text>
        </div>
        <div>
          <text __id="selectionStart">bc</text>
        </div>
        <div>
          <text __id="selectionStart">d</text>
        </div>
      </modelRoot>
    `;
    ModelNode.assertModelElement(initial);
    const initialState = testState({ document: initial });
    const range = modelRangeToSimpleRange(
      ModelRange.fromInTextNode(initial, selectionStart, 1, 3)
    );
    const step = new SplitStep({ range });

    const actual = step.getResult(initialState);
    const resultRange = actual.defaultRange;
    assert.true(actual.state.document.sameAs(expected));

    assert.deepEqual(
      resultRange,
      pathsToSimpleRange(actual.state.document, [1], [2])
    );
  });

  test('uncollapsed over multiple nodessplits both ends', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { selectionStart, selectionEnd },
    } = vdom`
      <modelRoot>
        <div>
          <text __id="selectionStart">ab</text>
          <div>
            <text>test</text>
          </div>
          <text __id="selectionEnd">cd</text>
        </div>
      </modelRoot>
    `;
    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <div>
          <text __id="selectionStart">ab</text>
        </div>
        <div>
          <div>
            <text>test</text>
          </div>
        </div>
        <div>
          <text __id="selectionEnd">cd</text>
        </div>
      </modelRoot>
    `;
    ModelNode.assertModelElement(initial);
    const initialState = testState({ document: initial });
    const start = ModelPosition.fromInTextNode(initial, selectionStart, 2);
    const end = ModelPosition.fromInTextNode(initial, selectionEnd, 0);
    const range = modelRangeToSimpleRange(new ModelRange(start, end));

    const step = new SplitStep({ range });
    const actual = step.getResult(initialState);
    const resultRange = actual.defaultRange;
    assert.true(actual.state.document.sameAs(expected));

    assert.deepEqual(
      resultRange,
      pathsToSimpleRange(actual.state.document, [1], [2])
    );
  });

  test('uncollapsed over multiple nodes and levels splits both ends', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { selectionStart, selectionEnd },
    } = vdom`
      <modelRoot>
        <div>
          <text __id="selectionStart">ab</text>
          <div>
            <text>test</text>
          </div>
          <span>
            <text __id="selectionEnd">cd</text>
          </span>
        </div>
      </modelRoot>
    `;
    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <div>
          <text __id="selectionStart">ab</text>
        </div>
        <div>
          <div>
            <text>test</text>
          </div>
          <span/>
          <span>
            <text __id="selectionEnd">cd</text>
          </span>
        </div>
      </modelRoot>
    `;
    ModelNode.assertModelElement(initial);
    const initialState = testState({ document: initial });
    const start = ModelPosition.fromInTextNode(initial, selectionStart, 2);
    const end = ModelPosition.fromInTextNode(initial, selectionEnd, 0);
    const range = modelRangeToSimpleRange(new ModelRange(start, end));
    const step = new SplitStep({ range });
    const actual = step.getResult(initialState);
    const resultRange = actual.defaultRange;
    assert.true(actual.state.document.sameAs(expected));

    assert.deepEqual(
      resultRange,
      pathsToSimpleRange(actual.state.document, [1], [1, 2])
    );
  });
});
