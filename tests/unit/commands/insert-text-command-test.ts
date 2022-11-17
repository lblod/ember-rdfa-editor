import InsertTextCommand from '@lblod/ember-rdfa-editor/commands/insert-text-command';
import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import { SPACE } from '@lblod/ember-rdfa-editor/utils/constants';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import { createLogger } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import { makeTestExecute, testState } from 'dummy/tests/test-utils';
import { module, test } from 'qunit';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import ModelSelection from '@lblod/ember-rdfa-editor/core/model/model-selection';
import { boldMarkSpec } from '@lblod/ember-rdfa-editor/plugins/basic-styles/marks/bold';
import { Mark } from '@lblod/ember-rdfa-editor/core/model/marks/mark';

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

    const range = ModelRange.fromInElement(
      initial as ModelElement,
      parent,
      2,
      2
    );
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
    const start = ModelPosition.fromInTextNode(
      initial as ModelElement,
      rangeStart,
      2
    );
    const end = ModelPosition.fromInTextNode(
      initial as ModelElement,
      rangeEnd,
      1
    );
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

    const start = ModelPosition.fromInTextNode(
      initial as ModelElement,
      rangeStart,
      2
    );
    const end = ModelPosition.fromInTextNode(
      initial as ModelElement,
      rangeEnd,
      2
    );
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
    const range = ModelRange.fromInTextNode(
      initial as ModelElement,
      selectionFocus,
      1,
      1
    );
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
    const range = ModelRange.fromInElement(
      initial as ModelElement,
      parent,
      2,
      2
    );
    const { resultState } = executeCommand(initialState, {
      text: 'c\nde',
      range,
    });
    assert.true(resultState.document.sameAs(expected));
  });

  test('inserting text starting from a selection with marks applied', function (assert) {
    const { root: initial } = vdom`
      <modelRoot/>
    `;
    const { root: expected } = vdom`
      <modelRoot>
        <text __marks="bold">a</text>
      </modelRoot>
    `;
    const range = ModelRange.fromInElement(
      initial as ModelElement,
      initial as ModelElement,
      0,
      0
    );
    const selection = new ModelSelection([range])
    selection.activeMarks.add(new Mark(boldMarkSpec, {}));
    const initialState = testState({ document: initial, selection });
    const { resultState } = executeCommand(initialState, {
      text: 'a',
      range: selection.lastRange,
    });
    assert.true(
      resultState.document.sameAs(expected),
      QUnit.dump.parse(resultState.document)
    );
  });
});
