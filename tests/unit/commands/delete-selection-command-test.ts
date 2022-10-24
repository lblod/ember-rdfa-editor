import DeleteSelectionCommand from '@lblod/ember-rdfa-editor/commands/delete-selection-command';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import ModelText from '@lblod/ember-rdfa-editor/core/model/nodes/model-text';
import { NON_BREAKING_SPACE } from '@lblod/ember-rdfa-editor/utils/constants';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import { makeTestExecute, stateWithRange } from 'dummy/tests/test-utils';
import { module, test } from 'qunit';

module.skip('Unit | commands | delete-selection-command-test', function () {
  const command = new DeleteSelectionCommand();
  const executeCommand = makeTestExecute(command);

  const compareModelNodeList = (
    received: ModelNode[],
    expected: ModelNode[],
    assert: Assert
  ) => {
    assert.true(received.length === expected.length);
    for (let i = 0; i < received.length; i++) {
      assert.true(received[i].sameAs(expected[i]));
    }
  };

  test('deletes correctly all text in document', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { text },
    } = vdom`
      <modelRoot>
        <text __id="text">i am the only text available here</text>
      </modelRoot>
    `;
    const range = ModelRange.fromInTextNode(
      initial as ModelElement,
      text,
      0,
      text.length
    );
    const initialState = stateWithRange(initial, range);

    // language=XML
    const { root: expected } = vdom`
      <modelRoot></modelRoot>
    `;

    const { resultState, resultValue } = executeCommand(initialState, {});

    assert.expect(2 + resultValue.length);
    assert.true(resultState.document.sameAs(expected));

    compareModelNodeList(resultValue, [text], assert);
  });

  test('deletes correctly text in the middle of text', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { text },
    } = vdom`
      <modelRoot>
        <text __id="text">i am the only text available here</text>
      </modelRoot>
    `;
    const range = ModelRange.fromInTextNode(
      initial as ModelElement,
      text,
      9,
      16
    );
    const initialState = stateWithRange(initial, range);

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <text>i am the${NON_BREAKING_SPACE}</text>
        <text>xt available here</text>
      </modelRoot>
    `;

    const { resultState, resultValue } = executeCommand(initialState, {});
    assert.expect(2 + resultValue.length);
    assert.true(resultState.document.sameAs(expected));

    compareModelNodeList(resultValue, [new ModelText('only te')], assert);
  });

  test('deletes correctly list element', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { selectedText },
      elements: { selectedLi },
    } = vdom`
      <modelRoot>
        <ul>
          <li>
            <text>first</text>
          </li>
          <li __id="selectedLi">
            <text __id="selectedText">second</text>
          </li>
          <li>
            <text>third</text>
          </li>
        </ul>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <ul>
          <li>
            <text>first</text>
          </li>
        </ul>
        <ul>
          <li>
            <text>third</text>
          </li>
        </ul>
      </modelRoot>
    `;

    const range = ModelRange.fromInTextNode(
      initial as ModelElement,
      selectedText,
      0,
      selectedText.length
    );

    const initialState = stateWithRange(initial, range);

    const { resultState, resultValue: deletedNodes } = executeCommand(
      initialState,
      {}
    );
    assert.expect(2 + deletedNodes.length);
    assert.true(resultState.document.sameAs(expected));

    const ulElement = new ModelElement('ul');
    ulElement.addChild(selectedLi);

    compareModelNodeList(deletedNodes, [ulElement], assert);
  });

  test('deletes correctly list before other list (ul selection)', function (assert) {
    // language=XML
    const {
      root: initial,
      elements: { firstList },
    } = vdom`
      <modelRoot>
        <ul __id="firstList">
          <li>
            <text>first1</text>
          </li>
          <li>
            <text>first2</text>
          </li>
          <li>
            <text>first3</text>
          </li>
        </ul>
        <ul>
          <li>
            <text>second1</text>
          </li>
          <li>
            <text>second2</text>
          </li>
          <li>
            <text>second3</text>
          </li>
        </ul>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <ul>
          <li>
            <text>second1</text>
          </li>
          <li>
            <text>second2</text>
          </li>
          <li>
            <text>second3</text>
          </li>
        </ul>
      </modelRoot>
    `;

    const range = ModelRange.fromInElement(
      initial as ModelElement,
      firstList,
      0,
      firstList.getMaxOffset()
    );
    const initialState = stateWithRange(initial, range);

    const { resultState, resultValue: deletedNodes } = executeCommand(
      initialState,
      {}
    );
    assert.expect(2 + deletedNodes.length);
    assert.true(resultState.document.sameAs(expected));

    compareModelNodeList(deletedNodes, [firstList], assert);
  });

  test('deletes correctly list before other list (li selection)', function (assert) {
    // language=XML
    const {
      root: initial,
      elements: { firstList, firstLi, lastLi },
    } = vdom`
      <modelRoot>
        <ul __id="firstList">
          <li __id="firstLi">
            <text>first1</text>
          </li>
          <li>
            <text>first2</text>
          </li>
          <li __id="lastLi">
            <text>first3</text>
          </li>
        </ul>
        <ul>
          <li>
            <text>second1</text>
          </li>
          <li>
            <text>second2</text>
          </li>
          <li>
            <text>second3</text>
          </li>
        </ul>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <ul>
          <li>
            <text>second1</text>
          </li>
          <li>
            <text>second2</text>
          </li>
          <li>
            <text>second3</text>
          </li>
        </ul>
      </modelRoot>
    `;

    const startPos = ModelPosition.fromInElement(
      initial as ModelElement,
      firstLi,
      0
    );
    const endPos = ModelPosition.fromInElement(
      initial as ModelElement,
      lastLi,
      lastLi.getMaxOffset()
    );

    const range = new ModelRange(startPos, endPos);
    const initialState = stateWithRange(initial, range);

    const { resultState, resultValue: deletedNodes } = executeCommand(
      initialState,
      {}
    );
    assert.expect(2 + deletedNodes.length);
    assert.true(resultState.document.sameAs(expected));

    compareModelNodeList(deletedNodes, [firstList], assert);
  });

  test('deletes correctly list before text (ul selection)', function (assert) {
    // language=XML
    const {
      root: initial,
      elements: { firstList },
    } = vdom`
      <modelRoot>
        <ul __id="firstList">
          <li>
            <text>first1</text>
          </li>
          <li>
            <text>first2</text>
          </li>
          <li>
            <text>first3</text>
          </li>
        </ul>
        <br/>
        <text>this is some sample text</text>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <br/>
        <text>this is some sample text</text>
      </modelRoot>
    `;

    const range = ModelRange.fromInElement(
      initial as ModelElement,
      firstList,
      0,
      firstList.getMaxOffset()
    );
    const initialState = stateWithRange(initial, range);

    const { resultState, resultValue: deletedNodes } = executeCommand(
      initialState,
      {}
    );
    assert.expect(2 + deletedNodes.length);
    assert.true(resultState.document.sameAs(expected));

    compareModelNodeList(deletedNodes, [firstList], assert);
  });

  test('deletes correctly list before text (li selection)', function (assert) {
    // language=XML
    const {
      root: initial,
      elements: { list, firstLi, lastLi },
    } = vdom`
      <modelRoot>
        <ul __id="list">
          <li __id="firstLi">
            <text>first1</text>
          </li>
          <li>
            <text>first2</text>
          </li>
          <li __id="lastLi">
            <text>first3</text>
          </li>
        </ul>
        <br/>
        <text>this is some sample text</text>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <br/>
        <text>this is some sample text</text>
      </modelRoot>
    `;

    const startPos = ModelPosition.fromInElement(
      initial as ModelElement,
      firstLi,
      0
    );
    const endPos = ModelPosition.fromInElement(
      initial as ModelElement,
      lastLi,
      lastLi.getMaxOffset()
    );

    const range = new ModelRange(startPos, endPos);
    const initialState = stateWithRange(initial, range);

    const { resultState, resultValue: deletedNodes } = executeCommand(
      initialState,
      {}
    );
    assert.expect(2 + deletedNodes.length);
    assert.true(resultState.document.sameAs(expected));

    compareModelNodeList(deletedNodes, [list], assert);
  });

  test('deletes correctly content of table cell', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { firstLine },
    } = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>
                <text __id="firstLine">this is the first line</text>
                <br/>
                <text>here is a second line</text>
                <br/>
                <text>and of course a third one</text>
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>
                <br/>
                <text>here is a second line</text>
                <br/>
                <text>and of course a third one</text>
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

    const range = ModelRange.fromInTextNode(
      initial as ModelElement,
      firstLine,
      0,
      firstLine.length
    );
    const initialState = stateWithRange(initial, range);

    const { resultState, resultValue: deletedNodes } = executeCommand(
      initialState,
      {}
    );
    console.log(deletedNodes);
    assert.expect(2 + deletedNodes.length);
    assert.true(resultState.document.sameAs(expected));

    compareModelNodeList(deletedNodes, [firstLine], assert);
  });

  test('deletes correctly elements of nested list', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { middleText, lastText },
      elements: { middleLi, lastLi },
    } = vdom`
      <modelRoot>
        <ul>
          <li>
            <text>first</text>
          </li>
          <li __id="middleLi">
            <text __id="middleText">second</text>
            <ul>
              <li>
                <text>firstsub1</text>
              </li>
              <li>
                <text>firstsub2</text>
              </li>
            </ul>
          </li>
          <li __id="lastLi">
            <ul>
              <li>
                <text>secondsub1</text>
              </li>
              <li>
                <text>secondsub3</text>
              </li>
              <li>
                <text>secondsub3</text>
              </li>
            </ul>
            <text __id="lastText">third</text>
          </li>
        </ul>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <ul>
          <li>
            <text>first</text>
          </li>
        </ul>
      </modelRoot>
    `;

    const startPos = ModelPosition.fromInTextNode(
      initial as ModelElement,
      middleText,
      0
    );
    const endPos = ModelPosition.fromInTextNode(
      initial as ModelElement,
      lastText,
      lastText.length
    );
    const range = new ModelRange(startPos, endPos);
    const initialState = stateWithRange(initial, range);

    const { resultState, resultValue: deletedNodes } = executeCommand(
      initialState,
      {}
    );
    assert.expect(2 + deletedNodes.length);
    assert.true(resultState.document.sameAs(expected));

    const ulElement = new ModelElement('ul');
    ulElement.appendChildren(middleLi, lastLi);

    compareModelNodeList(deletedNodes, [ulElement], assert);
  });

  test('deletes correctly first part of list element', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { firstText },
    } = vdom`
      <modelRoot>
        <ul>
          <li>
            <text __id="firstText">first</text>
          </li>
          <li>
            <text>second</text>
          </li>
          <li>
            <text>third</text>
          </li>
        </ul>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <ul>
          <li>
            <text>st</text>
          </li>
          <li>
            <text>second</text>
          </li>
          <li>
            <text>third</text>
          </li>
        </ul>
      </modelRoot>
    `;

    const range = ModelRange.fromInTextNode(
      initial as ModelElement,
      firstText,
      0,
      3
    );
    const initialState = stateWithRange(initial, range);

    const { resultState, resultValue: deletedNodes } = executeCommand(
      initialState,
      {}
    );
    assert.expect(2 + deletedNodes.length);
    assert.true(resultState.document.sameAs(expected));

    compareModelNodeList(deletedNodes, [new ModelText('fir')], assert);
  });
});
