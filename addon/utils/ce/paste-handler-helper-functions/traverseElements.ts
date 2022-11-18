import { traverse } from './traverse';

type Callback = (node: Element) => boolean;

function isElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE;
}

export function traverseElements(rootNode: Node, callback: Callback): void {
  traverse(rootNode, (node) => {
    if (!isElement(node)) {
      return true;
    }

    return callback(node);
  });
}
