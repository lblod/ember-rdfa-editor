import IndentListCommand from '@lblod/ember-rdfa-editor/commands/indent-list-command';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { vdom } from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import { makeTestExecute, stateWithRange } from 'dummy/tests/test-utils';
import { module, test } from 'qunit';

module('Unit | commands | indent-list-command-test', function () {
  const command = new IndentListCommand();
  const executeCommand = makeTestExecute(command);

  test('indents a simple list', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { content },
    } = vdom`
      <div>
        <ul>
          <li>
            <text>abc</text>
          </li>
          <li>
            <text __id="content">def</text>
          </li>
        </ul>
      </div>`;

    const start = ModelPosition.fromInTextNode(content, 0);
    const range = new ModelRange(start, start);
    const initialState = stateWithRange(initial, range);
    const { resultState, resultValue } = executeCommand(initialState, {});
    // language=XML
    const { root: expected } = vdom`
      <div>
        <ul>
          <li>
            <text>abc</text>
            <ul>
              <li>
                <text>def</text>
              </li>
            </ul>
          </li>
        </ul>
      </div>`;
    assert.true(resultState.document.sameAs(expected));
  });
});
