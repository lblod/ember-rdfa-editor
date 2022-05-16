import { module, test } from 'qunit';
import { vdom } from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import OperationAlgorithms from '@lblod/ember-rdfa-editor/model/operations/operation-algorithms';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';

module(
  'Unit | model | operations | algorithms | remove-new-algorithm-test | ',

  () => {
    /* 
      test1
      ==========================
      <div>tes[]t</div>
      
      <div>tes[]t</div>
    */
    test('range is collapsed test', (assert) => {
      const {
        root: initial,
        elements: { div1 },
        textNodes: { text1 },
      } = vdom`
        <modelRoot>
          <div __id="div1">
            <text __id="text1">test</text>
          </div>
        </modelRoot>
      `;

      const { root: expected } = vdom`
        <modelRoot>
          <div __id="div1">
            <text __id="text1">test</text>
          </div>
        </modelRoot>
      `;
      const start = ModelPosition.fromInTextNode(text1, 3);
      const end = ModelPosition.fromInTextNode(text1, 3);
      OperationAlgorithms.removeNew(new ModelRange(start, end));
      assert.true(initial.sameAs(expected));
    });
    /* 
      test2
      ==========================
      <modelRoot>
        <div __id="div1">
          <text __id="text1">test[</text>
        </div>
        <text __id="text2">te]st</text>
      </modelRoot>

      <modelRoot>
        <div __id="div1">
          <text __id="text1">test[]st</text>
        </div>
      </modelRoot>
      
    */
    test('start is nested and on edge', (assert) => {
      const {
        root: initial,
        elements: { div1 },
        textNodes: { text1, text2 },
      } = vdom`
        <modelRoot>
          <div __id="div1">
            <text __id="text1">test</text>
          </div>
          <text __id="text2">test</text>
        </modelRoot>
      `;

      const { root: expected } = vdom`
        <modelRoot>
          <div __id="div1">
            <text __id="text1">testst</text>
          </div>
        </modelRoot>
      `;
      const start = ModelPosition.fromInTextNode(text1, 4);
      const end = ModelPosition.fromInTextNode(text2, 2);
      OperationAlgorithms.removeNew(new ModelRange(start, end));
      assert.true(initial.sameAs(expected));
    });
    /* 
      test3
      ==========================
      <modelRoot>
        <text __id="text1">te[st</text>
        <div __id="div1">
          <text __id="text2">test]</text>
        </div>
      </modelRoot>

      <modelRoot>
        <text __id="text2">te[]</text>
      </modelRoot>
      
    */
    test('end is nested and on edge', (assert) => {
      const {
        root: initial,
        textNodes: { text1, text2 },
      } = vdom`
        <modelRoot>
          <text __id="text1">test</text>
          <div __id="div1">
            <text __id="text2">test</text>
          </div>
        </modelRoot>
      `;

      const { root: expected } = vdom`
        <modelRoot>
          <text __id="text1">te</text>
        </modelRoot>
      `;
      const start = ModelPosition.fromInTextNode(text1, 2);
      const end = ModelPosition.fromInTextNode(text2, 4);
      OperationAlgorithms.removeNew(new ModelRange(start, end));
      assert.true(initial.sameAs(expected));
    });
    /* 
      test4
      ==========================
      <modelRoot>
        <span>
          <text __id="text1">te[st</text>
          <text>goodbye</text>
        </span>
        <span>
          <text>im gonna dissapear</text>
        </span>
        <div>
          <div>
            <text __id="text2">te]st</text>
            <text>moving</text>
            <text>up</text>
          </div>
          <text>staying here</text>
        </div>
      </modelRoot>

      <modelRoot>
        <span>
          <text __id="text1">te[]st</text>
          <text>moving</text>
          <text>up</text>
        </span>
        <text>staying here</text>
      </modelRoot>
      
    */
    test('deep nesting test', (assert) => {
      const {
        root: initial,
        elements: { div1 },
        textNodes: { text1, text2 },
      } = vdom`
          <modelRoot>
            <span>
              <text __id="text1">test</text>
              <text>goodbye</text>
            </span>
            <span>
              <text>im gonna dissapear</text>
            </span>
            <div>
              <div>
                <text __id="text2">test</text>
                <text>moving</text>
                <text>up</text>
              </div>
              <text>staying here</text>
            </div>
          </modelRoot>
        `;

      const { root: expected } = vdom`
        <modelRoot>
          <span>
            <text __id="text1">test</text>
            <text>moving</text>
            <text>up</text>
          </span>
          <text>staying here</text>
        </modelRoot>
        `;
      const start = ModelPosition.fromInTextNode(text1, 2);
      const end = ModelPosition.fromInTextNode(text2, 2);
      OperationAlgorithms.removeNew(new ModelRange(start, end));
      assert.true(initial.sameAs(expected));
    });
  }
);
