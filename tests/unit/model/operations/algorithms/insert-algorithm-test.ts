import { module, test } from 'qunit';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';
import OperationAlgorithms from '@lblod/ember-rdfa-editor/core/model/operations/operation-algorithms';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import ModelText from '@lblod/ember-rdfa-editor/core/model/nodes/model-text';
import { modelPosToSimplePos } from '@lblod/ember-rdfa-editor/core/model/simple-position';
import { pathToSimplePos } from 'dummy/tests/test-utils';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import { modelRangeToSimpleRange } from '@lblod/ember-rdfa-editor/core/model/simple-range';

module(
  'Unit | model | operations | algorithms | insert-algorithm-test | ',

  function () {
    test('should insert properly', function (assert) {
      //language=XML
      const {
        root: initial,
        elements: { span3, div1 },
        textNodes: { text3, text4, text6, text7, superDeep },
      } = vdom`
        <modelRoot>
          <span __id="span1">
            <text __id="text1">test1</text>
          </span>
          <div __id="div1">
            <!--[               -->
            <span __id="span2">
              <text __id="text2">test2</text>
              <span __id="span3">
                <span __id="span4">
                  <text __id="text3">test3</text>
                </span>
                <!--                 ]-->
                <text __id="text4">test4</text>
                <text __id="text5">test5</text>
                <span>
                  <text __id="text6">test6</text>
                </span>
              </span>
            </span>
          </div>
          <text __id="text7">test7</text>
          <span>
            <span>
              <span>
                <span>
                  <text __id="superDeep">test</text>
                </span>
              </span>
            </span>
          </span>
        </modelRoot>
      `;
      // language=XML
      const { root: expected } = vdom`
        <modelRoot>
          <span __id="span1">
            <text __id="text1">test1</text>
          </span>
          <div>
            <div __id="insertNode1">
              <text>inserted</text>
            </div>
            <div __id="insertNode2">
              <span>
                <text>inserted</text>
              </span>
            </div>
            <span>
              <span>
                <text>st4</text>
                <text>test5</text>
                <span>
                  <text __id="text6">test6</text>
                </span>
              </span>
            </span>
          </div>
          <text>test7</text>
          <span>
            <span>
              <span>
                <span>
                  <text __id="superDeep">test</text>
                </span>
              </span>
            </span>
          </span>
        </modelRoot>
      `;
      // insertionDom
      // language=XML
      const {
        elements: { insertNode1, insertNode2 },
      } = vdom`
        <div>
          <div __id="insertNode1">
            <text>inserted</text>
          </div>
          <div __id="insertNode2">
            <span>
              <text>inserted</text>
            </span>
          </div>
        </div>
      `;
      ModelNode.assertModelElement(initial);
      const start = modelPosToSimplePos(
        ModelPosition.fromInElement(initial, div1, 0)
      );
      const end = modelPosToSimplePos(
        ModelPosition.fromInTextNode(initial, text4, 2)
      );
      const testpos1 = modelPosToSimplePos(
        ModelPosition.fromInTextNode(initial, text4, 3)
      );
      const testpos2 = modelPosToSimplePos(
        ModelPosition.fromAfterNode(initial, span3)
      );
      const testpos3 = modelPosToSimplePos(
        ModelPosition.fromInTextNode(initial, text7, 2)
      );
      // position inside deleted range
      const testpos4 = modelPosToSimplePos(
        ModelPosition.fromInTextNode(initial, text3, 2)
      );
      const testpos5 = modelPosToSimplePos(
        ModelPosition.fromInTextNode(initial, text6, 2)
      );

      const deepPos = modelPosToSimplePos(
        ModelPosition.fromInTextNode(initial, superDeep, 2)
      );
      const { mapper } = OperationAlgorithms.insert(
        initial,
        { start, end },
        insertNode1,
        insertNode2
      );

      const newEndPos = mapper.mapPosition(end, { bias: 'right' });
      const newStartPos = mapper.mapPosition(start, { bias: 'left' });
      const newStartPosRight = mapper.mapPosition(start, { bias: 'right' });
      const newTestPos1 = mapper.mapPosition(testpos1);
      const newTestPos2 = mapper.mapPosition(testpos2);
      const newTestPos3 = mapper.mapPosition(testpos3);
      const newTestPos4LeftBias = mapper.mapPosition(testpos4, {
        bias: 'left',
      });
      const newTestPos4RightBias = mapper.mapPosition(testpos4, {
        bias: 'right',
      });
      const newTestPos5 = mapper.mapPosition(testpos5);
      const newDeepPos = mapper.mapPosition(deepPos);

      assert.true(initial.sameAs(expected));
      assert.strictEqual(
        newEndPos,
        pathToSimplePos(initial, [1, 2, 0, 0], false)
      );
      assert.strictEqual(newStartPos, pathToSimplePos(initial, [1, 0], false));
      assert.strictEqual(
        newStartPosRight,
        pathToSimplePos(initial, [1, 2], false)
      );
      assert.strictEqual(
        newTestPos1,
        pathToSimplePos(initial, [1, 2, 0, 1], false)
      );
      assert.strictEqual(
        newTestPos2,
        pathToSimplePos(initial, [1, 2, 1], false)
      );
      assert.strictEqual(newTestPos3, pathToSimplePos(initial, [4], false));
      assert.strictEqual(
        newTestPos4LeftBias,
        pathToSimplePos(initial, [1, 2, 0, 0])
      );
      assert.strictEqual(newTestPos4RightBias, newEndPos);
      assert.strictEqual(
        newTestPos5,
        pathToSimplePos(initial, [1, 2, 0, 8, 2], false)
      );
      assert.strictEqual(
        newDeepPos,
        pathToSimplePos(initial, [7, 0, 0, 0, 2], false)
      );
    });
    test('collapsed insertion', function (assert) {
      //language=XML
      const {
        root: initial,
        elements: { span3 },
        textNodes: { text2, text4, text6, text7, superDeep },
      } = vdom`
        <modelRoot>
          <span __id="span1">
            <text __id="text1">test1</text>
          </span>
          <div __id="div1">
            <span __id="span2">
              <!--                 | -->
              <text __id="text2">test2</text>
              <span __id="span3">
                <span __id="span4">
                  <text __id="text3">test3</text>
                </span>
                <text __id="text4">test4</text>
                <text __id="text5">test5</text>
                <span>
                  <text __id="text6">test6</text>
                </span>
              </span>
            </span>
          </div>
          <text __id="text7">test7</text>
          <span>
            <span>
              <span>
                <span>
                  <text __id="superDeep">test</text>
                </span>
              </span>
            </span>
          </span>
        </modelRoot>
      `;
      // language=XML
      const { root: expected } = vdom`
        <modelRoot>
          <span __id="span1">
            <text __id="text1">test1</text>
          </span>
          <div __id="div1">
            <span __id="span2">
              <!--                 | -->
              <text __id="text2">te</text>
              <div __id="insertNode1">
                <text>inserted</text>
              </div>
              <div __id="insertNode2">
                <span>
                  <text>inserted</text>
                </span>
              </div>
              <text>st2</text>
              <span __id="span3">
                <span __id="span4">
                  <text __id="text3">test3</text>
                </span>
                <text __id="text4">test4</text>
                <text __id="text5">test5</text>
                <span>
                  <text __id="text6">test6</text>
                </span>
              </span>
            </span>
          </div>
          <text __id="text7">test7</text>
          <span>
            <span>
              <span>
                <span>
                  <text __id="superDeep">test</text>
                </span>
              </span>
            </span>
          </span>
        </modelRoot>
      `;
      // insertionDom
      // language=XML
      const {
        elements: { insertNode1, insertNode2 },
      } = vdom`
        <div>
          <div __id="insertNode1">
            <text>inserted</text>
          </div>
          <div __id="insertNode2">
            <span>
              <text>inserted</text>
            </span>
          </div>
        </div>
      `;
      ModelNode.assertModelElement(initial);
      const insertionRange = modelRangeToSimpleRange(
        ModelRange.fromInTextNode(initial, text2, 2, 2)
      );
      const testpos1 = modelPosToSimplePos(
        ModelPosition.fromInTextNode(initial, text4, 3)
      );
      const testpos2 = modelPosToSimplePos(
        ModelPosition.fromAfterNode(initial, span3)
      );
      const testpos3 = modelPosToSimplePos(
        ModelPosition.fromInTextNode(initial, text7, 2)
      );
      const testpos5 = modelPosToSimplePos(
        ModelPosition.fromInTextNode(initial, text6, 2)
      );

      const deepPos = modelPosToSimplePos(
        ModelPosition.fromInTextNode(initial, superDeep, 2)
      );
      const { mapper } = OperationAlgorithms.insert(
        initial,
        insertionRange,
        insertNode1,
        insertNode2
      );

      const newEndPos = mapper.mapPosition(insertionRange.end);
      const newStartPos = mapper.mapPosition(insertionRange.start);
      const newStartPosLeft = mapper.mapPosition(insertionRange.start, {
        bias: 'left',
      });
      const newTestPos1 = mapper.mapPosition(testpos1);
      const newTestPos2 = mapper.mapPosition(testpos2);
      const newTestPos3 = mapper.mapPosition(testpos3);
      const newTestPos5 = mapper.mapPosition(testpos5);
      const newDeepPos = mapper.mapPosition(deepPos);

      assert.true(initial.sameAs(expected));
      assert.strictEqual(newEndPos, pathToSimplePos(initial, [1, 0, 4], false));
      assert.strictEqual(
        newStartPos,
        pathToSimplePos(initial, [1, 0, 4], false)
      );
      assert.strictEqual(
        newStartPosLeft,
        pathToSimplePos(initial, [1, 0, 2], false)
      );
      assert.strictEqual(
        newTestPos1,
        pathToSimplePos(initial, [1, 0, 7, 4], false)
      );
      assert.strictEqual(
        newTestPos2,
        pathToSimplePos(initial, [1, 0, 8], false)
      );
      assert.strictEqual(newTestPos3, pathToSimplePos(initial, [4], false));
      assert.strictEqual(
        newTestPos5,
        pathToSimplePos(initial, [1, 0, 7, 11, 2], false)
      );
      assert.strictEqual(
        newDeepPos,
        pathToSimplePos(initial, [7, 0, 0, 0, 2], false)
      );
    });
    test('insert single char', function (assert) {
      //language=XML
      const {
        root: initial,
        textNodes: { text1 },
      } = vdom`
        <modelRoot>
          <text __id="text1">test</text>
        </modelRoot>
      `;
      //language=XML
      const { root: expected } = vdom`
        <modelRoot>
          <text __id="text1">txest</text>
        </modelRoot>
      `;
      ModelNode.assertModelElement(initial);
      const insertNode = new ModelText('x');
      const insertionRange = ModelRange.fromInTextNode(initial, text1, 1, 1);
      const { mapper } = OperationAlgorithms.insert(
        initial,
        modelRangeToSimpleRange(insertionRange, false),
        insertNode
      );
      const cursorPosition = modelPosToSimplePos(insertionRange.end, false);
      assert.true(initial.sameAs(expected));
      assert.strictEqual(
        mapper.mapPosition(cursorPosition, { bias: 'left' }),
        pathToSimplePos(initial, [1], false)
      );
      assert.strictEqual(
        mapper.mapPosition(cursorPosition, {
          bias: 'right',
        }),
        pathToSimplePos(initial, [2], false)
      );
    });
  }
);
