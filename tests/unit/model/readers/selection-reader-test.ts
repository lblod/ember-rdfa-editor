import { module, test } from 'qunit';
import SelectionReader from '@lblod/ember-rdfa-editor/model/readers/selection-reader';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import { domStripped } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import { stateFromDom } from 'dummy/tests/test-utils';

module('Unit | model | readers | selection-reader', function () {
  const reader = new SelectionReader();

  test('converts a dom range correctly', function (assert) {
    const rootNode = document.createElement('div');
    const text = new Text('abc');
    rootNode.appendChild(text);

    const state = stateFromDom(rootNode);
    const testRange = document.createRange();
    testRange.setStart(text, 0);
    testRange.setEnd(text, 0);

    const result = reader.readDomRange(state, rootNode, testRange);
    assert.true(result?.collapsed);
    assert.true(
      result?.start.sameAs(ModelPosition.fromPath(state.document, [0]))
    );
  });
  test('correctly handles a tripleclick selection', function (assert) {
    const rootNode = document.createElement('div');
    const paragraph = document.createElement('p');
    const t1 = new Text('abc');
    const br1 = document.createElement('br');
    const t2 = new Text('def');
    const br2 = document.createElement('br');
    paragraph.append(t1, br1, t2, br2);

    const psibling = document.createElement('div');
    const t3 = new Text('i should not be selected');
    psibling.appendChild(t3);

    rootNode.append(paragraph, psibling);
    const state = stateFromDom(rootNode);
    const range = document.createRange();
    range.setStart(rootNode.childNodes[0].childNodes[0], 0);
    range.setEnd(rootNode.childNodes[0], 4);
    const result = reader.readDomRange(state, rootNode, range);
    assert.deepEqual(result?.start.path, [0, 0]);
    assert.deepEqual(result?.end.path, [0, 8]);
  });
  module(
    'Unit | model | reader | selection-reader | readDomPosition',
    function () {
      test('converts a dom position correctly', function (assert) {
        const rootNode = document.createElement('div');
        const text = new Text('abc');
        rootNode.appendChild(text);
        const state = stateFromDom(rootNode);

        const result = reader.readDomPosition(state, rootNode, text, 0);
        assert.true(
          result?.sameAs(ModelPosition.fromPath(state.document, [0]))
        );
      });
      test('converts a dom position correctly before text node', function (assert) {
        const rootNode = document.createElement('div');
        const text = new Text('abc');
        rootNode.appendChild(text);
        const state = stateFromDom(rootNode);

        const result = reader.readDomPosition(state, rootNode, text, 0);
        assert.true(
          result?.sameAs(ModelPosition.fromPath(state.document, [0]))
        );
      });
      test('converts a dom position correctly after text node', function (assert) {
        const rootNode = document.createElement('div');
        const text = new Text('abc');
        rootNode.appendChild(text);
        const state = stateFromDom(rootNode);

        const result = reader.readDomPosition(state, rootNode, text, 3);
        assert.true(
          result?.sameAs(ModelPosition.fromPath(state.document, [3]))
        );
      });

      test('converts a dom position correctly when before element', function (assert) {
        const rootNode = document.createElement('div');
        const child0 = document.createElement('div');
        const child1 = document.createElement('div');
        const child2 = document.createElement('div');
        rootNode.append(child0, child1, child2);

        const child10 = document.createElement('div');
        const child11 = document.createElement('div');
        const child12 = new Text('abc');
        const child13 = document.createElement('div');
        child1.append(child10, child11, child12, child13);
        const state = stateFromDom(rootNode);

        let result = reader.readDomPosition(state, rootNode, child1, 0);
        assert.true(
          result?.sameAs(ModelPosition.fromPath(state.document, [1, 0]))
        );

        result = reader.readDomPosition(state, rootNode, child1, 0);
        assert.true(
          result?.sameAs(ModelPosition.fromPath(state.document, [1, 0]))
        );

        result = reader.readDomPosition(state, rootNode, child1, 1);
        assert.true(
          result?.sameAs(ModelPosition.fromPath(state.document, [1, 1]))
        );

        result = reader.readDomPosition(state, rootNode, child12, 3);
        assert.true(
          result?.sameAs(ModelPosition.fromPath(state.document, [1, 5]))
        );
      });
      test('converts a position inside a br correctly', function (assert) {
        // A cursor position inside a br element is perfectly valid in the dom spec
        // Visually it looks identical to the position before the br
        // We currently don't allow (or at least dont handle)
        // positions inside brs so this test is to make sure the
        // conversion is correct
        const testDoc = domStripped`
      <div contenteditable>
        abc
        <br>
        def
      </div>
      `;
        const docRoot = testDoc.body.children[0];
        const br = testDoc.getElementsByTagName('br')[0];
        const state = stateFromDom(docRoot);

        const result = reader.readDomPosition(state, docRoot, br, 0);
        assert.deepEqual(result!.path, [3]);
      });
    }
  );
});
