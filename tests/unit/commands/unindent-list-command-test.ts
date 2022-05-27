import { module, test } from 'qunit';
import ModelTestContext from 'dummy/tests/utilities/model-test-context';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import UnindentListCommand from '@lblod/ember-rdfa-editor/commands/unindent-list-command';
import { makeTestExecute, stateWithRange } from 'dummy/tests/test-utils';
import { vdom } from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';

module('Unit | commands | unindent-list-command-test', function (hooks) {
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
    console.log(resultState.document.toXml());

    assert.true(resultState.document.sameAs(expected));
  });
});
