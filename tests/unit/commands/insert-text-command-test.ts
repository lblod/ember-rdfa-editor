import InsertTextCommand from '@lblod/ember-rdfa-editor/commands/insert-text-command';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { SPACE } from '@lblod/ember-rdfa-editor/model/util/constants';
import { vdom } from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import { createLogger } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import {
  makeTestExecute,
  testDispatch,
  testState,
} from 'dummy/tests/test-utils';
import { module, test } from 'qunit';

module('Unit | commands | insert-text-command-test', function () {
  const logger = createLogger('test:insert-text-command-test');
  const command = new InsertTextCommand();
  const executeCommand = makeTestExecute(command);

  test('inserts character into textnode', function (assert) {
    // language=XML
    const {
      root: initial,
      elements: { parent },
    } = vdom`
      <modelRoot>
        <div __id="parent">
          <text>abde</text>
        </div>
      </modelRoot>
    `;
    const initialState = testState({ document: initial });

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <div>
          <text>abcde</text>
        </div>
      </modelRoot>
    `;

    const range = ModelRange.fromInElement(parent, 2, 2);
    const { resultState } = executeCommand(initialState, { text: 'c', range });
    assert.true(resultState.document.sameAs(expected));
  });
  test('overwrites unconfined range', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { rangeStart, rangeEnd },
    } = vdom`
      <modelRoot>
        <span>
          <text __id="rangeStart">abc</text>
        </span>
        <span>
          <text __id="rangeEnd">def</text>
        </span>
      </modelRoot>
    `;
    const initialState = testState({ document: initial });
    const { root: expected } = vdom`
      <modelRoot>
        <span>
          <text>abx</text>
        </span>
        <span>
          <text>ef</text>
        </span>
      </modelRoot>
    `;
    const start = ModelPosition.fromInTextNode(rangeStart, 2);
    const end = ModelPosition.fromInTextNode(rangeEnd, 1);
    const range = new ModelRange(start, end);

    const { resultState } = executeCommand(initialState, { text: 'x', range });
    assert.true(resultState.document.sameAs(expected));
  });
  test('overwrites complex range', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { rangeStart, rangeEnd },
    } = vdom`
      <modelRoot>
        <div>
          <text __id="rangeStart">abcd</text>
        </div>
        <div>
          <text>efgh</text>
          <div>
            <text __id="rangeEnd">ijkl</text>
          </div>
        </div>
      </modelRoot>
    `;

    const initialState = testState({ document: initial });
    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <div>
          <text>abc</text>
        </div>
        <div>
          <div>
            <text>kl</text>
          </div>
        </div>
      </modelRoot>
    `;

    const start = ModelPosition.fromInTextNode(rangeStart, 2);
    const end = ModelPosition.fromInTextNode(rangeEnd, 2);
    const range = new ModelRange(start, end);
    const { resultState } = executeCommand(initialState, { text: 'c', range });

    assert.true(resultState.document.sameAs(expected));
  });
  test('space does not eat the character before it', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { selectionFocus },
    } = vdom`
      <modelRoot>
        <h1>
          <text>Notulen van de/het</text>
          <span>
            <text __id="selectionFocus">Gemeenteraad Laarne</text>
          </span>
        </h1>
      </modelRoot>
    `;
    const initialState = testState({ document: initial });

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <h1>
          <text>Notulen van de/het</text>
          <span>
            <text __id="selectionFocus">G emeenteraad Laarne</text>
          </span>
        </h1>
      </modelRoot>
    `;
    const range = ModelRange.fromInTextNode(selectionFocus, 1, 1);
    const { resultState } = executeCommand(initialState, {
      text: SPACE,
      range,
    });
    const rslt = resultState.document.sameAs(expected);
    if (!rslt) {
      logger(
        'space does not eat the character before it: ACTUAL:',
        resultState.document
      );
    }
    assert.true(rslt);
  });

  test('newlines are converted to br elements', function (assert) {
    // language=XML
    const {
      root: initial,
      elements: { parent },
    } = vdom`
      <modelRoot>
        <div __id="parent">
          <text>ab</text>
        </div>
      </modelRoot>
    `;
    const initialState = testState({ document: initial });

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <div>
          <text>abc</text>
          <br />
          <text>de</text>
        </div>
      </modelRoot>
    `;
    const range = ModelRange.fromInElement(parent, 2, 2);
    const { resultState } = executeCommand(initialState, {
      text: 'c\nde',
      range,
    });
    assert.true(resultState.document.sameAs(expected));
  });
});
