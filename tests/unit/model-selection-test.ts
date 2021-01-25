import {module, test} from "qunit";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import {getWindowSelection} from "@lblod/ember-rdfa-editor/utils/dom-helpers";

module("Unit | model | model-selection", hooks => {
  let model: Model;
  let rootNode: HTMLElement;
  let modelSelection: ModelSelection;
  let domSelection: Selection;

  hooks.beforeEach(() => {
    rootNode = document.createElement("div");
    model = new Model();
    model.rootNode = rootNode;
    model.read();
    model.write();
    modelSelection = new ModelSelection(model);
    domSelection = getWindowSelection();
  });
  test("sets anchor and focus correctly, anchor before focus", assert => {
    const anchor = ModelPosition.from(model.rootModelNode, [0]);
    const focus = ModelPosition.from(model.rootModelNode, [1]);

    modelSelection.anchor = anchor;
    modelSelection.focus = focus;

    assert.false(modelSelection.isRightToLeft);
    assert.false(modelSelection.isCollapsed);
    assert.strictEqual(modelSelection.getRangeAt(0).start, anchor);
    assert.strictEqual(modelSelection.getRangeAt(0).end, focus);


  });
  test("sets anchor and focus correctly, anchor before focus", assert => {
    const anchor = ModelPosition.from(model.rootModelNode, [1]);
    const focus = ModelPosition.from(model.rootModelNode, [0]);

    modelSelection.anchor = anchor;
    modelSelection.focus = focus;

    assert.true(modelSelection.isRightToLeft);
    assert.false(modelSelection.isCollapsed);
    assert.strictEqual(modelSelection.getRangeAt(0).start, focus);
    assert.strictEqual(modelSelection.getRangeAt(0).end, anchor);


  });
});

