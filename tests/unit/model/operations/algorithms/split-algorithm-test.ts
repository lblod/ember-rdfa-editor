import { module, test } from 'qunit';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import OperationAlgorithms from '@lblod/ember-rdfa-editor/core/model/operations/operation-algorithms';
import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';
import { modelPosToSimplePos } from '@lblod/ember-rdfa-editor/core/model/simple-position';
import { pathToSimplePos } from 'dummy/tests/test-utils';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';

module(
  'Unit | model | operations | algorithms | split-algorithm-test | ',
  function () {
    test('rangeMapping is correct after split', function (assert) {
      const {
        root: initial,
        elements: { div1 },
        textNodes: { splitPoint },
      } = vdom`
        <modelRoot>
          <div __id="div1">
            <text __id="splitPoint">test</text>
          </div>
        </modelRoot>
      `;
      const { root: expected } = vdom`
        <modelRoot>
          <div>
            <text>te</text>
          </div>
          <div>
            <text>st</text>
          </div>
        </modelRoot>
      `;
      ModelNode.assertModelElement(initial);
      const testPos1 = modelPosToSimplePos(
        ModelPosition.fromInTextNode(initial, splitPoint, 3)
      );
      const testPos2 = modelPosToSimplePos(
        ModelPosition.fromAfterNode(initial, div1)
      );
      const splitPos = modelPosToSimplePos(
        ModelPosition.fromInTextNode(initial, splitPoint, 2)
      );
      const { mapper } = OperationAlgorithms.split(initial, splitPos);
      const newSplitPos = mapper.mapPosition(splitPos);
      const newSplitPosLeft = mapper.mapPosition(splitPos, {
        bias: 'left',
      });
      const newTestPos1 = mapper.mapPosition(testPos1);
      const newTestPos1Left = mapper.mapPosition(testPos1, {
        bias: 'left',
      });
      const newTestPos2 = mapper.mapPosition(testPos2);
      assert.true(initial.sameAs(expected));
      assert.deepEqual(newSplitPos, pathToSimplePos(initial, [1], false));
      assert.deepEqual(
        newSplitPosLeft,
        pathToSimplePos(initial, [0, 2], false)
      );
      assert.deepEqual(newTestPos1, pathToSimplePos(initial, [1, 1], false));
      assert.deepEqual(
        newTestPos1Left,
        pathToSimplePos(initial, [1, 1], false)
      );
      assert.deepEqual(newTestPos2, pathToSimplePos(initial, [2], false));
    });
    test('rangeMapping is correct after split at end', function (assert) {
      const {
        root: initial,
        elements: { div1 },
        textNodes: { splitPoint },
      } = vdom`
        <modelRoot>
          <div __id="div1">
            <text __id="splitPoint">test</text>
          </div>
        </modelRoot>
      `;
      const { root: expected } = vdom`
        <modelRoot>
          <div>
            <text>test</text>
          </div>
          <div/>
        </modelRoot>
      `;
      ModelNode.assertModelElement(initial);
      const testPos1 = modelPosToSimplePos(
        ModelPosition.fromInTextNode(initial, splitPoint, 3)
      );
      const testPos2 = modelPosToSimplePos(
        ModelPosition.fromAfterNode(initial, div1)
      );
      const splitPos = modelPosToSimplePos(
        ModelPosition.fromInTextNode(initial, splitPoint, 4)
      );
      const { mapper } = OperationAlgorithms.split(initial, splitPos);
      const newSplitPos = mapper.mapPosition(splitPos);
      const newSplitPosLeft = mapper.mapPosition(splitPos, {
        bias: 'left',
      });
      const newTestPos1 = mapper.mapPosition(testPos1);
      const newTestPos1Left = mapper.mapPosition(testPos1, {
        bias: 'left',
      });
      const newTestPos2 = mapper.mapPosition(testPos2);
      assert.true(initial.sameAs(expected));
      assert.strictEqual(newSplitPos, pathToSimplePos(initial, [1], false));
      assert.strictEqual(
        newSplitPosLeft,
        pathToSimplePos(initial, [0, 4], false)
      );
      assert.strictEqual(newTestPos1, pathToSimplePos(initial, [0, 3], false));
      assert.strictEqual(
        newTestPos1Left,
        pathToSimplePos(initial, [0, 3], false)
      );
      assert.strictEqual(newTestPos2, pathToSimplePos(initial, [2], false));
    });
  }
);
