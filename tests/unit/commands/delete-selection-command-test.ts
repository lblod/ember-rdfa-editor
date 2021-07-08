import {module, test} from "qunit";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import DeleteSelectionCommand from "@lblod/ember-rdfa-editor/commands/delete-selection-command";
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import {NON_BREAKING_SPACE} from "@lblod/ember-rdfa-editor/model/util/constants";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";

module("Unit | commands | delete-selection-command-test", hooks => {
  const ctx = new ModelTestContext();
  let command: DeleteSelectionCommand;

  hooks.beforeEach(() => {
    ctx.reset();
    command = new DeleteSelectionCommand(ctx.model);
  });

  test("delete all text in document", assert => {
    // language = XML
    const {root: initial, textNodes: {text}} = vdom`
      <modelRoot>
        <text __id="text">i am the only text available here</text>
      </modelRoot>
    `;

    // language = XML
    const {root: expected} = vdom`
      <modelRoot></modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(text, 0, text.length);
    ctx.modelSelection.selectRange(range);

    const deletedNodes = command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));

    const expectedDeletedNodes = [
      new ModelText("i am the only text available here")
    ];

    assert.true(deletedNodes.length === expectedDeletedNodes.length);
    for (let i = 0; i < deletedNodes.length; i++) {
      assert.true(deletedNodes[i].sameAs(expectedDeletedNodes[i]));
    }
  });

  test("delete in the middle of text", assert => {
    // language = XML
    const {root: initial, textNodes: {text}} = vdom`
      <modelRoot>
        <text __id="text">i am the only text available here</text>
      </modelRoot>
    `;

    // language = XML
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

    const expectedDeletedNodes = [
      new ModelText("only te")
    ];

    assert.true(deletedNodes.length === expectedDeletedNodes.length);
    for (let i = 0; i < deletedNodes.length; i++) {
      assert.true(deletedNodes[i].sameAs(expectedDeletedNodes[i]));
    }
  });
});
