import {module, test} from "qunit";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import RemoveListCommand from "@lblod/ember-rdfa-editor/commands/remove-list-command";
import { setupTest } from "ember-qunit";
module("Unit | commands | remove-list-command", hooks => {
  const ctx = new ModelTestContext();
  let command: RemoveListCommand;
  setupTest(hooks);
  hooks.beforeEach(() => {
    ctx.reset();
    command = new RemoveListCommand(ctx.model);
  });


  test("removing a simple list", assert => {

    const {modelSelection, model} = ctx;
    const ul = new ModelElement("ul");
    const li = new ModelElement("li");
    const content = new ModelText("test");

    model.rootModelNode.addChild(ul);
    ul.addChild(li);
    li.addChild(content);

    modelSelection.collapseOn(content);
    command.execute();

    assert.strictEqual(model.rootModelNode.firstChild, content);
    assert.strictEqual(model.rootModelNode.children.length, 1);

  });

  test("removing a nested list", assert => {

    const {modelSelection, model} = ctx;
    const ul = new ModelElement("ul");
    const li = new ModelElement("li");

    const ul2 = new ModelElement("ul");
    const li2 = new ModelElement("li");
    const content = new ModelText("test");

    model.rootModelNode.addChild(ul);
    ul.addChild(li);
    li.addChild(ul2);
    ul2.addChild(li2);
    li2.addChild(content);

    modelSelection.collapseOn(content);
    command.execute();

    assert.strictEqual(model.rootModelNode.firstChild, content);
    assert.strictEqual(model.rootModelNode.children.length, 1);

  });
});
