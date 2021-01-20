import {module, test} from "qunit";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import {getWindowSelection} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import SelectionReader from "@lblod/ember-rdfa-editor/model/readers/selection-reader";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";

module("Unit | model | writers | selection-writer", hooks => {
  let model: Model;
  let rootNode: HTMLElement;
  let modelSelection: ModelSelection;
  let domSelection: Selection;
  let reader: SelectionReader;
  let testRoot;

  hooks.beforeEach(() => {
    testRoot = document.getElementById("ember-testing");
    rootNode = document.createElement("div");
    if (!testRoot) {
      throw new Error("testRoot not found");
    }
    testRoot.appendChild(rootNode);
    model = new Model();
    model.rootNode = rootNode;
    model.read();
    model.write();
    domSelection = getWindowSelection();
    reader = new SelectionReader(model);
  });
  const sync = () => {
    model.read();
    model.write();
  };
  test("converts a modelSelection correctly", assert => {
    const text = new ModelText("asdf");
    model.rootModelNode.addChild(text);
    assert.strictEqual(text.length, 4);
    model.selection.selectNode(text);


    model.write();
    model.writeSelection();

    domSelection = getWindowSelection();
    assert.strictEqual(getWindowSelection().anchorNode, text.boundNode);
    assert.strictEqual(getWindowSelection().anchorOffset, 0);
    assert.strictEqual(getWindowSelection().focusNode, text.boundNode);
    assert.strictEqual(getWindowSelection().focusOffset, (text.boundNode as Text).length);


  });
});
