import { module, test } from 'qunit';
import RemoveTableRowCommand from '@lblod/ember-rdfa-editor/commands/remove-table-row-command';
import { vdom } from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { makeTestExecute, stateWithRange } from 'dummy/tests/test-utils';

module('Unit | commands | remove-table-row-command-test', function () {
  const command = new RemoveTableRowCommand();
  const executeCommand = makeTestExecute(command);

  test('removes only row', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { left },
    } = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td>
                <text __id="left">abcd</text>
              </td>
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

    const range = ModelRange.fromInTextNode(left, 1, 3);
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, {});
    assert.true(resultState.document.sameAs(expected));
  });

  test('removes first row', function (assert) {
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

    const range = ModelRange.fromInTextNode(topLeft, 1, 3);
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, {});
    assert.true(resultState.document.sameAs(expected));
  });

  test('removes last row', function (assert) {
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
              <td>
                <text>abcd</text>
              </td>
              <td>
                <text>efgh</text>
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

  test('removes middle row', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { middleLeft },
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
                <text __id="middleLeft">ijkl</text>
              </td>
              <td>
                <text>mnop</text>
              </td>
            </tr>
            <tr>
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
                <text>efgh</text>
              </td>
            </tr>
            <tr>
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

    const range = ModelRange.fromInTextNode(middleLeft, 1, 3);
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, {});
    assert.true(resultState.document.sameAs(expected));
  });
});
