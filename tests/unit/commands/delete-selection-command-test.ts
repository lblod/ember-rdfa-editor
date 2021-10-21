import {module, test} from "qunit";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import {vdom} from "@lblod/ember-rdfa-editor/util/xml-utils";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import ModelText from "@lblod/ember-rdfa-editor/core/model/model-text";
import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";
import {CORE_OWNER, NON_BREAKING_SPACE} from "@lblod/ember-rdfa-editor/util/constants";
import ModelPosition from "@lblod/ember-rdfa-editor/core/model/model-position";
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import SelectionCommand from "content-control-plugin/commands/selection-command";

module("Unit | commands | delete-selection-command-test", hooks => {
  const ctx = new ModelTestContext();
  let command: SelectionCommand;

  hooks.beforeEach(() => {
    ctx.reset();
    command = new SelectionCommand(ctx.model);
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

    const deletedNodes = command.execute(CORE_OWNER, {deleteSelection: true});
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

    const deletedNodes: ModelNode[] = command.execute(CORE_OWNER, {deleteSelection: true});
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
        </ul>
        <ul>
          <li>
            <text>third</text>
          </li>
        </ul>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(selectedText, 0, selectedText.length);
    ctx.modelSelection.selectRange(range);

    const deletedNodes: ModelNode[] = command.execute(CORE_OWNER, {deleteSelection: true});
    assert.true(ctx.model.rootModelNode.sameAs(expected));

    const ulElement = new ModelElement("ul");
    ulElement.addChild(selectedLi);

    compareModelNodeList(deletedNodes, [ulElement], assert);
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

    const deletedNodes = command.execute(CORE_OWNER, {range, deleteSelection: true});
    assert.true(ctx.model.modelRoot.sameAs(expected));

    compareModelNodeList(deletedNodes, [firstList], assert);
  });

  test("deletes correctly list before other list (li selection)", assert => {
    // language=XML
    const {root: initial, elements: {firstList, firstLi, lastLi}} = vdom`
      <modelRoot>
        <ul __id="firstList">
          <li __id="firstLi">
            <text >first1</text>
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
    const startPos = ModelPosition.fromInElement(firstLi, 0);
    const endPos = ModelPosition.fromInElement(lastLi, lastLi.getMaxOffset());

    const range = new ModelRange(startPos, endPos);
    ctx.model.selection.selectRange(range);

    const deletedNodes = command.execute(CORE_OWNER, {deleteSelection: true});
    assert.true(ctx.model.modelRoot.sameAs(expected));

    compareModelNodeList(deletedNodes, [firstList], assert);
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
    ctx.model.selection.selectRange(range);

    const deletedNodes = command.execute(CORE_OWNER, {deleteSelection: true});
    assert.true(ctx.model.rootModelNode.sameAs(expected));

    compareModelNodeList(deletedNodes, [firstList], assert);
  });

  test("deletes correctly list before text (li selection)", assert => {
    // language=XML
    const {root: initial, elements: {list, firstLi, lastLi}} = vdom`
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
    const {root: expected} = vdom`
      <modelRoot>
        <br/>
        <text>this is some sample text</text>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const startPos = ModelPosition.fromInElement(firstLi, 0);
    const endPos = ModelPosition.fromInElement(lastLi, lastLi.getMaxOffset());

    const range = new ModelRange(startPos, endPos);
    ctx.model.selection.selectRange(range);

    const deletedNodes = command.execute(CORE_OWNER, {deleteSelection: true});
    assert.true(ctx.model.rootModelNode.sameAs(expected));

    compareModelNodeList(deletedNodes, [list], assert);
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
    const range = ModelRange.fromInTextNode(firstLine, 0, firstLine.length);
    ctx.model.selection.selectRange(range);

    const deletedNodes = command.execute(CORE_OWNER, {deleteSelection: true});
    assert.true(ctx.model.rootModelNode.sameAs(expected));

    compareModelNodeList(deletedNodes, [firstLine], assert);
  });

  test("deletes correctly elements of nested list", assert => {
    // language=XML
    const {root: initial, textNodes: {middleText, lastText}, elements: {middleLi, lastLi}} = vdom`
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
    const {root: expected} = vdom`
      <modelRoot>
        <ul>
          <li>
            <text>first</text>
          </li>
        </ul>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const startPos = ModelPosition.fromInTextNode(middleText, 0);
    const endPos = ModelPosition.fromInTextNode(lastText, lastText.length);
    const range = new ModelRange(startPos, endPos);
    ctx.model.selection.selectRange(range);

    const deletedNodes = command.execute(CORE_OWNER, {deleteSelection: true});
    assert.true(ctx.model.rootModelNode.sameAs(expected));

    const ulElement = new ModelElement("ul");
    ulElement.appendChildren(middleLi, lastLi);

    compareModelNodeList(deletedNodes, [ulElement], assert);
  });

  test("deletes correctly first part of list element", assert => {
    // language=XML
    const {root: initial, textNodes: {firstText}} = vdom`
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
    const {root: expected} = vdom`
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

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(firstText, 0, 3);
    ctx.model.selection.selectRange(range);

    const deletedNodes = command.execute(CORE_OWNER, {deleteSelection: true});
    assert.true(ctx.model.rootModelNode.sameAs(expected));

    compareModelNodeList(deletedNodes, [new ModelText("fir")], assert);
  });
});
