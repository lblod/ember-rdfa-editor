import { module, test } from 'qunit';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import OperationAlgorithms from '@lblod/ember-rdfa-editor/model/operations/operation-algorithms';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';

module(
  'Unit | model | operations | algorithms | remove-algorithm-test | ',

  function () {
    test('should only remove selected nodes', function (assert) {
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
      const start = ModelPosition.fromInElement(div1, 0);
      const end = ModelPosition.fromInTextNode(text4, 2);
      const testpos1 = ModelPosition.fromInTextNode(text4, 3);
      const testpos2 = ModelPosition.fromAfterNode(span3);
      const testpos3 = ModelPosition.fromInTextNode(text7, 2);
      // position inside deleted range
      const testpos4 = ModelPosition.fromInTextNode(text3, 2);
      const testpos5 = ModelPosition.fromInTextNode(text6, 2);

      const deepPos = ModelPosition.fromInTextNode(superDeep, 2);
      const { mapper: removeMapper } = OperationAlgorithms.remove(
        new ModelRange(start, end)
      );

      const newEndPos = removeMapper.mapPosition(end);
      const newStartPos = removeMapper.mapPosition(start);
      const newStartPosLeft = removeMapper.mapPosition(start, 'left');
      const newTestPos1 = removeMapper.mapPosition(testpos1);
      const newTestPos2 = removeMapper.mapPosition(testpos2);
      const newTestPos3 = removeMapper.mapPosition(testpos3);
      const newTestPos4LeftBias = removeMapper.mapPosition(testpos4, 'left');
      const newTestPos4RightBias = removeMapper.mapPosition(testpos4, 'right');
      const newTestPos5 = removeMapper.mapPosition(testpos5);
      const newDeepPos = removeMapper.mapPosition(deepPos);

      assert.true(initial.sameAs(expected));
      assert.deepEqual(newEndPos.path, [1, 0, 0, 0]);
      assert.deepEqual(newStartPos.path, [1, 0, 0, 0]);
      assert.deepEqual(newStartPosLeft.path, [1, 0]);
      assert.deepEqual(newTestPos1.path, [1, 0, 0, 1]);
      assert.deepEqual(newTestPos2.path, [1, 0, 1]);
      assert.deepEqual(newTestPos3.path, [4]);
      assert.true(newTestPos4LeftBias.sameAs(newStartPosLeft));
      assert.true(newTestPos4RightBias.sameAs(newEndPos));
      assert.deepEqual(newTestPos5.path, [1, 0, 0, 8, 2]);
      assert.deepEqual(newDeepPos.path, [7, 0, 0, 0, 2]);
    });
  }
);
