import UnindentListCommand from '@lblod/ember-rdfa-editor/commands/unindent-list-command';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import { makeTestExecute, stateWithRange } from 'dummy/tests/test-utils';
import { module, test } from 'qunit';

module('Unit | commands | unindent-list-command-test', function () {
  const command = new UnindentListCommand();
  const executeCommand = makeTestExecute(command);

  test('should unindent simple list', function (assert) {
    const {
      root: initial,
      textNodes: { content21 },
    } = vdom`
        <modelRoot>
          <ul>
            <li>
              <text __id="content11">test</text>
            </li>
            <li>
              <text __id="content12">test</text>
              <ul>
                <li>
                  <text __id="content21">test</text>
                </li>
                <li>
                  <text __id="content22">test</text>
                </li>
                <li>
                  <text __id="content23">test</text>
                </li>
                <li>
                  <text __id="content24">test</text>
                </li>
              </ul>
            </li>
            <li>
              <text __id="content13">test</text>
            </li>
            <li>
              <text __id="content14">test</text>
            </li>
          </ul>
        </modelRoot>`;
    const { root: expected } = vdom`
        <modelRoot>
          <ul>
            <li>
              <text __id="content11">test</text>
            </li>
            <li>
              <text __id="content12">test</text>
            </li>

            <li>
              <text __id="content21">test</text>
              <ul>
                <li>
                  <text __id="content22">test</text>
                </li>
                <li>
                  <text __id="content23">test</text>
                </li>
                <li>
                  <text __id="content24">test</text>
                </li>
              </ul>
            </li>
            <li>
              <text __id="content13">test</text>
            </li>
            <li>
              <text __id="content14">test</text>
            </li>
          </ul>
        </modelRoot>`;
    const initialState = stateWithRange(
      initial,
      ModelRange.fromInTextNode(content21, 2, 2)
    );
    const { resultState } = executeCommand(initialState, {});

    assert.true(resultState.document.sameAs(expected));
  });
});
