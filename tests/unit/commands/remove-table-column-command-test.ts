import { module, test } from 'qunit';
import RemoveTableColumnCommand from '@lblod/ember-rdfa-editor/commands/remove-table-column-command';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { makeTestExecute, stateWithRange } from 'dummy/tests/test-utils';

module('Unit | commands | remove-table-column-command-test', function () {
  const command = new RemoveTableColumnCommand();
  const executeCommand = makeTestExecute(command);

  test('removes only column', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { top },
    } = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td>
                <text __id="top">abcd</text>
              </td>
            </tr>
            <tr>
              <td>
                <text>efgh</text>
              </td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot></modelRoot>
    `;

    const range = ModelRange.fromInTextNode(top, 1, 3);
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, {});
    assert.true(resultState.document.sameAs(expected));
  });

  test('removes first column', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { topLeft },
    } = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td>
                <text __id="topLeft">abcd</text>
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
              <td>
                <text>efgh</text>
              </td>
            </tr>
            <tr>
              <td>
                <text>mnop</text>
              </td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

    const range = ModelRange.fromInTextNode(topLeft, 1, 3);
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, {});
    assert.true(resultState.document.sameAs(expected));
  });

  test('removes last column', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { topRight },
    } = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td>
                <text>abcd</text>
              </td>
              <td>
                <text __id="topRight">efgh</text>
              </td>
            </tr>
            <tr>
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

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td>
                <text>abcd</text>
              </td>
            </tr>
            <tr>
              <td>
                <text>ijkl</text>
              </td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

    const range = ModelRange.fromInTextNode(topRight, 1, 3);
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, {});
    assert.true(resultState.document.sameAs(expected));
  });

  test('removes middle column', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { topMiddle },
    } = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td>
                <text>abcd</text>
              </td>
              <td>
                <text __id="topMiddle">efgh</text>
              </td>
              <td>
                <text>ijkl</text>
              </td>
            </tr>
            <tr>
              <td>
                <text>mnop</text>
              </td>
              <td>
                <text>qrst</text>
              </td>
              <td>
                <text>uvwx</text>
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
              <td>
                <text>ijkl</text>
              </td>
            </tr>
            <tr>
              <td>
                <text>mnop</text>
              </td>
              <td>
                <text>uvwx</text>
              </td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

    const range = ModelRange.fromInTextNode(topMiddle, 1, 3);
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, {});
    assert.true(resultState.document.sameAs(expected));
  });
});
