import { module, test } from 'qunit';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import { modelRangeToSimpleRange } from '@lblod/ember-rdfa-editor/core/model/simple-range';
import ReplaceStep from '@lblod/ember-rdfa-editor/core/state/steps/replace-step';
import { testState } from 'dummy/tests/test-utils';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';

module('Unit | core | replace-step-test', function () {
  test('replaces without deepcloning', function (assert) {
    // language=XML
    const {
      root: initial,
      elements: {
        shallow1,
        shallow2,
        remain1,
        remain2,
        remain3,
        remain4,
        toBeReplaced,
      },
    } = vdom`
      <modelRoot __id="shallow1">
        <div __id="remain1"/>
        <div __id="shallow2">
          <span __id="remain2">
            <text>should remain</text>
          </span>
          <div __id="toBeReplaced">
            <text>content</text>
          </div>
          <span __id="remain3">
            <text>should remain</text>
          </span>
        </div>
        <div __id="remain4"/>
      </modelRoot>
    `;
    const { root: expected } = vdom`
      <modelRoot>
        <div />
        <div>
          <span >
            <text>should remain</text>
          </span>
          <div />
          <span >
            <text>should remain</text>
          </span>
        </div>
        <div />
      </modelRoot>
    `;
    const replaceRange = modelRangeToSimpleRange(
      ModelRange.fromInNode(initial as ModelElement, toBeReplaced)
    );
    const initialState = testState({ document: initial });

    const step = new ReplaceStep({
      initialState,
      range: replaceRange,
    });
    const resultState = step.getResult().state;
    assert.true(
      resultState.document.sameAs(expected),
      QUnit.dump.parse(resultState.document.toXml())
    );
    assert.notStrictEqual(resultState.document, shallow1);
    const exRemain1 = resultState.document.children[0];
    ModelNode.assertModelElement(exRemain1);
    assert.strictEqual(exRemain1, remain1);

    const exShallow2 = resultState.document.children[1];
    ModelNode.assertModelElement(exShallow2);
    assert.notStrictEqual(exShallow2, shallow2);

    const exRemain2 = exShallow2.children[0];
    ModelNode.assertModelElement(exRemain2);
    assert.strictEqual(exRemain2, remain2);

    const exRemain3 = exShallow2.children[2];
    ModelNode.assertModelElement(exRemain3);
    assert.strictEqual(exRemain3, remain3);

    const exRemain4 = resultState.document.children[2];
    ModelNode.assertModelElement(exRemain4);
    assert.strictEqual(exRemain4, remain4);
  });
});
