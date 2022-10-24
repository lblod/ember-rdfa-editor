import { module, test } from 'qunit';
import RemoveListCommand from '@lblod/ember-rdfa-editor/commands/remove-list-command';
import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import { makeTestExecute, stateWithRange } from 'dummy/tests/test-utils';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';

module.skip('Unit | commands | remove-list-command', function () {
  const command = new RemoveListCommand();
  const executeCommand = makeTestExecute(command);

  test('removing a simple list', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { content },
    } = vdom`
      <modelRoot>
        <ul>
          <li>
            <text __id="content">test</text>
          </li>
        </ul>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <text>test</text>
      </modelRoot>
    `;

    const range = ModelRange.fromInNode(initial as ModelElement, content, 0, 0);

    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, {});
    assert.true(resultState.document.sameAs(expected));
  });

  test('removing a nested list', function (assert) {
    const {
      root: initial,
      textNodes: { content },
    } = vdom`
      <modelRoot>
        <ul>
          <li>
            <ul>
              <li><text __id="content">test</text></li>
            </ul>
          </li>
        </ul>
      </modelRoot>`;

    const { root: expected } = vdom`
      <modelRoot>
        <text __id="content">test</text>
      </modelRoot>`;
    const range = ModelRange.fromInNode(initial as ModelElement, content, 0, 0);
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, {});
    assert.true(resultState.document.sameAs(expected));
  });

  test('removing a nested list item with more elements', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { rangeStart },
    } = vdom`
      <modelRoot>
        <ul>
          <li>
            <text>content0</text>
          </li>
          <li>
            <ul>
              <li>
                <text __id="rangeStart">content10</text>
              </li>
              <li>
                <text>content11</text>
              </li>
              <li>
                <text>content12</text>
              </li>
            </ul>
          </li>
          <li>
            <text>content2</text>
          </li>
        </ul>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <ul>
          <li>
            <text>content0</text>
          </li>
        </ul>
        <text>content10</text>
        <ul>
          <li>
            <ul>
              <li>
                <text>content11</text>
              </li>
              <li>
                <text>content12</text>
              </li>
            </ul>
          </li>
          <li>
            <text>content2</text>
          </li>
        </ul>
      </modelRoot>
    `;

    const range = ModelRange.fromInNode(
      initial as ModelElement,
      rangeStart,
      0,
      0
    );
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, {});
    assert.true(resultState.document.sameAs(expected));
  });

  test('removing a complex nested list', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { rangeStart },
    } = vdom`
      <modelRoot>
        <ul>
          <li>
            <ul>
              <li>
                <text>content0</text>
              </li>
              <li>
                <ol>
                  <li/>
                  <li>
                    <ul>
                      <li/>
                      <li>
                        <text __id="rangeStart">content1</text>
                        <text>content2</text>
                      </li>
                      <li/>
                    </ul>
                  </li>
                </ol>
              </li>
            </ul>
          </li>
        </ul>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <ul>
          <li>
            <ul>
              <li>
                <text>content0</text>
              </li>
              <li>
                <ol>
                  <li/>
                  <li>
                    <ul>
                      <li/>
                    </ul>
                  </li>
                </ol>
              </li>
            </ul>
          </li>
        </ul>
        <text __id="rangeStart">content1</text>
        <text>content2</text>
        <ul>
          <li>
            <ul>
              <li>
                <ol>
                  <li>
                    <ul>
                      <li/>
                    </ul>
                  </li>
                </ol>
              </li>
            </ul>
          </li>
        </ul>
      </modelRoot>
    `;

    const range = ModelRange.fromInNode(
      initial as ModelElement,
      rangeStart,
      0,
      0
    );
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, {});
    assert.true(resultState.document.sameAs(expected));
  });

  test('removing list and a sublist using a selection', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { rangeStart, rangeEnd },
    } = vdom`
      <modelRoot>
        <ul>
          <li>
            <text __id="rangeStart">top item 1</text>
            <ul>
              <li>
                <text>subitem 1</text>
              </li>
              <li>
                <text>subitem 2</text>
              </li>
              <li>
                <text __id="rangeEnd">subitem 3</text>
              </li>
            </ul>
          </li>
          <li>
            <text>top item 2</text>
          </li>
        </ul>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <text>top item 1</text>
        <br/>
        <text>subitem 1</text>
        <br/>
        <text>subitem 2</text>
        <br/>
        <text>subitem 3</text>
        <ul>
          <li>
            <text>top item 2</text>
          </li>
        </ul>
      </modelRoot>
    `;

    const startPosition = ModelPosition.fromInTextNode(
      initial as ModelElement,
      rangeStart,
      3
    );
    const endPosition = ModelPosition.fromInTextNode(
      initial as ModelElement,
      rangeEnd,
      rangeEnd.length
    );
    const range = new ModelRange(startPosition, endPosition);
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, {});
    assert.true(resultState.document.sameAs(expected));
  });
});
