import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';
import { domStripped, vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import { domPosToModelPos } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { testState } from 'dummy/tests/test-utils';
import { module, test } from 'qunit';

module('Unit | model | dom-pos-to-model-pos', function () {
  test('converts position in empty root', function (assert) {
    const dom = domStripped`
      <div />`.body.children[0];

    const {
      elements: { root },
    } = vdom`
      <modelRoot __id="root"></modelRoot>`;

    const state = testState({ document: root });
    const container = dom;
    const resultPos = domPosToModelPos(state, dom, container, 0);
    const expectedPos = ModelPosition.fromPath(root, [0]);
    assert.true(resultPos.sameAs(expectedPos));
  });
  test('converts simple positions correctly 1', function (assert) {
    const dom = domStripped`
      <div>
        abcd
      </div>`.body.children[0];

    const {
      root,
      textNodes: { text1 },
    } = vdom`
      <modelRoot>
        <text __id="text1">abcd</text>
      </modelRoot>`;
    const state = testState({ document: root });
    const container = dom.childNodes[0];
    const resultPos = domPosToModelPos(state, dom, container, 0);
    const expectedPos = ModelPosition.fromInTextNode(text1, 0);
    assert.true(resultPos.sameAs(expectedPos));
  });
  test('converts simple positions correctly 2', function (assert) {
    const dom = domStripped`
      <div>
        abcd
      </div>`.body.children[0];

    const {
      root,
      textNodes: { text1 },
    } = vdom`
      <modelRoot>
        <text __id="text1">abcd</text>
      </modelRoot>`;
    const state = testState({ document: root });
    const container = dom.childNodes[0];
    const resultPos = domPosToModelPos(state, dom, container, 2);
    const expectedPos = ModelPosition.fromInTextNode(text1, 2);
    assert.true(resultPos.sameAs(expectedPos));
  });
  test('converts into offsets', function (assert) {
    const dom = domStripped`
      <div>
        abcd
        <span>efgh</span>
      </div>`.body.children[0];

    const {
      root,
      elements: { span },
    } = vdom`
      <modelRoot>
        <text>abcd</text>
        <span __id="span">
          <text>efgh</text>
        </span>
      </modelRoot>`;
    const state = testState({ document: root });
    const container = dom;
    const resultPos = domPosToModelPos(state, dom, container, 1);
    const expectedPos = ModelPosition.fromBeforeNode(span);
    assert.deepEqual(resultPos.path, expectedPos.path);
  });
  test('correctly converts positions in marks', function (assert) {
    const dom = domStripped`
      <div>
        <strong>abcd</strong>
      </div>`.body.children[0];

    const {
      root,
      textNodes: { text },
    } = vdom`
      <modelRoot>
        <text __marks="bold" __id="text">abcd</text>
      </modelRoot>`;
    const state = testState({ document: root });
    const container = dom.firstChild?.firstChild;
    if (!container) {
      throw new TypeError();
    }
    const resultPos = domPosToModelPos(state, dom, container, 1);
    const expectedPos = ModelPosition.fromInNode(text, 1);
    assert.deepEqual(resultPos.path, expectedPos.path);
  });
  test('correctly converts positions in marks 2', function (assert) {
    const dom = domStripped`
      <div>
        <em>
          <strong>abcd</strong>
        </em>
      </div>`.body.children[0];

    const {
      root,
      textNodes: { text },
    } = vdom`
      <modelRoot>
        <text __marks="bold" __id="text">abcd</text>
      </modelRoot>`;
    const state = testState({ document: root });
    const container = dom.firstChild?.firstChild?.firstChild;
    if (!container) {
      throw new TypeError();
    }
    const resultPos = domPosToModelPos(state, dom, container, 1);
    const expectedPos = ModelPosition.fromInNode(text, 1);
    assert.deepEqual(resultPos.path, expectedPos.path);
  });
});
