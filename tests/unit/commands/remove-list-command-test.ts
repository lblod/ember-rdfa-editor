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

  test("removing a complex nested list", assert => {

    const {modelSelection, model} = ctx;
    const ul = new ModelElement("ul");
    const li = new ModelElement("li");

    const ul2 = new ModelElement("ul");
    const li2 = new ModelElement("li");
    const li8 = new ModelElement("li");

    const ol = new ModelElement("ol");
    const li3 = new ModelElement("li");
    const li4 = new ModelElement("li");

    const ul4 = new ModelElement("ul");
    const li5 = new ModelElement("li");
    const li6 = new ModelElement("li");
    const li7 = new ModelElement("li");

    const content = new ModelText("test");
    const content1 = new ModelText("test2");
    const content2 = new ModelText("test3");

    model.rootModelNode.addChild(ul);

    ul.addChild(li);
    li.addChild(ul2);
    ul2.addChild(li2);
    li2.addChild(content);
    ul2.addChild(li8);
    li8.addChild(ol);

    ol.addChild(li3);
    ol.addChild(li4);
    li4.addChild(ul4);

    ul4.addChild(li5);
    ul4.addChild(li6);
    ul4.addChild(li7);
    li6.addChild(content1);
    li6.addChild(content2);

    /*
    ul
      li
        ul2
          li2
            content
          li8
           ul3
            li3
            li4
              ul4
                li5
                li6
                  content1
                  content2
                li7
    */

    modelSelection.collapseOn(content);
    command.execute();

    assert.strictEqual(model.rootModelNode.firstChild, content);
    assert.strictEqual(model.rootModelNode.children.length, 1);

  });
});
