import { module, test } from 'qunit';
import { vdom } from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import OperationAlgorithms from '@lblod/ember-rdfa-editor/model/operations/operation-algorithms';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';

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
      const testPos1 = ModelPosition.fromInTextNode(splitPoint, 3);
      const testPos2 = ModelPosition.fromAfterNode(div1);
      const splitPos = ModelPosition.fromInTextNode(splitPoint, 2);
      const { mapper } = OperationAlgorithms.split(splitPos);
      const newSplitPos = mapper.mapPosition(splitPos);
      const newSplitPosLeft = mapper.mapPosition(splitPos, 'left');
      const newTestPos1 = mapper.mapPosition(testPos1);
      const newTestPos1Left = mapper.mapPosition(testPos1, 'left');
      const newTestPos2 = mapper.mapPosition(testPos2);
      assert.true(initial.sameAs(expected));
      assert.deepEqual(newSplitPos.path, [1, 0]);
      assert.deepEqual(newSplitPosLeft.path, [0, 2]);
      assert.deepEqual(newTestPos1.path, [1, 1]);
      assert.deepEqual(newTestPos1Left.path, [1, 1]);
      assert.deepEqual(newTestPos2.path, [2]);
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
      const testPos1 = ModelPosition.fromInTextNode(splitPoint, 3);
      const testPos2 = ModelPosition.fromAfterNode(div1);
      const splitPos = ModelPosition.fromInTextNode(splitPoint, 4);
      const { mapper } = OperationAlgorithms.split(splitPos);
      const newSplitPos = mapper.mapPosition(splitPos);
      const newSplitPosLeft = mapper.mapPosition(splitPos, 'left');
      const newTestPos1 = mapper.mapPosition(testPos1);
      const newTestPos1Left = mapper.mapPosition(testPos1, 'left');
      const newTestPos2 = mapper.mapPosition(testPos2);
      assert.true(initial.sameAs(expected));
      assert.deepEqual(newSplitPos.path, [1]);
      assert.deepEqual(newSplitPosLeft.path, [0, 4]);
      assert.deepEqual(newTestPos1.path, [0, 3]);
      assert.deepEqual(newTestPos1Left.path, [0, 3]);
      assert.deepEqual(newTestPos2.path, [2]);
    });
  }
);
