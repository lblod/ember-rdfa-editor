import {module, test} from "qunit";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import RemoveListCommand from "@lblod/ember-rdfa-editor/commands/remove-list-command";
import {setupTest} from "ember-qunit";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {AssertionError} from "@lblod/ember-rdfa-editor/utils/errors";

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
    // a br should get inserted
    assert.strictEqual(model.rootModelNode.children.length, 2);

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
    assert.strictEqual(model.rootModelNode.children.length, 2);

  });
  test("removing a nested listitem with more elements", assert => {
    const {modelSelection, model} = ctx;
    const ul = new ModelElement("ul");

    const li0 = new ModelElement("li");
    const content0 = new ModelText("content li0");

    const li1 = new ModelElement("li");
    const ul1 = new ModelElement("ul");
    const li10 = new ModelElement("li");
    const content10 = new ModelText("content li10");
    const li11 = new ModelElement("li");
    const content11 = new ModelText("content li11");
    const li12 = new ModelElement("li");
    const content12 = new ModelText("content li12");

    const li2 = new ModelElement("li");
    const content2 = new ModelText("content li2");

    model.rootModelNode.addChild(ul);
    ul.appendChildren(li0, li1, li2);

    li0.addChild(content0);

    li1.addChild(ul1);
    ul1.appendChildren(li10, li11, li12);
    li10.addChild(content10);
    li11.addChild(content11);
    li12.addChild(content12);

    li2.addChild(content2);

    modelSelection.collapseOn(content10);
    command.execute();

    assert.strictEqual(model.rootModelNode.length, 4);
    assert.strictEqual(model.rootModelNode.children[0], ul);
    assert.strictEqual(ul.length, 1);

    assert.strictEqual(ul.firstChild.length, 1);
    assert.strictEqual((ul.firstChild as ModelElement).firstChild, content0);

    assert.strictEqual(model.rootModelNode.children[1], content10);

    assert.strictEqual(ul.length, 1);
    assert.strictEqual(ul.firstChild, li0);

    assert.strictEqual(li11.parent?.length, 2);
    assert.strictEqual(li11.nextSibling, li12);

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
