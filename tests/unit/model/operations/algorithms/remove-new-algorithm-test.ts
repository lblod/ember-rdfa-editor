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
    /* 
      test5
      ==========================
      <modelRoot>
        <span>
          <text __id="text1">te[s]t</text>
          <text __id="text2">test[2]</text>
          <text __id="text3">test3</text>
          <text __id="text4">[test4</text>
          <text __id="text5">test5]</text>
          <span>
            <text __id="text6">test[6</text>
            <text __id="text7">t]est7</text>
          </span>
        </span>
      </modelRoot>

      <modelRoot>
        <span>
          <text __id="text1">tet</text>
          <text __id="text2">testtest3</text>
          <span>
            <text __id="text6">testest7</text>
          </span>
        </span>
      </modelRoot>
      
    */
    test('sibling tests', (assert) => {
      const {
        root: initial,
        textNodes: { text1, text2, text3, text4, text5, text6, text7 },
      } = vdom`
        <modelRoot>
          <span>
            <text __id="text1">test</text>
            <text __id="text2">test2</text>
            <text __id="text3">test3</text>
            <text __id="text4">test4</text>
            <text __id="text5">test5</text>
            <span>
              <text __id="text6">test6</text>
              <text __id="text7">test7</text>
            </span>
          </span>
        </modelRoot>
        `;

      const { root: expected } = vdom`
        <modelRoot>
          <span>  
            <text __id="text1">tet</text>
            <text __id="text2">testtest3</text>
            <span>
              <text __id="text6">testest7</text>
            </span>
          </span>
        </modelRoot>
      `;
      
      const start1 = ModelPosition.fromInTextNode(text1, 2);
      const end1 = ModelPosition.fromInTextNode(text1, 3);
      OperationAlgorithms.removeNew(new ModelRange(start1, end1));

      const start2 = ModelPosition.fromInTextNode(text2,   4);
      const end2 = ModelPosition.fromInTextNode(text2, 5);
      OperationAlgorithms.removeNew(new ModelRange(start2, end2));

      const start4 = ModelPosition.fromInTextNode(text4, 0);
      const end4 = ModelPosition.fromAfterNode(text5);
      OperationAlgorithms.removeNew(new ModelRange(start4, end4));

      const start5 = ModelPosition.fromInTextNode(text6, 4);
      const end5 = ModelPosition.fromInTextNode(text7, 1);
      OperationAlgorithms.removeNew(new ModelRange(start5, end5));
      
      assert.true(initial.sameAs(expected));
    });
  
    test('link tests', (assert) => {
      const {
        root: initial,
        textNodes: { text1, text2, text3, text4, text5, text6 },
      } = vdom`
        <modelRoot>
          <span>
            <a><text __id="text1">test</text></a>
            <text __id="text2">test</text>
          </span>
          <span>
            <text __id="text3">test</text>
            <a><text __id="text4">test</text></a>
          </span>
        </modelRoot>
      `;

      const { root: expected } = vdom`
        <modelRoot>
          <span>
            <a><text __id="text1">t</text></a>
          </span>
          <a><text __id="text4">t</text></a>
        </modelRoot>
      `;
      const start = ModelPosition.fromInTextNode(text1, 2);
      const end = ModelPosition.fromInTextNode(text2, 2);
      OperationAlgorithms.removeNew(new ModelRange(start, end));

      const start1 = ModelPosition.fromInTextNode(text3, 1);
      const end1 = ModelPosition.fromInTextNode(text4, 1);
      OperationAlgorithms.removeNew(new ModelRange(start1, end1));

      const start2 = ModelPosition.fromInTextNode(text4, 0);
      const end2 = ModelPosition.fromInTextNode(text4, 1);
      OperationAlgorithms.removeNew(new ModelRange(start2, end2));

      const start3 = ModelPosition.fromInTextNode(text1, 1);
      const end3 = ModelPosition.fromInTextNode(text4, 1);
      OperationAlgorithms.removeNew(new ModelRange(start3, end3));

      assert.true(initial.sameAs(expected));
    });

    test('correct predicate node mapping', function (assert) {
      // language=XML
      const {
        root: initial,
        elements: { text1, text2, text3, text4, text5, text6 },
      } = vdom`
        <div vocab="http://xmlns.com/foaf/0.1/" typeof="Person"> <!-- about:alice -->
          <p>
            <span property="name">
              <text __id="text1">Alice Birpemswick</text>
            </span>
            <text __id="text2">Email:</text>
            <a property="mbox" href="mailto:alice@example.com">
              <text __id="text3">alice@example.com</text>
            </a>
            <a property="mbox" href="mailto2:alice@example.com">
              <text __id="text4">alice@example.com</text>
            </a>
            <text __id="text5">Phone:</text>
            <a property="phone" href="tel:+1-617-555-7332">
              <text __id="text6">+1 617.555.7332</text>
            </a>
          </p>
        </div>
      `
      const { root: expected } = vdom`
      <div vocab="http://xmlns.com/foaf/0.1/" typeof="Person"> <!-- about:alice -->
        <p>
          <span property="name">
            <text __id="text1">Alice Birpemswick</text>
          </span>
          <text __id="text2">Email:</text>
          <a property="mbox" href="mailto:alice@example.com">
            <text __id="text3">alice@example.com</text>
          </a>
          <a property="mbox" href="mailto2:alice@example.com">
            <text __id="text4">alice@example.com</text>
          </a>
          <text __id="text5">Phone:</text>
          <a property="phone" href="tel:+1-617-555-7332">
            <text __id="text6">+1 617.555.7332</text>
          </a>
        </p>
      </div>
      `
    });
  }
);
