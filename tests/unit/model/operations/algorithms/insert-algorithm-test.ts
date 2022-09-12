import { module, test } from 'qunit';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import OperationAlgorithms from '@lblod/ember-rdfa-editor/model/operations/operation-algorithms';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelText from '@lblod/ember-rdfa-editor/model/nodes/model-text';

module(
  'Unit | model | operations | algorithms | insert-algorithm-test | ',

  function () {
    test('should insert properly', function (assert) {
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
      const start = ModelPosition.fromInElement(div1, 0);
      const end = ModelPosition.fromInTextNode(text4, 2);
      const testpos1 = ModelPosition.fromInTextNode(text4, 3);
      const testpos2 = ModelPosition.fromAfterNode(span3);
      const testpos3 = ModelPosition.fromInTextNode(text7, 2);
      // position inside deleted range
      const testpos4 = ModelPosition.fromInTextNode(text3, 2);
      const testpos5 = ModelPosition.fromInTextNode(text6, 2);

      const deepPos = ModelPosition.fromInTextNode(superDeep, 2);
      const { mapper } = OperationAlgorithms.insert(
        new ModelRange(start, end),
        insertNode1,
        insertNode2
      );

      const newEndPos = mapper.mapPosition(end);
      const newStartPos = mapper.mapPosition(start, 'left');
      const newStartPosRight = mapper.mapPosition(start, 'right');
      const newTestPos1 = mapper.mapPosition(testpos1);
      const newTestPos2 = mapper.mapPosition(testpos2);
      const newTestPos3 = mapper.mapPosition(testpos3);
      const newTestPos4LeftBias = mapper.mapPosition(testpos4, 'left');
      const newTestPos4RightBias = mapper.mapPosition(testpos4, 'right');
      const newTestPos5 = mapper.mapPosition(testpos5);
      const newDeepPos = mapper.mapPosition(deepPos);

      assert.true(initial.sameAs(expected));
      assert.deepEqual(newEndPos.path, [1, 2, 0, 0]);
      assert.deepEqual(newStartPos.path, [1, 0]);
      assert.deepEqual(newStartPosRight.path, [1, 2, 0, 0]);
      assert.deepEqual(newTestPos1.path, [1, 2, 0, 1]);
      assert.deepEqual(newTestPos2.path, [1, 2, 1]);
      assert.deepEqual(newTestPos3.path, [4]);
      assert.true(newTestPos4LeftBias.sameAs(newStartPos));
      assert.true(newTestPos4RightBias.sameAs(newEndPos));
      assert.deepEqual(newTestPos5.path, [1, 2, 0, 8, 2]);
      assert.deepEqual(newDeepPos.path, [7, 0, 0, 0, 2]);
    });
    test('collapsed insertion', function (assert) {
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
      const insertionRange = ModelRange.fromInTextNode(text2, 2, 2);
      const testpos1 = ModelPosition.fromInTextNode(text4, 3);
      const testpos2 = ModelPosition.fromAfterNode(span3);
      const testpos3 = ModelPosition.fromInTextNode(text7, 2);
      const testpos5 = ModelPosition.fromInTextNode(text6, 2);

      const deepPos = ModelPosition.fromInTextNode(superDeep, 2);
      const { mapper } = OperationAlgorithms.insert(
        insertionRange,
        insertNode1,
        insertNode2
      );

      const newEndPos = mapper.mapPosition(insertionRange.end);
      const newStartPos = mapper.mapPosition(insertionRange.start);
      const newTestPos1 = mapper.mapPosition(testpos1);
      const newTestPos2 = mapper.mapPosition(testpos2);
      const newTestPos3 = mapper.mapPosition(testpos3);
      const newTestPos5 = mapper.mapPosition(testpos5);
      const newDeepPos = mapper.mapPosition(deepPos);

      assert.true(initial.sameAs(expected));
      assert.deepEqual(newEndPos.path, [1, 0, 4]);
      assert.deepEqual(newStartPos.path, [1, 0, 4]);
      assert.deepEqual(newTestPos1.path, [1, 0, 7, 4]);
      assert.deepEqual(newTestPos2.path, [1, 0, 8]);
      assert.deepEqual(newTestPos3.path, [4]);
      assert.deepEqual(newTestPos5.path, [1, 0, 7, 11, 2]);
      assert.deepEqual(newDeepPos.path, [7, 0, 0, 0, 2]);
    });
    test('insert single char', function (assert) {
      const {
        root: initial,
        textNodes: { text1 },
      } = vdom`
        <modelRoot>
          <text __id="text1">test</text>
        </modelRoot>
      `;
      const { root: expected } = vdom`
        <modelRoot>
          <text __id="text1">t</text>
          <text>x</text>
          <text>est</text>
        </modelRoot>
      `;
      const insertNode = new ModelText('x');
      const insertionRange = ModelRange.fromInTextNode(text1, 1, 1);
      const { mapper } = OperationAlgorithms.insert(insertionRange, insertNode);
      const cursorPosition = insertionRange.end;
      assert.true(initial.sameAs(expected));
      assert.deepEqual(mapper.mapPosition(cursorPosition, 'left').path, [1]);
      assert.deepEqual(mapper.mapPosition(cursorPosition, 'right').path, [2]);
    });
  }
);
