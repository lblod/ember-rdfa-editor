import IndentListCommand from '@lblod/ember-rdfa-editor/commands/indent-list-command';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
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
    const { resultState } = executeCommand(initialState, {});
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
  test('selection stays in indented list', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { iniContent },
    } = vdom`
      <div>
        <ul>
          <li>
            <text>abc</text>
          </li>
          <li>
            <!--                    |1-->
            <text __id="iniContent">def</text>
          </li>
        </ul>
      </div>`;

    const start = ModelPosition.fromInTextNode(iniContent, 3);
    const range1 = new ModelRange(start, start);
    const initialState = stateWithRange(initial, range1);
    const { resultState } = executeCommand(initialState, {});
    // language=XML
    const {
      root: expected,
      textNodes: { expContent },
    } = vdom`
      <div>
        <ul>
          <li>
            <text>abc</text>
            <ul>
              <li>
                <!--                       |2-->
                <text __id="expContent">def</text>
              </li>
            </ul>
          </li>
        </ul>
      </div>`;
    const range2 = ModelRange.fromInTextNode(expContent, 3, 3);
    assert.true(
      resultState.document.sameAs(expected),
      QUnit.dump.parse(resultState.document)
    );
    assert.true(
      resultState.selection.lastRange!.sameAs(range2),
      `range1: ${resultState.selection.lastRange!.toString()}, range2: ${range2.toString()}`
    );
  });
  test('uncollapsed selection stays in indented list', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { iniContent },
    } = vdom`
      <div>
        <ul>
          <li>
            <text>abc</text>
          </li>
          <li>
            <!--                    [1]-->
            <text __id="iniContent">def</text>
          </li>
        </ul>
      </div>`;

    const range1 = ModelRange.fromInTextNode(iniContent, 0, 3);
    const initialState = stateWithRange(initial, range1);
    const { resultState } = executeCommand(initialState, {});
    // language=XML
    const {
      root: expected,
      textNodes: { expContent },
    } = vdom`
      <div>
        <ul>
          <li>
            <text>abc</text>
            <ul>
              <li>
                <!--                    [2]-->
                <text __id="expContent">def</text>
              </li>
            </ul>
          </li>
        </ul>
      </div>`;
    const range2 = ModelRange.fromInTextNode(expContent, 0, 3);
    assert.true(
      resultState.document.sameAs(expected),
      QUnit.dump.parse(resultState.document)
    );
    assert.true(
      resultState.selection.lastRange!.sameAs(range2),
      `range1: ${resultState.selection.lastRange!.toString()}, range2: ${range2.toString()}`
    );
  });
});
