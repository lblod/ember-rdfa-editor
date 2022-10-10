import { module, test } from 'qunit';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';
import { simplePosToModelPos } from '@lblod/ember-rdfa-editor/core/model/simple-position';
import { SimplePositionOutOfRangeError } from '@lblod/ember-rdfa-editor/utils/errors';

module('Unit | model | simple-position-test', function () {
  module('Unit | model | simple-position-test | simple to model', function () {
    test('0 is only valid pos in empty document', function (assert) {
      //language=XML
      const { root: doc } = vdom`
        <modelRoot/>
      `;
      const invalidBefore = -1;
      const invalidAfter = 1;
      const valid = 0;

      const expected = ModelPosition.fromInNode(doc, 0);
      const actualValid = simplePosToModelPos(valid, doc);
      assert.true(actualValid.sameAs(expected));
      assert.throws(() => {
        simplePosToModelPos(invalidBefore, doc);
      }, SimplePositionOutOfRangeError);
      assert.throws(() => {
        simplePosToModelPos(invalidAfter, doc);
      }, SimplePositionOutOfRangeError);
    });
    test('various positions in textnode', function (assert) {
      //language=XML
      const {
        root: doc,
        textNodes: { textNode },
      } = vdom`
        <modelRoot>
          <text __id="textNode">abc</text>
        </modelRoot>
      `;

      const actual1 = simplePosToModelPos(0, doc);
      const expected1 = ModelPosition.fromInNode(doc, 0);

      const actual2 = simplePosToModelPos(1, doc);
      const expected2 = ModelPosition.fromInNode(textNode, 1);

      const actual3 = simplePosToModelPos(3, doc);
      const expected3 = ModelPosition.fromInNode(textNode, 3);

      assert.true(actual1.sameAs(expected1));
      assert.true(actual2.sameAs(expected2));
      assert.true(actual3.sameAs(expected3));
      assert.throws(
        () => simplePosToModelPos(4, doc),
        SimplePositionOutOfRangeError
      );
    });
    test('counts non-text leafnode as 1', function (assert) {
      //language=XML
      const {
        root: doc,
        elements: { br },
      } = vdom`
        <modelRoot>
          <text __id="text1">abc</text>
          <br __id="br"/>
          <text __id="text2">def</text>
        </modelRoot>
      `;
      const actual1 = simplePosToModelPos(3, doc);
      const expected1 = ModelPosition.fromBeforeNode(br);
      const actual2 = simplePosToModelPos(4, doc);
      const expected2 = ModelPosition.fromAfterNode(br);

      assert.true(actual1.sameAs(expected1));
      assert.true(actual2.sameAs(expected2));
    });
    test('counts opening and closing tags as 1', function (assert) {
      //language=XML
      const {
        root: doc,
        textNodes: { innerText },
        elements: { span },
      } = vdom`
        <modelRoot>
          <text __id="text1">abc</text>
          <span __id="span">
            <text __id="innerText">test</text>
          </span>
          <text __id="text2">def</text>
        </modelRoot>
      `;
      const actual1 = simplePosToModelPos(3, doc);
      const expected1 = ModelPosition.fromBeforeNode(span);
      const actual2 = simplePosToModelPos(4, doc);
      const expected2 = ModelPosition.fromInNode(span, 0);

      const actual3 = simplePosToModelPos(8, doc);
      const expected3 = ModelPosition.fromAfterNode(innerText);
      const actual4 = simplePosToModelPos(9, doc);
      const expected4 = ModelPosition.fromAfterNode(span);
      assert.true(actual1.sameAs(expected1));
      assert.true(actual2.sameAs(expected2));
      assert.true(actual3.sameAs(expected3));
      assert.true(actual4.sameAs(expected4));
    });

    test('empty non-leaf element', function (assert) {
      //language=XML
      const {
        root: doc,
        elements: { span },
      } = vdom`
        <modelRoot>
          <span __id="span">
          </span>
        </modelRoot>
      `;
      const actual1 = simplePosToModelPos(0, doc);
      const expected1 = ModelPosition.fromBeforeNode(span);

      const actual2 = simplePosToModelPos(1, doc);
      const expected2 = ModelPosition.fromInNode(span, 0);

      const actual3 = simplePosToModelPos(2, doc);
      const expected3 = ModelPosition.fromAfterNode(span);
      assert.true(actual1.sameAs(expected1));
      assert.true(actual2.sameAs(expected2));
      assert.true(actual3.sameAs(expected3));
    });
    test('multiple non-text leafnodes', function (assert) {
      //language=XML
      const {
        root: doc,
        elements: { span, br1, br2, br3 },
      } = vdom`
        <modelRoot>
          <span __id="span">
            <br __id="br1"/>
            <br __id="br2"/>
            <br __id="br3"/>
          </span>
        </modelRoot>
      `;
      const actual1 = simplePosToModelPos(0, doc);
      const expected1 = ModelPosition.fromBeforeNode(span);

      const actual2 = simplePosToModelPos(1, doc);
      const expected2 = ModelPosition.fromInNode(span, 0);

      const actual3 = simplePosToModelPos(2, doc);
      const expected3 = ModelPosition.fromAfterNode(br1);

      const actual4 = simplePosToModelPos(3, doc);
      const expected4 = ModelPosition.fromAfterNode(br2);

      const actual5 = simplePosToModelPos(4, doc);
      const expected5 = ModelPosition.fromAfterNode(br3);
      assert.true(actual1.sameAs(expected1));
      assert.true(actual2.sameAs(expected2), actual2.path.toString());
      assert.true(actual3.sameAs(expected3));
      assert.true(actual4.sameAs(expected4));
      assert.true(actual5.sameAs(expected5));
    });
    test('multiple empty text nodes', function (assert) {
      //language=XML
      const {
        root: doc,
        textNodes: { text1 },
      } = vdom`
        <modelRoot>
          <text __id="text1"/>
          <text __id="text2"/>
          <text __id="text3"/>
        </modelRoot>
      `;
      const actual1 = simplePosToModelPos(0, doc);
      const expected1 = ModelPosition.fromBeforeNode(text1);

      assert.true(actual1.sameAs(expected1));
      assert.throws(
        () => simplePosToModelPos(1, doc),
        SimplePositionOutOfRangeError
      );
      assert.throws(
        () => simplePosToModelPos(2, doc),
        SimplePositionOutOfRangeError
      );
    });
  });
  module(
    'Unit | model | simple-position-test | model to simple',
    function () {}
  );
});
