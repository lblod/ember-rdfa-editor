import {module, test} from "qunit";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import ListCleaner from "@lblod/ember-rdfa-editor/model/cleaners/list-cleaner";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";

module("Unit | model | cleaners | list-cleaner-test", hooks => {
  const ctx = new ModelTestContext();
  hooks.beforeEach(() => {
    ctx.reset();
  });


  test("should merge two adjacent lists", assert => {
    const {model: {rootModelNode}} = ctx;

    const list0 = new ModelElement("ul");
    const li00 = new ModelElement("li");
    const content00 = new ModelText("content00");
    list0.addChild(li00);
    li00.addChild(content00);


    const list1 = new ModelElement("ul");
    const li10 = new ModelElement("li");
    const content10 = new ModelText("content10");
    list1.addChild(li10);
    li10.addChild(content10);

    rootModelNode.appendChildren(list0, list1);


    const cleaner = new ListCleaner();

    cleaner.clean(rootModelNode);

    assert.strictEqual(rootModelNode.children.length, 1);

    assert.strictEqual((rootModelNode.children[0] as ModelElement).type, "ul");
    assert.strictEqual((rootModelNode.children[0] as ModelElement).children.length, 2);
    assert.strictEqual(((rootModelNode.children[0] as ModelElement).children[0] as ModelElement).type, "li");

  });
});


