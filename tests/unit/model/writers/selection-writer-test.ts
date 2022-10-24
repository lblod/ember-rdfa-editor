import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import SelectionWriter from '@lblod/ember-rdfa-editor/core/model/writers/selection-writer';
import { isTextNode } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { testState, testView } from 'dummy/tests/test-utils';
import { module, test } from 'qunit';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';

module('Unit | model | writers | selection-writer', function () {
  test(`converts a simple selection correctly`, function (assert) {
    const {
      root: initial,
      textNodes: { text },
    } = vdom`
      <modelRoot>
        <text __id="text">test</text>
      </modelRoot>`;
    const result = parseRangeInVdom(
      initial,
      ModelRange.fromInTextNode(initial as ModelElement, text, 2, 2)
    );
    console.log(result);
    assert.true(isTextNode(result.startContainer));
    assert.true(isTextNode(result.endContainer));
    assert.strictEqual(result.startOffset, 2);
    assert.strictEqual(result.endOffset, 2);
  });
});

function parseRangeInVdom(root: ModelNode, range: ModelRange): Range {
  const state = testState({ document: root });
  const view = testView();
  view.update(state, [{ node: root, changes: new Set(['content']) }]);
  const writer = new SelectionWriter();
  return writer.writeDomRange(state, view.domRoot, range);
}
