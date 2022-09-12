import { module, test } from 'qunit';
import ModelElement, {
  ElementType,
} from '@lblod/ember-rdfa-editor/model/model-element';
import ModelNodeFinder from '@lblod/ember-rdfa-editor/utils/model-node-finder';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import { Direction } from '@lblod/ember-rdfa-editor/utils/types';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';

function testElement(type: ElementType, name = 'testNode'): ModelElement {
  return new ModelElement(type, { debugInfo: name });
}

module('Unit | model | util | node-finder', function () {
  test('finds the startnode when its the only node and it fits', function (assert) {
    const root = new ModelElement('div');

    const nodeFinder = new ModelNodeFinder({
      startNode: root,
      rootNode: root,
    });
    assert.strictEqual(nodeFinder.next(), root);
    assert.strictEqual(nodeFinder.next(), null);
  });

  test('converts to an array with only one element', function (assert) {
    const root = new ModelElement('div');

    const nodeFinder = new ModelNodeFinder({
      startNode: root,
      rootNode: root,
    });
    const result = [...nodeFinder];
    assert.strictEqual(result[0], root);
    assert.strictEqual(result.length, 1);
  });

  test('finds no nodes when only one invalid node', function (assert) {
    const root = new ModelElement('div');

    const nodeFinder = new ModelNodeFinder<ModelElement>({
      startNode: root,
      rootNode: root,
      nodeFilter: ModelNode.isModelElement,
      predicate: (node) => node.type === 'span',
    });
    const result = [...nodeFinder];
    assert.strictEqual(result.length, 0);
  });

  test("finds one valid node when it's the endnode", function (assert) {
    const root = new ModelElement('div');
    const start = new ModelElement('div');
    const end = new ModelElement('span');

    root.appendChildren(start, end);

    const nodeFinder = new ModelNodeFinder<ModelElement>({
      startNode: start,
      rootNode: root,
      endNode: end,
      nodeFilter: ModelNode.isModelElement,
      predicate: (node) => node.type === 'span',
    });
    const result = [...nodeFinder];
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0], end);
  });

  test('finds all nodes of a small tree in expected order when starting at root', function (assert) {
    const root = new ModelElement('div');
    const start = new ModelElement('div');
    const end = new ModelElement('span');

    root.appendChildren(start, end);

    const nodeFinder = new ModelNodeFinder<ModelElement>({
      startNode: root,
      rootNode: root,
      endNode: end,
    });
    const result = [...nodeFinder];
    assert.strictEqual(result.length, 3);
    assert.strictEqual(result[0], root);
    assert.strictEqual(result[1], start);
    assert.strictEqual(result[2], end);
  });

  test('finds all nodes of a small tree in expected order when starting at root BACKWARDS', function (assert) {
    const root = new ModelElement('div');
    const start = new ModelElement('div');
    const end = new ModelElement('span');

    root.appendChildren(end, start);

    const nodeFinder = new ModelNodeFinder<ModelElement>({
      startNode: root,
      rootNode: root,
      endNode: end,
      direction: Direction.BACKWARDS,
    });
    const result = [...nodeFinder];
    assert.strictEqual(result.length, 3);
    assert.strictEqual(result[0], root);
    assert.strictEqual(result[1], start);
    assert.strictEqual(result[2], end);
  });
  test('finds start and end nodes of a small tree in expected order', function (assert) {
    const root = new ModelElement('div');
    const start = new ModelElement('div');
    const end = new ModelElement('span');

    root.appendChildren(start, end);

    const nodeFinder = new ModelNodeFinder<ModelElement>({
      startNode: start,
      rootNode: root,
      endNode: end,
    });
    const result = [...nodeFinder];
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0], start);
    assert.strictEqual(result[1], end);
  });

  test('does not go past endnode', function (assert) {
    const root = new ModelElement('div');
    const start = new ModelElement('div');
    const end = new ModelElement('span');
    const afterEnd = new ModelElement('div');

    root.appendChildren(start, end, afterEnd);

    const nodeFinder = new ModelNodeFinder<ModelElement>({
      startNode: start,
      rootNode: root,
      endNode: end,
    });
    const result = [...nodeFinder];
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0], start);
    assert.strictEqual(result[1], end);
  });

  test('does not find nodes before startnode', function (assert) {
    const root = new ModelElement('div');
    const start = new ModelElement('div');
    const end = new ModelElement('span');
    const beforeStart = new ModelElement('div');

    root.appendChildren(beforeStart, start, end);

    const nodeFinder = new ModelNodeFinder<ModelElement>({
      startNode: start,
      rootNode: root,
      endNode: end,
    });
    const result = [...nodeFinder];
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0], start);
    assert.strictEqual(result[1], end);
  });

  test('finds all nodes of a small tree in expected order when starting at root without endnode', function (assert) {
    const root = new ModelElement('div');
    const start = new ModelElement('div');
    const end = new ModelElement('span');

    root.appendChildren(start, end);

    const nodeFinder = new ModelNodeFinder<ModelElement>({
      startNode: root,
      rootNode: root,
    });
    const result = [...nodeFinder];
    assert.strictEqual(result.length, 3);
    assert.strictEqual(result[0], root);
    assert.strictEqual(result[1], start);
    assert.strictEqual(result[2], end);
  });
  test('does not find nodes above root', function (assert) {
    const aboveRoot = new ModelElement('div');
    const root = new ModelElement('div');
    const start = new ModelElement('div');
    const end = new ModelElement('span');
    const beforeStart = new ModelElement('div');
    aboveRoot.addChild(root);
    root.appendChildren(beforeStart, start, end);

    const nodeFinder = new ModelNodeFinder<ModelElement>({
      startNode: start,
      rootNode: root,
    });
    const result = [...nodeFinder];
    assert.strictEqual(result.length, 3);
    assert.strictEqual(result[0], start);
    assert.strictEqual(result[1], end);
    assert.strictEqual(result[2], root);
  });
  test('does not find samelevel nodes outside subtree', function (assert) {
    const aboveRoot = testElement('div', 'aboveRoot');
    const otherTree = testElement('div', 'otherTree');
    const root = new ModelElement('div');
    const start = new ModelElement('div');
    const end = new ModelElement('span');
    const beforeStart = new ModelElement('div');
    aboveRoot.appendChildren(root, otherTree);
    root.appendChildren(beforeStart, start, end);

    const nodeFinder = new ModelNodeFinder<ModelElement>({
      startNode: start,
      rootNode: root,
    });
    const result = [...nodeFinder];
    assert.strictEqual(result.length, 3);
    assert.strictEqual(result[0], start);
    assert.strictEqual(result[1], end);
    assert.strictEqual(result[2], root);
  });
  test('finds one node if start is end and start is also valid', function (assert) {
    const start = testElement('div');

    const nodeFinder = new ModelNodeFinder<ModelElement>({
      startNode: start,
      rootNode: start,
      endNode: start,
    });
    const result = [...nodeFinder];
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0], start);
  });
  test('finds nodes correctly when start is child of end', function (assert) {
    const root = testElement('div');

    const testTree = testElement('div');
    const start = new ModelText('start');
    const startsibling = new ModelText('other');
    testTree.appendChildren(start, startsibling);

    const sistertext = new ModelText('should not visit');

    const sistertree = testElement('div');
    const sisterchild1 = new ModelText('should not visit');
    const sisterchild2 = new ModelText('should not visit');
    const sisterchild3 = new ModelText('should not visit');
    sistertree.appendChildren(sisterchild1, sisterchild2, sisterchild3);

    root.appendChildren(testTree, sistertext, sistertree);

    const nodeFinder = new ModelNodeFinder<ModelText>({
      startNode: start,
      rootNode: root,
      endNode: testTree,
      nodeFilter: ModelNode.isModelText,
    });
    const result = [...nodeFinder];

    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0], start);
    assert.strictEqual(result[1], startsibling);
  });
});
