import { module, test } from 'qunit';
import { vdom } from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import OperationAlgorithms from '@lblod/ember-rdfa-editor/model/operations/operation-algorithms';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';

module(
  'Unit | model | operations | algorithms | remove-algorithm-test | ',

  () => {
    test('should only remove selected nodes', (assert) => {
      const {
        root: initial,
        elements: { span1, span2, span3, span4, div1 },
        textNodes: { text1, text2, text3, text4, text5, text6 },
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
              </span>
            </span>
          </div>
          <text __id="text6">test6</text>
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
              </span>
            </span>
          </div>
          <text>test6</text>
        </modelRoot>
      `;
      const start = ModelPosition.fromInElement(div1, 0);
      const end = ModelPosition.fromInTextNode(text4, 2);
      const testpos1 = ModelPosition.fromInTextNode(text4, 3);
      const testpos2 = ModelPosition.fromAfterNode(span3);
      const testpos3 = ModelPosition.fromInTextNode(text6, 2);
      // position inside deleted range
      const testpos4 = ModelPosition.fromInTextNode(text3, 2);

      const { removedNodes, mapper } = OperationAlgorithms.remove(
        new ModelRange(start, end)
      );

      const newEndPos = mapper.mapPosition(end);
      const newStartPos = mapper.mapPosition(start);
      const newTestPos1 = mapper.mapPosition(testpos1);
      const newTestPos2 = mapper.mapPosition(testpos2);
      const newTestPos3 = mapper.mapPosition(testpos3);
      const newTestPos4LeftBias = mapper.mapPosition(testpos4, 'left');
      const newTestPos4RightBias = mapper.mapPosition(testpos4, 'right');

      assert.true(initial.sameAs(expected));
      assert.deepEqual(newEndPos.path, [1, 0, 0, 0]);
      assert.deepEqual(newStartPos.path, [1, 0]);
      assert.deepEqual(newTestPos1.path, [1, 0, 0, 1]);
      assert.deepEqual(newTestPos2.path, [1, 0, 1]);
      assert.deepEqual(newTestPos3.path, [4]);
      assert.true(newTestPos4LeftBias.sameAs(newStartPos));
      assert.true(newTestPos4RightBias.sameAs(newEndPos));

      // assert.deepEqual(newPos.path, [2]);
    });
  }
);

