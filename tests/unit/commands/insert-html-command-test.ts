import InsertHtmlCommand from '@lblod/ember-rdfa-editor/commands/insert-html-command';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import ModelTreeWalker, {
  FilterResult,
} from '@lblod/ember-rdfa-editor/utils/model-tree-walker';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import { oneLineTrim } from 'common-tags';
import { makeTestExecute, testState } from 'dummy/tests/test-utils';
import { module, test } from 'qunit';

module('Unit | commands | insert-html-command-test', function () {
  const command = new InsertHtmlCommand();
  const executeCommand = makeTestExecute(command);

  test('inserts correctly in empty document', function (assert) {
    // language=XML
    const { root: initial } = vdom`
      <modelRoot/>
    `;
    const initialState = testState({ document: initial });

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <div>
          <text>hello world</text>
        </div>
      </modelRoot>
    `;

    const htmlToInsert = oneLineTrim`<div>hello world</div>`;
    const range = ModelRange.fromInElement(initialState.document, 0, 0);
    const { resultState } = executeCommand(initialState, {
      htmlString: htmlToInsert,
      range,
    });

    assert.true(resultState.document.sameAs(expected));
  });
  test('inserts correctly in document with empty textnode', function (assert) {
    // language=XML
    const { root: initial } = vdom`
      <modelRoot>
        <text/>
      </modelRoot>
    `;

    const initialState = testState({ document: initial });
    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <text/>
        <div>
          <text>hello world</text>
        </div>
      </modelRoot>
    `;

    const htmlToInsert = oneLineTrim`<div>hello world</div>`;
    const range = ModelRange.fromInElement(initialState.document, 0, 0);
    const { resultState } = executeCommand(initialState, {
      htmlString: htmlToInsert,
      range,
    });

    assert.true(resultState.document.sameAs(expected));
  });

  test('inserts correctly inside textnode', function (assert) {
    // language=XML
    const { root: initial } = vdom`
      <modelRoot>
        <text>abcd</text>
      </modelRoot>
    `;

    const initialState = testState({ document: initial });
    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <text>ab</text>
        <div>
          <text>hello world</text>
        </div>
        <text>cd</text>
      </modelRoot>
    `;

    const htmlToInsert = oneLineTrim`<div>hello world</div>`;
    const range = ModelRange.fromInElement(initialState.document, 2, 2);
    const { resultState } = executeCommand(initialState, {
      htmlString: htmlToInsert,
      range,
    });
    assert.true(resultState.document.sameAs(expected));
  });
  test('correctly replaces part of textnode', function (assert) {
    // language=XML
    const { root: initial } = vdom`
      <modelRoot>
        <text>abcd</text>
      </modelRoot>
    `;
    const initialState = testState({ document: initial });

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <text>a</text>
        <div>
          <text>hello world</text>
        </div>
        <text>d</text>
      </modelRoot>
    `;

    const htmlToInsert = oneLineTrim`<div>hello world</div>`;
    const range = ModelRange.fromInElement(initialState.document, 1, 3);
    const { resultState } = executeCommand(initialState, {
      htmlString: htmlToInsert,
      range,
    });
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
          <text __id="rangeStart">abcd</text>
          <span>
            <span/>
            <span>
              <text __id="rangeEnd">efgh</text>
            </span>
          </span>
        </div>
      </modelRoot>
    `;
    const initialState = testState({ document: initial });

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <div>
          <text>a</text>
          <div>
            <text>hello world</text>
          </div>
          <span>
            <span>
              <text>h</text>
            </span>
          </span>
        </div>
      </modelRoot>
    `;

    const htmlToInsert = oneLineTrim`<div>hello world</div>`;

    const start = ModelPosition.fromInTextNode(rangeStart, 1);
    const end = ModelPosition.fromInTextNode(rangeEnd, 3);
    const range = new ModelRange(start, end);
    const { resultState } = executeCommand(initialState, {
      htmlString: htmlToInsert,
      range,
    });
    assert.true(resultState.document.sameAs(expected));
  });

  test('can insert bold text as a direct child of the root node', function (assert) {
    // language=XML
    const { root: initial } = vdom`
      <modelRoot/>`;
    const initialState = testState({ document: initial });
    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <text __marks="bold">my text</text>
      </modelRoot>`;
    const htmlToInsert = oneLineTrim`<strong>my text</strong>`;
    const root = initialState.document;
    const range = ModelRange.fromInElement(root, 0, root.getMaxOffset());
    const { resultState } = executeCommand(initialState, {
      htmlString: htmlToInsert,
      range,
    });
    assert.true(resultState.document.sameAs(expected));
  });

  test('properly removes empty text nodes', function (assert) {
    // language=XML
    const { root: initial } = vdom`
<modelRoot/>`;
    const initialState = testState({ document: initial });
    // language=HTML
    const htmlString = `
<div>
  <span>my text</span>
</div>
<div>
\t\t
</div>
`;
    const root = initialState.document;
    const range = ModelRange.fromInElement(root, 0, root.getMaxOffset());
    const { resultState } = executeCommand(initialState, {
      htmlString,
      range,
    });
    const filter = (node: ModelNode) =>
      ModelNode.isModelText(node)
        ? FilterResult.FILTER_ACCEPT
        : FilterResult.FILTER_SKIP;
    const textNodes = Array.from(
      new ModelTreeWalker({ range: range.clone(resultState.document), filter })
    );
    assert.strictEqual(textNodes.length, 1);
  });
  test('properly collapses spaces', function (assert) {
    // language=XML
    const { root: initial } = vdom`
<modelRoot/>`;
    const initialState = testState({ document: initial });
    // language=HTML
    const htmlString = `  the spaces before this don't show and should be removed`;
    const root = initialState.document;
    const range = ModelRange.fromInElement(root, 0, root.getMaxOffset());
    const { resultState } = executeCommand(initialState, {
      htmlString,
      range,
    });
    assert.strictEqual(
      (resultState.document.firstChild as ModelText).content,
      "the spaces before this don't show and should be removed"
    );
  });
});
