import {module, test} from "qunit";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import DeleteCharacterBackwardsCommand from "@lblod/ember-rdfa-editor/commands/delete-character-backwards-command";
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";

module("Unit | commands | delete-character-backwards-command-test", hooks => {
  const ctx = new ModelTestContext();
  let command: DeleteCharacterBackwardsCommand;

  hooks.beforeEach(() => {
    ctx.reset();
    command = new DeleteCharacterBackwardsCommand(ctx.model);
  });

  test("removes character at end of only text in document", assert => {
    // language=XML
    const {root: initial, textNodes: {text}} = vdom`
      <modelRoot>
        <text __id="text">only text here</text>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <text>only text her</text>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(text, text.length, text.length);
    const resultRange = ModelRange.fromInTextNode(text, text.length - 1, text.length - 1);
    ctx.model.selectRange(range);

    command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));
    assert.true(ctx.model.selection.lastRange?.sameAs(resultRange));
  });

  test("removes character at start of only text in document", assert => {
    // language=XML
    const {root: initial, textNodes: {text}} = vdom`
      <modelRoot>
        <text __id="text">only text here</text>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <text>nly text here</text>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(text, 1, 1);
    const resultRange = ModelRange.fromInTextNode(text, 0, 0);
    ctx.model.selectRange(range);

    command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));
    assert.true(ctx.model.selection.lastRange?.sameAs(resultRange));
  });

  test("removes character in the middle of only text in document", assert => {
    // language=XML
    const {root: initial, textNodes: {text}} = vdom`
      <modelRoot>
        <text __id="text">only text here</text>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <text>only texthere</text>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(text, 10, 10);
    const resultRange = ModelRange.fromInTextNode(text, 9, 9);
    ctx.model.selectRange(range);

    command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));
    assert.true(ctx.model.selection.lastRange?.sameAs(resultRange));
  });

  test("removes character before bold text", assert => {
    // language=XML
    const {root: initial, textNodes: {normalText, boldText}} = vdom`
      <modelRoot>
        <text __id="normalText">not bold</text>
        <text bold="true" __id="boldText">bold</text>
        <text>also not bold</text>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <text>not bol</text>
        <text bold="true">bold</text>
        <text>also not bold</text>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(boldText, 0, 0);
    const resultRange = ModelRange.fromInTextNode(normalText, normalText.length - 1, normalText.length - 1);
    ctx.model.selectRange(range);

    command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));
    assert.true(ctx.model.selection.lastRange?.sameAs(resultRange));
  });

  test("removes character in list element", assert => {
    // language=XML
    const {root: initial, textNodes: {text}} = vdom`
      <modelRoot>
        <ul>
          <li></li>
          <li>
            <text __id="text">text in list element</text>
          </li>
          <li></li>
        </ul>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <ul>
          <li></li>
          <li>
            <text>ext in list element</text>
          </li>
          <li></li>
        </ul>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(text, 1, 1);
    const resultRange = ModelRange.fromInTextNode(text, 0, 0);
    ctx.model.selectRange(range);

    command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));
    assert.true(ctx.model.selection.lastRange?.sameAs(resultRange));
  });

  test("removes character in tables", assert => {
    // language=XML
    const {root: initial, textNodes: {text}} = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td>
                <text __id="text">first cell</text>
              </td>
              <td>
                <text>second cell</text>
              </td>
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
              <td>
                <text>irst cell</text>
              </td>
              <td>
                <text>second cell</text>
              </td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(text, 1, 1);
    const resultRange = ModelRange.fromInTextNode(text, 0, 0);
    ctx.model.selectRange(range);

    command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));
    assert.true(ctx.model.selection.lastRange?.sameAs(resultRange));
  });

  test("removes br between two textnodes", assert => {
    // language=XML
    const {root: initial, textNodes: {firstLine}, elements: {br}} = vdom`
      <modelRoot>
        <text __id="firstLine">first line</text>
        <br __id="br"/>
        <text>second line</text>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <text>first linesecond line</text>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const cursorPosition = ModelPosition.fromAfterNode(br);
    const range = new ModelRange(cursorPosition, cursorPosition);
    const resultRange = ModelRange.fromInTextNode(firstLine, firstLine.length, firstLine.length);
    ctx.model.selectRange(range);

    command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));
    assert.true(ctx.model.selection.lastRange?.sameAs(resultRange));
  });
});
