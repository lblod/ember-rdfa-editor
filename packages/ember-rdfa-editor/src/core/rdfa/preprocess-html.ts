import { isElement } from '#root/utils/_private/dom-helpers.ts';
import { IllegalArgumentError } from '#root/utils/_private/errors.ts';
import { v4 as uuidv4 } from 'uuid';

function shouldBeSkipped(node: Node) {
  return (
    isElement(node) &&
    (node.dataset['contentContainer'] ||
      node.dataset['rdfaContainer'] ||
      node.dataset['sayId'])
  );
}
export function getPreprocessedCopy(node: Node): Node {
  const clone = node.cloneNode(true);

  if (isElement(clone)) {
    clone.dataset['sayProcessed'] = 'true';
  }
  const tw = document.createNodeIterator(clone, NodeFilter.SHOW_ELEMENT);
  let curNode: HTMLElement | null;
  do {
    curNode = tw.nextNode() as HTMLElement;
    if (curNode && !shouldBeSkipped(curNode)) {
      const id = uuidv4();
      curNode.dataset['sayId'] = id;
    }
  } while (curNode);
  return clone;
}
/**
 * Class to encapsulate the idea of a preprocessed node in types, so
 * other functions can statically express they require a preprocessed node
 */
export class PreprocessedNode {
  private node: Node;
  constructor(node: Node) {
    // if (isElement(node) && node.dataset['sayProcessed'] !== 'true') {
    //   throw new IllegalArgumentError('Node must be preprocessed');
    // }
    this.node = node;
  }
  get htmlNode(): Node {
    return this.node;
  }
}
