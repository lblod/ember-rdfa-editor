import MakeListCommand from '@lblod/ember-rdfa-editor/commands/make-list-command';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import { INVISIBLE_SPACE } from '@lblod/ember-rdfa-editor/utils/constants';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import { makeTestExecute, stateWithRange } from 'dummy/tests/test-utils';
import { module, test } from 'qunit';

module('Unit | commands | make-list-command', function () {
  const command = new MakeListCommand();
  const executeCommand = makeTestExecute(command);

  test('adds list in an empty document', function (assert) {
    // language=XML
    const { root: initial } = vdom`
      <modelRoot/>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <ul>
          <li><text>${INVISIBLE_SPACE}</text></li>
        </ul>
      </modelRoot>
    `;

    const range = ModelRange.fromInNode(initial, 0, 0);
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, { listType: 'ul' });
    assert.true(resultState.document.sameAs(expected));
  });

  test('adds list in a document with only a new line', function (assert) {
    // language=XML
    const { root: initial } = vdom`
      <modelRoot>
        <br/>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <br/>
        <ul>
          <li><text>${INVISIBLE_SPACE}</text></li>
        </ul>
      </modelRoot>
    `;

    const range = ModelRange.fromInNode(initial, 1, 1);
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, { listType: 'ul' });
    assert.true(resultState.document.sameAs(expected));
  });

  test('creates list from lines of text', function (assert) {
    // language=XML
    const { root: initial } = vdom`
      <modelRoot>
        <text>first line</text>
        <br/>
        <text>second line</text>
        <br/>
        <text>third line</text>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <ul>
          <li>
            <text>first line</text>
          </li>
          <li>
            <text>second line</text>
          </li>
          <li>
            <text>third line</text>
          </li>
        </ul>
      </modelRoot>
    `;

    const range = ModelRange.fromInNode(
      initial,
      0,
      (initial as ModelElement).getMaxOffset()
    );
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, { listType: 'ul' });
    assert.true(resultState.document.sameAs(expected));
  });

  test('creates list from text before list', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { firstLine },
    } = vdom`
      <modelRoot>
        <text __id="firstLine">line before list</text>
        <ul>
          <li>
            <text>first li</text>
          </li>
          <li>
            <text>second li</text>
          </li>
        </ul>
      </modelRoot>
    `;

    const { root: expected } = vdom`
      <modelRoot>
        <ul>
          <li>
            <text>line before list</text>
          </li>
          <li>
            <text>first li</text>
          </li>
          <li>
            <text>second li</text>
          </li>
        </ul>
      </modelRoot>
    `;

    const range = ModelRange.fromInTextNode(firstLine, 1, 3);
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, { listType: 'ul' });
    assert.true(
      resultState.document.sameAs(expected),
      QUnit.dump.parse(resultState.document)
    );
  });
  test('create list from line with link in it', function (assert) {
    const {
      root: initial,
      textNodes: { link },
    } = vdom`
      <modelRoot>
        <text>line before list</text>
        <a>
          <text __id="link">link</text>
        </a>
      </modelRoot>
    `;

    const { root: expected } = vdom`
      <modelRoot>
        <ul>
          <li>
            <text>line before list</text>
            <a>
              <text __id="link">link</text>
            </a>
          </li>
        </ul>
      </modelRoot>
    `;

    const range = ModelRange.fromInTextNode(link, 2, 2);
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, { listType: 'ul' });
    assert.true(resultState.document.sameAs(expected));
  });
  test('create list from line with nested nodes', function (assert) {
    const {
      root: initial,
      textNodes: { link2 },
    } = vdom`
      <modelRoot>
        <text>first</text>
        <a>
          <text>link1</text>
        </a>
        <text>second</text>
        <a>
          <span>
            <text __id="link2">link2</text>
          </span>
        </a>
        <text>third</text>
      </modelRoot>
    `;

    const { root: expected } = vdom`
      <modelRoot>
        <ul>
          <li>
            <text>first</text>
            <a>
              <text>link1</text>
            </a>
            <text>second</text>
            <a>
              <span>
                <text __id="link2">link2</text>
              </span>
            </a>
            <text>third</text>
          </li>
        </ul>
      </modelRoot>
    `;

    const range = ModelRange.fromInTextNode(link2, 2, 2);
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, { listType: 'ul' });
    assert.true(resultState.document.sameAs(expected));
  });
});
