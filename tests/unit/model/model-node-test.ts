import {module, test} from "qunit";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";


module("Unit | model | model-node", hooks => {
  let model: Model;
  let rootNode: HTMLElement;

  hooks.beforeEach(() => {
    rootNode = document.createElement("div");
    model = new Model();
    model.rootNode = rootNode;
    model.read();
  });


  test("indexPath returns empty path when node has no parent", assert => {

    const node = new ModelText("test");
    const rslt = node.getIndexPath();
    assert.deepEqual(rslt, []);

  });

  test("indexPath returns correct path when node has parent", assert => {

    const parent = new ModelElement("div");
    const node = new ModelText("test");
    parent.addChild(node);

    const rslt = node.getIndexPath();
    assert.deepEqual(rslt, [0]);

  });
  test("indexPath returns correct path when complex tree", assert => {

    const root = new ModelElement("div");
    const r0 = new ModelElement("div");
    const r1 = new ModelElement("div");
    root.appendChildren(r0, r1);

    const r10 = new ModelElement("div");
    const r11 = new ModelElement("div");
    const node = new ModelText("test");
    r1.appendChildren(r10, r11, node);

    const rslt = node.getIndexPath();
    assert.deepEqual(rslt, [1,2]);

  });
});
