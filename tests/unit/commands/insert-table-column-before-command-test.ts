import InsertTableColumnBeforeCommand from '@lblod/ember-rdfa-editor/commands/insert-table-column-before-command';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { INVISIBLE_SPACE } from '@lblod/ember-rdfa-editor/utils/constants';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import { makeTestExecute, stateWithRange } from 'dummy/tests/test-utils';
import { module, test } from 'qunit';

module(
  'Unit | commands | insert-table-column-before-command-test',
  function () {
    const command = new InsertTableColumnBeforeCommand();
    const executeCommand = makeTestExecute(command);

    test('inserts column before first column (empty table)', function (assert) {
      // language=XML
      const {
        root: initial,
        elements: { bottomLeft },
      } = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
            </tr>
            <tr>
              <td __id="bottomLeft"><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

      // language=XML
      const { root: expected } = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
            </tr>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

      const range = ModelRange.fromInElement(bottomLeft, 0, 0);
      const initialState = stateWithRange(initial, range);
      const { resultState } = executeCommand(initialState, {});
      assert.true(resultState.document.sameAs(expected));
    });

    test('inserts column before first column (table filled with text)', function (assert) {
      // language=XML
      const {
        root: initial,
        textNodes: { bottomLeft },
      } = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td>
                <text>abcd</text>
              </td>
              <td>
                <text>efgh</text>
              </td>
            </tr>
            <tr>
              <td>
                <text __id="bottomLeft">ijkl</text>
              </td>
              <td>
                <text>mnop</text>
              </td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

      // language=XML
      const { root: expected } = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td>
                <text>abcd</text>
              </td>
              <td>
                <text>efgh</text>
              </td>
            </tr>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td>
                <text>ijkl</text>
              </td>
              <td>
                <text>mnop</text>
              </td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

      const range = ModelRange.fromInTextNode(bottomLeft, 1, 3);
      const initialState = stateWithRange(initial, range);
      const { resultState } = executeCommand(initialState, {});
      assert.true(resultState.document.sameAs(expected));
    });

    test('inserts column in the middle (empty table)', function (assert) {
      // language=XML
      const {
        root: initial,
        elements: { bottomRight },
      } = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
            </tr>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td __id="bottomRight"><text>${INVISIBLE_SPACE}</text></td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

      // language=XML
      const { root: expected } = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
            </tr>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

      const range = ModelRange.fromInElement(bottomRight, 0, 0);
      const initialState = stateWithRange(initial, range);
      const { resultState } = executeCommand(initialState, {});
      assert.true(resultState.document.sameAs(expected));
    });

    test('inserts column in the middle (table filled with text)', function (assert) {
      // language=XML
      const {
        root: initial,
        textNodes: { bottomRight },
      } = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td>
                <text>abcd</text>
              </td>
              <td>
                <text>efgh</text>
              </td>
            </tr>
            <tr>
              <td>
                <text>ijkl</text>
              </td>
              <td>
                <text __id="bottomRight">mnop</text>
              </td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

      // language=XML
      const { root: expected } = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td>
                <text>abcd</text>
              </td>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td>
                <text>efgh</text>
              </td>
            </tr>
            <tr>
              <td>
                <text>ijkl</text>
              </td>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td>
                <text>mnop</text>
              </td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

      const range = ModelRange.fromInTextNode(bottomRight, 1, 3);
      const initialState = stateWithRange(initial, range);
      const { resultState } = executeCommand(initialState, {});
      assert.true(resultState.document.sameAs(expected));
    });
  }
);
