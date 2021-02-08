import {module, test} from "qunit";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import UnindentListCommand from "@lblod/ember-rdfa-editor/commands/unindent-list-command";

module("Unit | commands | unindent-list-command-test", hooks => {
  let command: UnindentListCommand;
  const ctx = new ModelTestContext();
  hooks.beforeEach(() => {
    ctx.reset();
    command = new UnindentListCommand(ctx.model);
  });

  test("should unindent simple list", assert => {
    const {modelSelection, model: {rootModelNode}} = ctx;

    const ul = new ModelElement("ul");
    const li = new ModelElement("li");
    const content = new ModelText("test");
    rootModelNode.addChild(ul);
    ul.addChild(li);
    li.addChild(content);
    modelSelection.collapseOn(content, 2);

    command.execute();

    assert.strictEqual(rootModelNode.firstChild, content);
    assert.strictEqual(rootModelNode.children.length, 1);

  });


});


