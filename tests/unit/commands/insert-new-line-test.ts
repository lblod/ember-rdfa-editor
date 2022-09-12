import InsertNewLineCommand from '@lblod/ember-rdfa-editor/commands/insert-newLine-command';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import { INVISIBLE_SPACE } from '@lblod/ember-rdfa-editor/utils/constants';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import { makeTestExecute, testState } from 'dummy/tests/test-utils';
import { module, test } from 'qunit';

module('Unit | commands | insert-new-line-test', function () {
  const command = new InsertNewLineCommand();
  const executeCommand = makeTestExecute(command);
  test('inserts a new line before a table', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { rangeMarker },
    } = vdom`
      <modelRoot>
        <text>
        </text>
        <text __id="rangeMarker">Before the table${INVISIBLE_SPACE}</text>
        <table class="say-table">
          <thead>
            <tr>
              <th>
                <text>h1${INVISIBLE_SPACE}</text>
              </th>
              <th>
                <text>h2${INVISIBLE_SPACE}</text>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <text>c1${INVISIBLE_SPACE}</text>
              </td>
              <td>
                <text>c2${INVISIBLE_SPACE}</text>
              </td>
            </tr>
          </tbody>
        </table>
        <text>${INVISIBLE_SPACE}After the table
        </text>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <text>
        </text>
        <text>Before the table${INVISIBLE_SPACE}</text>
        <br />
        <table class="say-table">
          <thead>
            <tr>
              <th>
                <text>h1${INVISIBLE_SPACE}</text>
              </th>
              <th>
                <text>h2${INVISIBLE_SPACE}</text>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <text>c1${INVISIBLE_SPACE}</text>
              </td>
              <td>
                <text>c2${INVISIBLE_SPACE}</text>
              </td>
            </tr>
          </tbody>
        </table>
        <text>${INVISIBLE_SPACE}After the table
        </text>
      </modelRoot>
    `;
    const initialState = testState({ document: initial });
    const range = ModelRange.fromInTextNode(
      rangeMarker,
      rangeMarker.length,
      rangeMarker.length
    );
    const { resultState } = executeCommand(initialState, { range });

    assert.true(resultState.document.sameAs(expected));
    assert.deepEqual(
      resultState.selection.lastRange?.start.path.length,
      range.start.path.length
    );
    assert.deepEqual(
      resultState.selection.lastRange?.start.parentOffset,
      range.start.parentOffset + 1
    );
  });
});
