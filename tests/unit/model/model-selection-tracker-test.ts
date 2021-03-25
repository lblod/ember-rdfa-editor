import {module, test} from "qunit";
import {getWindowSelection} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import ModelSelectionTracker from "@lblod/ember-rdfa-editor/utils/ce/model-selection-tracker";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";

module("Unit | model | model-selection-tracker", hooks => {
  let model: Model;
  let rootNode: HTMLElement;
  let selection: Selection;
  let tracker: ModelSelectionTracker;
  let testRoot;

  hooks.beforeEach(() => {
    testRoot = document.getElementById("ember-testing-container");
    if(!testRoot) {
      throw new Error("testRoot not found");
    }
    rootNode = document.createElement("div");
    testRoot.appendChild(rootNode);
    model = new Model();
    model.rootNode = rootNode;
    model.read();
    model.write();
    selection = getWindowSelection();
    tracker = new ModelSelectionTracker(model);
    // tracker.startTracking();
  });
  hooks.afterEach(() => {
    // tracker.stopTracking();
  });
  const sync = () => {
    model.read();
    model.write();
  };
  test("sets a correct model-selection - trivial dom", function (assert) {

    const text = new Text("abc");
    rootNode.appendChild(text);

    sync();

    selection.collapse(rootNode.childNodes[0]);
    tracker.updateSelection();

    assert.true(model.selection.getRangeAt(0).start.sameAs(ModelPosition.fromPath(model.rootModelNode, [0,0])));
    assert.true(model.selection.getRangeAt(0).end.sameAs(ModelPosition.fromPath(model.rootModelNode, [0,0])));
    assert.strictEqual(model.selection.getRangeAt(0).end.parent, model.rootModelNode.firstChild);


  });

});
