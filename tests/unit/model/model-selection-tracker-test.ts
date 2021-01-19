import {module, test} from "qunit";
import {getWindowSelection} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import ModelSelectionTracker from "@lblod/ember-rdfa-editor/utils/ce/model-selection-tracker";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import {SelectionError} from "@lblod/ember-rdfa-editor/utils/errors";

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

    model.read();


    selection.collapse(text);
    tracker.updateSelection();

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
  module("Unit | model | model-selection-tracker | readDomPosition", () => {

    test("converts a dom position correctly", assert => {
      const text = new Text("abc");
      rootNode.appendChild(text);
      sync();

      const result = tracker.readDomPosition(text, 0);
      assert.true(result.sameAs(ModelPosition.from(model.rootModelNode, [0, 0])));

    });
    test("converts a dom position correctly before text node", assert => {
      const text = new Text("abc");
      rootNode.appendChild(text);
      sync();

      const result = tracker.readDomPosition(rootNode, 0);
      assert.true(result.sameAs(ModelPosition.from(model.rootModelNode, [0])));

    });
    test("converts a dom position correctly after text node", assert => {
      const text = new Text("abc");
      rootNode.appendChild(text);
      sync();

      const result = tracker.readDomPosition(rootNode, 1);
      assert.true(result.sameAs(ModelPosition.from(model.rootModelNode, [1])));

    });

    test("throws exception when offset > length of node", assert => {
      const text = new Text("abc");
      rootNode.appendChild(text);
      sync();
      assert.throws(() => tracker.readDomPosition(rootNode, 2), SelectionError);
    });

    test("throws exception when offset < 0", assert => {
      const text = new Text("abc");
      rootNode.appendChild(text);
      sync();
      assert.throws(() => tracker.readDomPosition(rootNode, 2), SelectionError);
    });

    test("converts a dom position correctly when before element", assert => {
      const child0 = document.createElement("div");
      const child1 = document.createElement("div");
      const child2 = document.createElement("div");
      rootNode.append(child0, child1, child2);

      const child10 = document.createElement("div");
      const child11 = document.createElement("div");
      const child12 = new Text("abc");
      const child13 = document.createElement("div");
      child1.append(child10, child11, child12, child13);
      sync();

      let result = tracker.readDomPosition(child1, 0);
      assert.true(result.sameAs(ModelPosition.from(model.rootModelNode, [1, 0])));

      result = tracker.readDomPosition(child1, 0);
      assert.true(result.sameAs(ModelPosition.from(model.rootModelNode, [1, 0])));

      result = tracker.readDomPosition(child1, 1);
      assert.true(result.sameAs(ModelPosition.from(model.rootModelNode, [1, 1])));

      result = tracker.readDomPosition(child11, 0);
      assert.true(result.sameAs(ModelPosition.from(model.rootModelNode, [1, 1, 0])));


      result = tracker.readDomPosition(child12, 3);
      assert.true(result.sameAs(ModelPosition.from(model.rootModelNode, [1, 2, 3])));
    });
  });
});
