import {module, test} from 'qunit';
import {vdom} from '@lblod/ember-rdfa-editor/utils/xml-utils';
import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';
import OperationAlgorithms from '@lblod/ember-rdfa-editor/core/model/operations/operation-algorithms';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';

module('Unit | model | operations | operation-algorithms-test', function () {
  test('remove splits when range is collapsed', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: {rangeStart},
    } = vdom`
      <modelRoot>
        <text __id="rangeStart">abcd</text>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <text>ab</text>
        <text>cd</text>
      </modelRoot>
    `;
    const range = ModelRange.fromInTextNode(
      initial as ModelElement,
      rangeStart,
      2,
      2
    );
    OperationAlgorithms.remove(initial as ModelElement, range);
    assert.true(initial.sameAs(expected));
  });

  test('remove removes things in document order', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: {rangeStart, rangeEnd},
    } = vdom`
      <modelRoot>
        <div>
          <text __id="rangeStart">abcd</text>
        </div>
        <span>
          <text>efgh</text>
        </span>
        <div>
          <span>
            <text>ijkl</text>
          </span>
          <span>
            <text __id="rangeEnd">mnop</text>
          </span>
        </div>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <div>
          <text>ab</text>
        </div>
        <div>
          <span>
            <text>op</text>
          </span>
        </div>
      </modelRoot>
    `;
    const start = ModelPosition.fromInTextNode(
      initial as ModelElement,
      rangeStart,
      2
    );
    const end = ModelPosition.fromInTextNode(
      initial as ModelElement,
      rangeEnd,
      2
    );
    const range = new ModelRange(start, end);
    OperationAlgorithms.remove(initial as ModelElement, range);
    assert.true(initial.sameAs(expected));
  });
});
