import { module, test } from 'qunit';
import UndoCommand from '@lblod/ember-rdfa-editor/commands/undo-command';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import { makeTestExecute, testState } from 'dummy/tests/test-utils';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';

module('Unit | commands | undo-command-test', function () {
  const command = new UndoCommand();
  const executeCommand = makeTestExecute(command);

  test('undo deletion of only text in document', function (assert) {
    // language=XML
    const { root: initial } = vdom`
      <modelRoot>
        <text>this is the only text available here</text>
      </modelRoot>
    `;

    const initialState = testState({ document: initial });

    const tr = initialState.createTransaction();
    tr.insertNodes(ModelRange.fromInNode(initial as ModelElement, initial));
    const newState = tr.apply();
    const { resultState } = executeCommand(newState, {});

    console.log(resultState.document.toXml());
    assert.true(resultState.document.sameAs(initial));
  });

  test('undo addition of only text in document', function (assert) {
    // language=XML
    const { root: initial } = vdom`
      <modelRoot/>
    `;
    const initialState = testState({ document: initial });

    const {
      textNodes: { text },
    } = vdom`
      <modelRoot>
        <text __id="text">this is the only text available here</text>
      </modelRoot>
    `;

    const tr = initialState.createTransaction();
    tr.insertNodes(
      ModelRange.fromInNode(initial as ModelElement, initial),
      text
    );
    const newState = tr.apply();
    const { resultState } = executeCommand(newState, {});

    console.log(resultState.document.toXml());
    assert.true(resultState.document.sameAs(initial));
  });
});
