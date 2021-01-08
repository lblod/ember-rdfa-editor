import {module, test} from "qunit";
import ModelElement, {ElementType} from "@lblod/ember-rdfa-editor/model/model-element";
import ModelNodeFinder from "@lblod/ember-rdfa-editor/model/util/model-node-finder";
import ModelNode, {ModelNodeType} from "@lblod/ember-rdfa-editor/model/model-node";
import {Direction} from "@lblod/ember-rdfa-editor/model/util/types";

function testElement(type: ElementType, name: string = "testNode"): ModelElement {
  return new ModelElement(type, {debugInfo: name});
}

module("Unit | model | util | node-finder", function () {

  test("finds the startnode when its the only node and it fits", function(assert) {

    const root = new ModelElement("div");

    const nodeFinder = new ModelNodeFinder({
      startNode: root,
      rootNode: root,
    });
    assert.equal(nodeFinder.next(), root);
    assert.equal(nodeFinder.next(), null);

  });

  test("converts to an array with only one element", function(assert) {

    const root = new ModelElement("div");

    const nodeFinder = new ModelNodeFinder({
      startNode: root,
      rootNode: root,
    });
    const result = [...nodeFinder];
    assert.equal(result[0], root);
    assert.equal(result.length, 1);

  });

  test("finds no nodes when only one invalid node", function (assert) {
    const root = new ModelElement("div");

    const nodeFinder = new ModelNodeFinder<ModelElement>({
      startNode: root,
      rootNode: root,
      nodeFilter: ModelNode.isModelElement,
      predicate: node => node.type === "span"
    });
    const result = [...nodeFinder];
    assert.equal(result.length, 0);
  });

  test("finds one valid node when it's the endnode", function (assert) {
    const root = new ModelElement("div");
    const start = new ModelElement("div");
    const end = new ModelElement("span");

    root.appendChildren(start, end);

    const nodeFinder = new ModelNodeFinder<ModelElement>({
      startNode: start,
      rootNode: root,
      endNode: end,
      nodeFilter: ModelNode.isModelElement,
      predicate: node => node.type === "span"
    });
    const result = [...nodeFinder];
    assert.equal(result.length, 1);
    assert.equal(result[0], end);
  });

  test("finds all nodes of a small tree in expected order when starting at root", function (assert) {
    const root = new ModelElement("div");
    const start = new ModelElement("div");
    const end = new ModelElement("span");

    root.appendChildren(start, end);

    const nodeFinder = new ModelNodeFinder<ModelElement>({
      startNode: root,
      rootNode: root,
      endNode: end,
    });
    const result = [...nodeFinder];
    assert.equal(result.length, 3);
    assert.equal(result[0], root);
    assert.equal(result[1], start);
    assert.equal(result[2], end);
  });

  test("finds all nodes of a small tree in expected order when starting at root BACKWARDS", function (assert) {
    const root = new ModelElement("div");
    const start = new ModelElement("div");
    const end = new ModelElement("span");

    root.appendChildren(end, start);

    const nodeFinder = new ModelNodeFinder<ModelElement>({
      startNode: root,
      rootNode: root,
      endNode: end,
      direction: Direction.BACKWARDS,
    });
    const result = [...nodeFinder];
    assert.equal(result.length, 3);
    assert.equal(result[0], root);
    assert.equal(result[1], start);
    assert.equal(result[2], end);
  });
  test("finds start and end nodes of a small tree in expected order", function (assert) {
    const root = new ModelElement("div");
    const start = new ModelElement("div");
    const end = new ModelElement("span");

    root.appendChildren(start, end);

    const nodeFinder = new ModelNodeFinder<ModelElement>({
      startNode: start,
      rootNode: root,
      endNode: end,
    });
    const result = [...nodeFinder];
    assert.equal(result.length, 2);
    assert.equal(result[0], start);
    assert.equal(result[1], end);
  });

  test("does not go past endnode", function (assert) {
    const root = new ModelElement("div");
    const start = new ModelElement("div");
    const end = new ModelElement("span");
    const afterEnd = new ModelElement("div");

    root.appendChildren(start, end, afterEnd);

    const nodeFinder = new ModelNodeFinder<ModelElement>({
      startNode: start,
      rootNode: root,
      endNode: end,
    });
    const result = [...nodeFinder];
    assert.equal(result.length, 2);
    assert.equal(result[0], start);
    assert.equal(result[1], end);
  });

  test("does not find nodes before startnode", function (assert) {
    const root = new ModelElement("div");
    const start = new ModelElement("div");
    const end = new ModelElement("span");
    const beforeStart = new ModelElement("div");

    root.appendChildren(beforeStart, start, end);

    const nodeFinder = new ModelNodeFinder<ModelElement>({
      startNode: start,
      rootNode: root,
      endNode: end,
    });
    const result = [...nodeFinder];
    assert.equal(result.length, 2);
    assert.equal(result[0], start);
    assert.equal(result[1], end);
  });


  test("finds all nodes of a small tree in expected order when starting at root without endnode", function (assert) {
    const root = new ModelElement("div");
    const start = new ModelElement("div");
    const end = new ModelElement("span");

    root.appendChildren(start, end);

    const nodeFinder = new ModelNodeFinder<ModelElement>({
      startNode: root,
      rootNode: root,
    });
    const result = [...nodeFinder];
    assert.equal(result.length, 3);
    assert.equal(result[0], root);
    assert.equal(result[1], start);
    assert.equal(result[2], end);
  });
  test("does not find nodes above root", function (assert) {
    const aboveRoot = new ModelElement("div");
    const root = new ModelElement("div");
    const start = new ModelElement("div");
    const end = new ModelElement("span");
    const beforeStart = new ModelElement("div");
    aboveRoot.addChild(root);
    root.appendChildren(beforeStart, start, end);

    const nodeFinder = new ModelNodeFinder<ModelElement>({
      startNode: start,
      rootNode: root,
    });
    const result = [...nodeFinder];
    assert.equal(result.length, 3);
    assert.equal(result[0], start);
    assert.equal(result[1], end);
    assert.equal(result[2], root);
  });
  test("does not find samelevel nodes outside subtree", function (assert) {
    const aboveRoot = testElement("div", "aboveRoot");
    const otherTree = testElement("div", "otherTree");
    const root = new ModelElement("div");
    const start = new ModelElement("div");
    const end = new ModelElement("span");
    const beforeStart = new ModelElement("div");
    aboveRoot.appendChildren(root, otherTree);
    root.appendChildren(beforeStart, start, end);

    const nodeFinder = new ModelNodeFinder<ModelElement>({
      startNode: start,
      rootNode: root,
    });
    const result = [...nodeFinder];
    assert.equal(result.length, 3);
    assert.equal(result[0], start);
    assert.equal(result[1], end);
    assert.equal(result[2], root);
  });
  test("finds one node if start is end and start is also valid", function (assert) {
    const start = testElement("div");

    const nodeFinder = new ModelNodeFinder<ModelElement>({
      startNode: start,
      rootNode: start,
      endNode: start
    });
    const result = [...nodeFinder];
    assert.equal(result.length, 1);
    assert.equal(result[0], start);
  });
});
