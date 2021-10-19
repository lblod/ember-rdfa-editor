import {module, test} from "qunit";
import {getWindowSelection} from "@lblod/ember-rdfa-editor/archive/utils/dom-helpers";
import ModelPosition from "@lblod/ember-rdfa-editor/core/model/model-position";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import {setupTest} from "ember-qunit";
import ModelSelectionTracker from "@lblod/ember-rdfa-editor/archive/utils/ce/model-selection-tracker";
import EventBus from "@lblod/ember-rdfa-editor/core/event-bus";

module("Unit | model | model-selection-tracker", hooks => {
  const ctx = new ModelTestContext();
  hooks.beforeEach(() => {
    ctx.reset();
  });
  setupTest(hooks);
  const sync = () => {
    ctx.model.read();
    ctx.model.write();
  };
  test("sets a correct model-selection - trivial dom", function (assert) {

    const {model} = ctx;
    const testRoot = document.getElementById("ember-testing-container")!;
    const rootNode = model.rootElement;
    testRoot.appendChild(rootNode);
    const selection = getWindowSelection();
    const text = new Text("abc");
    const tracker = new ModelSelectionTracker(ctx.model, new EventBus());
    rootNode.appendChild(text);
    sync();

    selection.collapse(rootNode.childNodes[0]);
    tracker.updateSelection();

    assert.true(model.selection.getRangeAt(0).start.sameAs(ModelPosition.fromPath(model.rootModelNode, [0])));
    assert.true(model.selection.getRangeAt(0).end.sameAs(ModelPosition.fromPath(model.rootModelNode, [0])));
    assert.strictEqual(model.selection.getRangeAt(0).end.parent, model.rootModelNode);


  });

});
