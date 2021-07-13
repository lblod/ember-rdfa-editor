import {module, test} from "qunit";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import DeleteSelectionCommand from "@lblod/ember-rdfa-editor/commands/delete-selection-command";
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {NON_BREAKING_SPACE} from "@lblod/ember-rdfa-editor/model/util/constants";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";

module("Unit | commands | delete-selection-command-test", hooks => {
  const ctx = new ModelTestContext();
  let command: DeleteSelectionCommand;

  hooks.beforeEach(() => {
    ctx.reset();
    command = new DeleteSelectionCommand(ctx.model);
  });

  const compareModelNodeList = (received: ModelNode[], expected: ModelNode[], assert: Assert) => {
    assert.true(received.length === expected.length);
    for (let i = 0; i < received.length; i++) {
      assert.true(received[i].sameAs(expected[i]));
    }
  };

  test("deletes correctly all text in document", assert => {
    // language=XML
    const {root: initial, textNodes: {text}} = vdom`
      <modelRoot>
        <text __id="text">i am the only text available here</text>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot></modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(text, 0, text.length);
    ctx.modelSelection.selectRange(range);

    const deletedNodes = command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));

    compareModelNodeList(deletedNodes, [text], assert);
  });

  test("deletes correctly text in the middle of text", assert => {
    // language=XML
    const {root: initial, textNodes: {text}} = vdom`
      <modelRoot>
        <text __id="text">i am the only text available here</text>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <text>i am the${NON_BREAKING_SPACE}</text>
        <text>xt available here</text>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(text, 9, 16);
    ctx.modelSelection.selectRange(range);

    const deletedNodes: ModelNode[] = command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));

    compareModelNodeList(deletedNodes, [new ModelText("only te")], assert);
  });

  test("deletes correctly list element", assert => {
    // language=XML
    const {root: initial, textNodes: {selectedText}, elements: {selectedLi}} = vdom`
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
    const {root: expected} = vdom`
      <modelRoot>
        <ul>
          <li>
            <text>first</text>
          </li>
          <li>
            <text>third</text>
          </li>
        </ul>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(selectedText, 0, selectedText.length);
    ctx.modelSelection.selectRange(range);

    const deletedNodes: ModelNode[] = command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));

    compareModelNodeList(deletedNodes, [selectedLi], assert);
  });

  test("deletes correctly list before other list (ul selection)", assert => {
    // language=XML
    const {root: initial, elements: {firstList}} = vdom`
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
    const {root: expected} = vdom`
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

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInElement(firstList, 0, firstList.getMaxOffset());
    ctx.model.selectRange(range);

    const deletedNodes = command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));

    compareModelNodeList(deletedNodes, [firstList], assert);
  });

  test("deletes correctly list before other list (li selection)", assert => {
    // language=XML
    const {root: initial, elements: {firstLi, middleLi, lastLi}} = vdom`
      <modelRoot>
        <ul>
          <li __id="firstLi">
            <text >first1</text>
          </li>
          <li __id="middleLi">
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
    const {root: expected} = vdom`
      <modelRoot>
        <ul></ul>
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

    ctx.model.fillRoot(initial);
    const startPos = ModelPosition.fromInElement(firstLi, 0);
    const endPos = ModelPosition.fromInElement(lastLi, lastLi.getMaxOffset());

    const range = new ModelRange(startPos, endPos);
    ctx.model.selectRange(range);

    const deletedNodes = command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));

    compareModelNodeList(deletedNodes, [firstLi, middleLi, lastLi], assert);
  });

  test("deletes correctly list before text (ul selection)", assert => {
    // language=XML
    const {root: initial, elements: {firstList}} = vdom`
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
    const {root: expected} = vdom`
      <modelRoot>
        <br/>
        <text>this is some sample text</text>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInElement(firstList, 0, firstList.getMaxOffset());
    ctx.model.selectRange(range);

    const deletedNodes = command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));

    compareModelNodeList(deletedNodes, [firstList], assert);
  });

  test("deletes correctly list before text (li selection)", assert => {
    // language=XML
    const {root: initial, elements: {firstLi, middleLi, lastLi}} = vdom`
      <modelRoot>
        <ul>
          <li __id="firstLi">
            <text>first1</text>
          </li>
          <li __id="middleLi">
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
    const {root: expected} = vdom`
      <modelRoot>
        <ul></ul>
        <br/>
        <text>this is some sample text</text>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const startPos = ModelPosition.fromInElement(firstLi, 0);
    const endPos = ModelPosition.fromInElement(lastLi, lastLi.getMaxOffset());

    const range = new ModelRange(startPos, endPos);
    ctx.model.selectRange(range);

    const deletedNodes = command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));

    compareModelNodeList(deletedNodes, [firstLi, middleLi, lastLi], assert);
  });

  test("deletes correctly content of table cell", assert => {
    // language=XML
    const {root: initial, textNodes: {firstLine}} = vdom`
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
    const {root: expected} = vdom`
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

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(firstLine, 0, firstLine.length)
    ctx.model.selectRange(range);

    const deletedNodes = command.execute();
    console.log(ctx.model.toXml());
    assert.true(ctx.model.rootModelNode.sameAs(expected));

    compareModelNodeList(deletedNodes, [firstLine], assert);
  });
});
