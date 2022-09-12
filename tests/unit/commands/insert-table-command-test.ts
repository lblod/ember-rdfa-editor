import InsertTableCommand from '@lblod/ember-rdfa-editor/commands/insert-table-command';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { INVISIBLE_SPACE } from '@lblod/ember-rdfa-editor/utils/constants';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import { makeTestExecute, stateWithRange } from 'dummy/tests/test-utils';
import { module, test } from 'qunit';

module('Unit | commands | insert-table-command-test', function () {
  const command = new InsertTableCommand();
  const executeCommand = makeTestExecute(command);

  test('inserts correctly in empty document', function (assert) {
    // language=XML
    const { root: initial } = vdom`
      <modelRoot/>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <table class="say-table">
          <tbody>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
            </tr>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

    const range = ModelRange.fromInNode(initial, 0, 0);
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, {});
    assert.true(resultState.document.sameAs(expected));
  });

  test('inserts correctly in document with empty text node', function (assert) {
    // language=XML
    const { root: initial } = vdom`
      <modelRoot>
        <text/>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <text/>
        <table class="say-table">
          <tbody>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
            </tr>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

    const range = ModelRange.fromInNode(initial, 0, 0);
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, {});
    assert.true(resultState.document.sameAs(expected));
  });

  test('inserts correctly before table', function (assert) {
    // language=XML
    const { root: initial } = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td>
                <text>first name</text>
              </td>
              <td>
                <text>last name</text>
              </td>
            </tr>
            <tr>
              <td>
                <text>John</text>
              </td>
              <td>
                <text>Doe</text>
              </td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <table class="say-table">
          <tbody>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
            </tr>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
            </tr>
          </tbody>
        </table>
        <table>
          <tbody>
            <tr>
              <td>
                <text>first name</text>
              </td>
              <td>
                <text>last name</text>
              </td>
            </tr>
            <tr>
              <td>
                <text>John</text>
              </td>
              <td>
                <text>Doe</text>
              </td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

    const range = ModelRange.fromInNode(initial, 0, 0);
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, {});
    assert.true(resultState.document.sameAs(expected));
  });

  test('inserts correctly inside text node', function (assert) {
    // language=XML
    const { root: initial } = vdom`
      <modelRoot>
        <text>elephant</text>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <text>ele</text>
        <table class="say-table">
          <tbody>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
            </tr>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
            </tr>
          </tbody>
        </table>
        <text>phant</text>
      </modelRoot>
    `;

    const range = ModelRange.fromInNode(initial, 3, 3);
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, {});
    assert.true(resultState.document.sameAs(expected));
  });

  test('correctly replaces part of text node', function (assert) {
    // language=XML
    const { root: initial } = vdom`
      <modelRoot>
        <text>elephant</text>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <text>el</text>
        <table class="say-table">
          <tbody>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
            </tr>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
            </tr>
          </tbody>
        </table>
        <text>ant</text>
      </modelRoot>
    `;

    const range = ModelRange.fromInNode(initial, 2, 5);
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, {});
    assert.true(resultState.document.sameAs(expected));
  });

  test('correctly replaces complex range', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { rangeStart, rangeEnd },
    } = vdom`
      <modelRoot>
        <div>
          <text __id="rangeStart">elephant</text>
          <span>
            <span/>
            <span>
              <text __id="rangeEnd">monkey</text>
            </span>
            <span/>
          </span>
        </div>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <div>
          <text>ele</text>
          <table class="say-table">
            <tbody>
              <tr>
                <td><text>${INVISIBLE_SPACE}</text></td>
                <td><text>${INVISIBLE_SPACE}</text></td>
              </tr>
              <tr>
                <td><text>${INVISIBLE_SPACE}</text></td>
                <td><text>${INVISIBLE_SPACE}</text></td>
              </tr>
            </tbody>
          </table>
          <span>
            <span>
              <text>key</text>
            </span>
            <span/>
          </span>
        </div>
      </modelRoot>
    `;

    const range = new ModelRange(
      ModelPosition.fromInTextNode(rangeStart, 3),
      ModelPosition.fromInTextNode(rangeEnd, 3)
    );
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, {});
    assert.true(resultState.document.sameAs(expected));
  });
});
