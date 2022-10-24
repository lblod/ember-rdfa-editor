import InsertNewLiCommand from '@lblod/ember-rdfa-editor/commands/insert-newLi-command';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import { INVISIBLE_SPACE } from '@lblod/ember-rdfa-editor/utils/constants';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import { makeTestExecute, stateWithRange } from 'dummy/tests/test-utils';
import { module, test } from 'qunit';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';

//TODO: These tests serve at the moment as a documentation for
// what the command currently does, and as a way of catching possible
// regressions for things that might depend on its behavior.
// In particular, all the extra empty textnodes should not be there.

module.skip('Unit | commands | insert-new-li-command-test', function () {
  const command = new InsertNewLiCommand();
  const executeCommand = makeTestExecute(command);

  test('insert li - single empty li - collapsed selection', function (assert) {
    // language=XML
    const {
      root: initial,
      elements: { testLi },
    } = vdom`
      <div>
        <ul>
          <li __id="testLi">
            <text>${INVISIBLE_SPACE}</text>
          </li>
        </ul>
      </div>
    `;

    // language=XML
    const { root: expected } = vdom`
      <div>
        <ul>
          <li>
            <text>${INVISIBLE_SPACE}</text>
          </li>
          <li>
            <text>${INVISIBLE_SPACE}</text>
          </li>
        </ul>
      </div>
    `;

    const range = ModelRange.fromInElement(
      initial as ModelElement,
      testLi,
      0,
      0
    );
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, {});
    assert.true(resultState.document.sameAs(expected));
  });

  test('insert li - single nonempty li - collapsed selection in front', function (assert) {
    // language=XML
    const {
      root: initial,
      elements: { testLi },
    } = vdom`
      <div>
        <ul>
          <li __id="testLi">
            <text>abc</text>
          </li>
        </ul>
      </div>
    `;

    // language=XML
    const { root: expected } = vdom`
      <div>
        <ul>
          <li>
            <text>${INVISIBLE_SPACE}</text>
          </li>
          <li>
            <text>abc</text>
          </li>
        </ul>
      </div>
    `;

    const range = ModelRange.fromInElement(
      initial as ModelElement,
      testLi,
      0,
      0
    );
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, {});
    assert.true(resultState.document.sameAs(expected));
  });

  test('insert li - single nonempty li - collapsed selection at end', function (assert) {
    // language=XML
    const {
      root: initial,
      elements: { testLi },
    } = vdom`
      <div>
        <ul>
          <li __id="testLi">
            <text>abc</text>
          </li>
        </ul>
      </div>
    `;

    // language=XML
    const { root: expected } = vdom`
      <div>
        <ul>
          <li>
            <text>abc</text>
          </li>
          <li>
            <text>${INVISIBLE_SPACE}</text>
          </li>
        </ul>
      </div>
    `;
    const range = ModelRange.fromInElement(
      initial as ModelElement,
      testLi,
      3,
      3
    );
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, {});
    assert.true(
      resultState.document.sameAs(expected),
      QUnit.dump.parse(resultState.document)
    );
  });

  test('insert li - single nonempty li - collapsed selection in middle', function (assert) {
    // language=XML
    const {
      root: initial,
      elements: { testLi },
    } = vdom`
      <div>
        <ul>
          <li __id="testLi">
            <text>abc</text>
          </li>
        </ul>
      </div>
    `;

    // language=XML
    const { root: expected } = vdom`
      <div>
        <ul>
          <li>
            <text>a</text>
          </li>
          <li>
            <text>bc</text>
          </li>
        </ul>
      </div>
    `;

    const range = ModelRange.fromInElement(
      initial as ModelElement,
      testLi,
      1,
      1
    );
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, {});
    assert.true(resultState.document.sameAs(expected));
  });

  test('insert li - single nonempty li with elements - collapsed selection inside child elem', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { insideChild },
    } = vdom`
      <div>
        <ul>
          <li __id="testLi">
            <text>abc</text>
            <span>
              <text __id="insideChild">child</text>
            </span>
            <text>d</text>
          </li>
        </ul>
      </div>
    `;

    // language=XML
    const { root: expected } = vdom`
      <div>
        <ul>
          <li>
            <text>abc</text>
            <span>
              <text>c</text>
            </span>
          </li>
          <li>
            <span>
              <text>hild</text>
            </span>
            <text>d</text>
          </li>
        </ul>
      </div>
    `;

    const range = ModelRange.fromInTextNode(
      initial as ModelElement,
      insideChild,
      1,
      1
    );

    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, {});
    assert.true(resultState.document.sameAs(expected));
  });

  test('insert li - single nonempty li - uncollapsed within li', function (assert) {
    // language=XML
    const {
      root: initial,
      elements: { testLi },
    } = vdom`
      <div>
        <ul>
          <li __id="testLi">
            <text>abcd</text>
          </li>
        </ul>
      </div>
    `;

    // language=XML
    const { root: expected } = vdom`
      <div>
        <ul>
          <li>
            <text>a</text>
          </li>
          <li>
            <text>d</text>
          </li>
        </ul>
      </div>
    `;

    const range = ModelRange.fromInElement(
      initial as ModelElement,
      testLi,
      1,
      3
    );
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, {});
    assert.true(resultState.document.sameAs(expected));
  });

  test('insert li - single nonempty li with elements - uncollapsed within li', function (assert) {
    // language=XML
    const {
      root: initial,
      elements: { testLi },
    } = vdom`
      <div>
        <ul>
          <li __id="testLi">
            <text>abc</text>
            <div>
              <text>inside child</text>
            </div>
            <text>d</text>
          </li>
        </ul>
      </div>
    `;

    // language=XML
    const { root: expected } = vdom`
      <div>
        <ul>
          <li>
            <text>a</text>
          </li>
          <li>
            <text>d</text>
          </li>
        </ul>
      </div>
    `;

    const range = ModelRange.fromInElement(
      initial as ModelElement,
      testLi,
      1,
      testLi.getMaxOffset() - 1
    );

    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, {});
    assert.true(resultState.document.sameAs(expected));
  });
});
