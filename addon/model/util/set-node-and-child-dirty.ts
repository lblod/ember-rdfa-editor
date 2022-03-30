import ModelElement from '../model-element';
import ModelNode from '../model-node';

export default function setNodeAndChildDirty(node: ModelNode) {
  node.addDirty('content');
  if (ModelElement.isModelElement(node)) {
    for (const child of node.children) {
      setNodeAndChildDirty(child);
    }
  }
}
