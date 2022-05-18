import { module, test } from 'qunit';
import ModelTestContext from 'dummy/tests/utilities/model-test-context';
import MakeListCommand from '@lblod/ember-rdfa-editor/commands/make-list-command';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { vdom } from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import { makeTestExecute, stateWithRange } from 'dummy/tests/test-utils';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';

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
          <li><text></text></li>
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
        <text>${'\n'}</text>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <text>${'\n'}</text>
        <ul>
          <li><text></text></li>
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
    assert.true(resultState.document.sameAs(expected));
  });
});
