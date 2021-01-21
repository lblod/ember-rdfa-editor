import {module, test} from "qunit";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";


module("Unit | model | model", hooks => {
  let model: Model;
  let rootNode: HTMLElement;

  hooks.beforeEach(() => {
    let testContainer = document.getElementById("ember-testing");
    rootNode = document.createElement("div");
    testContainer!.appendChild(rootNode);
    model = new Model();
    model.rootNode = rootNode;
    model.read();
  });


  test("getChildIndex returns index of child - only child", function (assert) {
    const parent = document.createElement("div");
    const searchTarget = document.createElement("span");

    parent.appendChild(searchTarget);

    assert.equal(Model.getChildIndex(searchTarget), 0);
  });

  test("getChildIndex returns index of child - last child", function (assert) {
    const parent = document.createElement("div");
    const searchTarget = document.createElement("span");

    for (let i = 0; i < 4; i++) {
      parent.appendChild(document.createElement("span"));
    }

    parent.appendChild(searchTarget);

    assert.equal(Model.getChildIndex(searchTarget), 4);
  });

  test("getChildIndex returns null if no parent", function (assert) {
    const searchTarget = document.createElement("span");
    assert.equal(Model.getChildIndex(searchTarget), null);
  });


});
