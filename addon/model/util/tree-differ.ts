import ModelElement from '../model-element';
import ModelNode, { DirtyType } from '../model-node';
import ModelNodeUtils from './model-node-utils';

export type Difference = {
  node: ModelNode;
  changes?: Set<DirtyType>;
};

export default class TreeDiffer {
  oldDocument: ModelElement;
  newDocument: ModelElement;

  constructor(oldDocument: ModelElement, newDocument: ModelElement) {
    this.oldDocument = oldDocument;
    this.newDocument = newDocument;
  }

  getDifference(): Difference[] {
    const difference = _computeDifference(this.oldDocument, this.newDocument);
    return difference;
  }
}

function _computeDifference(
  oldNode: ModelNode,
  newNode: ModelNode
): Difference[] {
  const result = [];
  const difference: Difference = { node: newNode };
  const changes = oldNode.diff(newNode);
  if (changes) {
    difference.changes = changes;
  }
  if (
    ModelNode.isModelElement(oldNode) &&
    ModelNode.isModelElement(newNode) &&
    !changes.has('content')
  ) {
    for (let i = 0; i < oldNode.length; i++) {
      const differenceRec = _computeDifference(
        oldNode.children[i],
        newNode.children[i]
      );
      result.push(...differenceRec);
    }
  }
  if (difference.changes?.size) {
    result.unshift(difference);
  }
  return result;
}
