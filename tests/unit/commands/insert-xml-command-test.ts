import InsertXmlCommand from '@lblod/ember-rdfa-editor/commands/insert-xml-command';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { vdom } from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import { oneLineTrim } from 'common-tags';
import { makeTestExecute, stateWithRange } from 'dummy/tests/test-utils';
import { module, test } from 'qunit';

module('Unit | commands | insert-xml-command-test', function () {
  const command = new InsertXmlCommand();
  const executeCommand = makeTestExecute(command);

  test('inserts correctly in empty document', function (assert) {
    // language=XML
    const { root: initial } = vdom`
      <modelRoot/>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <div>
          <text>hello world</text>
        </div>
      </modelRoot>
    `;

    const xmlToInsert = oneLineTrim`<div><text>hello world</text></div>`;

    const range = ModelRange.fromInNode(initial, 0, 0);
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, { xml: xmlToInsert });
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
        <div>
          <text>hello world</text>
        </div>
      </modelRoot>
    `;

    const xmlToInsert = oneLineTrim`<div><text>hello world</text></div>`;

    const range = ModelRange.fromInNode(initial, 0, 0);
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, { xml: xmlToInsert });
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
        <div>
          <text>hello world</text>
        </div>
        <text>phant</text>
      </modelRoot>
    `;

    const xmlToInsert = oneLineTrim`<div><text>hello world</text></div>`;

    const range = ModelRange.fromInNode(initial, 3, 3);
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, { xml: xmlToInsert });
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
        <div>
          <text>hello world</text>
        </div>
        <text>ant</text>
      </modelRoot>
    `;

    const xmlToInsert = oneLineTrim`<div><text>hello world</text></div>`;

    const range = ModelRange.fromInNode(initial, 2, 5);
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, { xml: xmlToInsert });
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
          <div>
            <text>hello world</text>
          </div>
          <span>
            <span>
              <text>key</text>
            </span>
            <span/>
          </span>
        </div>
      </modelRoot>
    `;

    const xmlToInsert = oneLineTrim`<div><text>hello world</text></div>`;

    const range = new ModelRange(
      ModelPosition.fromInTextNode(rangeStart, 3),
      ModelPosition.fromInTextNode(rangeEnd, 3)
    );
    const initialState = stateWithRange(initial, range);
    const { resultState } = executeCommand(initialState, { xml: xmlToInsert });
    assert.true(resultState.document.sameAs(expected));
  });
});
