import {module, test} from "qunit";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";

module("Unit | model | model-selection", hooks => {
  const ctx = new ModelTestContext();

  hooks.beforeEach(() => {
    ctx.reset();
  });
  test("sets anchor and focus correctly, anchor before focus", assert => {
    const anchor = ModelPosition.from(ctx.model.rootModelNode, [0]);
    const focus = ModelPosition.from(ctx.model.rootModelNode, [1]);

    ctx.modelSelection.anchor = anchor;
    ctx.modelSelection.focus = focus;

    assert.false(ctx.modelSelection.isRightToLeft);
    assert.false(ctx.modelSelection.isCollapsed);
    assert.strictEqual(ctx.modelSelection.getRangeAt(0).start, anchor);
    assert.strictEqual(ctx.modelSelection.getRangeAt(0).end, focus);


  });
  test("sets anchor and focus correctly, anchor before focus", assert => {
    const anchor = ModelPosition.from(ctx.model.rootModelNode, [1]);
    const focus = ModelPosition.from(ctx.model.rootModelNode, [0]);

    ctx.modelSelection.anchor = anchor;
    ctx.modelSelection.focus = focus;

    assert.true(ctx.modelSelection.isRightToLeft);
    assert.false(ctx.modelSelection.isCollapsed);
    assert.strictEqual(ctx.modelSelection.getRangeAt(0).start, focus);
    assert.strictEqual(ctx.modelSelection.getRangeAt(0).end, anchor);


  });
  test("collapseOn sets position correctly", assert => {
    const {modelSelection, model} = ctx;
    const p = new ModelElement("p");
    const content = new ModelText("test");
    model.rootModelNode.addChild(p);
    p.addChild(content);
    modelSelection.collapseOn(content);
    assert.true(modelSelection.isCollapsed);
    assert.true(modelSelection.focus?.sameAs(ModelPosition.fromParent(model.rootModelNode, content, 0)))

  });
});

