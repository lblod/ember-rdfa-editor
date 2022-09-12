import ModelNode, { DirtyType } from '../core/model/nodes/model-node';

export type Difference = {
  node: ModelNode;
  changes?: Set<DirtyType>;
};

export default function computeDifference(
  oldDocument: ModelNode,
  newDocument: ModelNode
): Difference[] {
  const result = [];
  const difference: Difference = { node: newDocument };
  const changes = oldDocument.diff(newDocument);
  if (changes) {
    difference.changes = changes;
  }
  if (
    ModelNode.isModelElement(oldDocument) &&
    ModelNode.isModelElement(newDocument) &&
    !changes.has('content')
  ) {
    for (let i = 0; i < oldDocument.length; i++) {
      const differenceRec = computeDifference(
        oldDocument.children[i],
        newDocument.children[i]
      );
      result.push(...differenceRec);
    }
  }
  if (difference.changes?.size) {
    result.unshift(difference);
  }
  return result;
}
