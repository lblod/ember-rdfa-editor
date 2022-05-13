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
          textNodes: { text1 }
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
        `
        const start = ModelPosition.fromInTextNode(text1, 3);
        const end = ModelPosition.fromInTextNode(text1, 3);
        OperationAlgorithms.removeNew(new ModelRange(start, end));
        assert.true(initial.sameAs(expected));
      });
    /*
      test2
      ==========================
      <modelRoot>
        <div>
          test
          <div>
            test
            <span>
              <text __id="text1">te[st</text>
            </span>
            test
          </div>
          <div>
            <text __id="text2">te]st</text>
          </div>
        </div>
      </modelRoot>

      <modelRoot>
        <div>
          test
          <div>
            test
            <span>
              <text __id="text1">te[]st</text>
            </span>
          </div>
        </div>
      </modelRoot>
    */
      test('range is part of a nested structure test', (assert) => {
        const {
          root: initial,
          elements: { div1, div2 },
          textNodes: { text1, text2 }
        } = vdom`
          <modelRoot>
            <div>
              test
              <div __id="div1">
                <text>test</text>
                  <span>
                    <text __id="text1">test</text>
                  </span>
                <text>test</text>
              </div>
              <div __id="div2">
                <text __id="text2">test</text>
              </div>
            </div>
          </modelRoot>
        `;

        const { root: expected } = vdom`
          <modelRoot>
            <div>
              test
              <div>
                <text>test</text>
                <span>
                  <text __id="text1">test</text>
                </span>
              </div>
            </div>
          </modelRoot>
        `

        const start = ModelPosition.fromInTextNode(text1, 2);
        const end = ModelPosition.fromInTextNode(text2, 2);
        const range = new ModelRange(start, end);
        OperationAlgorithms.removeNew(range);
        assert.true(initial.sameAs(expected));
      });
    /*
      test3
      ==========================
      <div>
      te[st
      <div>test
        <div>te]st</div>
      </div>
      </div>

      <div>
      te[]st
      </div>

      test4
      ==========================
      <div>
        <span>
            <text>ab[c</text>
        </span>
      </div>
      <span>
        <text>de]f</text>
      </span>

      <div>
        <span>
          <text>ab[]f</text>
        </span>
      </div>
      
      test5
      ==========================
      <div>
        <span>
            <text>ab[c</text>
        </span>
      </div>
      <span>
        <text>de]f</text>
      </span>

    */

    
  }
);
