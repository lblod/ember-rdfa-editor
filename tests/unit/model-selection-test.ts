import {module, test} from "qunit";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {AssertionError} from "@lblod/ember-rdfa-editor/utils/errors";

module("Unit | model | model-selection", hooks => {
  const ctx = new ModelTestContext();

  hooks.beforeEach(() => {
    ctx.reset();
  });
  test("collapseOn sets position correctly", assert => {
    const {modelSelection, model} = ctx;
    const p = new ModelElement("p");
    const content = new ModelText("test");
    model.rootModelNode.addChild(p);
    p.addChild(content);
    modelSelection.collapseOn(content);
    assert.true(modelSelection.isCollapsed);
    assert.true(modelSelection.focus?.sameAs(ModelPosition.fromParent(model.rootModelNode, content, 0)));

  });

  test("findAllInSelection finds all relevant nodes", assert => {

    const {modelSelection, model: {rootModelNode}} = ctx;

    const ul = new ModelElement("ul");

    const li0 = new ModelElement("li");
    const content0 = new ModelText("content01");
    const ul01 = new ModelElement("ul");

    const li010 = new ModelElement("li");
    const content010 = new ModelText("content010");

    const li011 = new ModelElement("li");
    const content011 = new ModelText("content011");

    const li012 = new ModelElement("li");
    const content012 = new ModelText("content012");


    rootModelNode.addChild(ul);
    ul.addChild(li0);
    li0.appendChildren(content0, ul01);

    ul01.appendChildren(li010, li011, li012);

    li010.addChild(content010);
    li011.addChild(content011);
    li012.addChild(content012);

    modelSelection.setStartAndEnd(content0, 1, content012, 1);

    const iterator = modelSelection.findAllInSelection({
      filter: ModelNode.isModelElement,
      predicate: node => node.type === "li"
    });
    if(!iterator) {
      throw new AssertionError();
    }
    const result = [...iterator];


    assert.strictEqual(result.length, 4);
    assert.strictEqual(result[0], li0);
    assert.strictEqual(result[1], li010);
    assert.strictEqual(result[2], li011);
    assert.strictEqual(result[3], li012);

  });
});

