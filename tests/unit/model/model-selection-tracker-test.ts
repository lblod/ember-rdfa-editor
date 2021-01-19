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

  hooks.beforeEach(() => {
    rootNode = document.createElement("div");
    model = new Model();
    model.rootNode = rootNode;
    model.read();
    model.write();
    selection = getWindowSelection();
    tracker = new ModelSelectionTracker(model);
  });
  const sync = () => {
    model.read();
    model.write();
  };
  test("sets a correct model-selection - trivial dom", function (assert) {

    const text = new Text("abc");
    rootNode.appendChild(text);

    sync();

    selection.collapse(text);

    assert.equal(tracker.modelSelection.getRangeAt(0).start.parent, model.rootModelNode);
    assert.equal(tracker.modelSelection.getRangeAt(0).start, 0);
    assert.equal(tracker.modelSelection.getRangeAt(0).end, 0);


  });

  test("converts a dom range correctly", assert => {
    const text = new Text("abc");
    rootNode.appendChild(text);
    sync();
    const testRange = document.createRange();
    testRange.setStart(text, 0);

    const result = tracker.readDomRange(testRange);
    assert.true(result.collapsed);
    assert.true(result.start.sameAs(ModelPosition.from(model.rootModelNode, [0, 0])));

  });
  test("converts a dom position correctly", assert => {
    const text = new Text("abc");
    rootNode.appendChild(text);
    sync();

    const result = tracker.readDomPosition(text, 0);
    assert.true(result.sameAs(ModelPosition.from(model.rootModelNode, [0, 0])));

  });
});
