import { isElement } from '#root/utils/_private/dom-helpers.ts';
import { v4 as uuidv4 } from 'uuid';
type SayId = `[say]-${string}`;

function makeSayId(): SayId {
  return `[say]-${uuidv4()}`;
}
export function isSayId(str: unknown): str is SayId {
  if (typeof str === 'string') {
    return str.startsWith('[say]');
  }
  return false;
}
function shouldBeSkipped(node: Node) {
  return (
    isElement(node) &&
    (node.dataset['contentContainer'] || node.dataset['rdfaContainer'])
  );
}
export function preProcessInPlace(node: Node): PreprocessedNode {
  if (isPreprocessed(node)) {
    return node;
  }

  if (isElement(node)) {
    const tw = document.createNodeIterator(node, NodeFilter.SHOW_ELEMENT);
    let curNode: HTMLElement | null;
    do {
      curNode = tw.nextNode() as HTMLElement;
      if (curNode && !shouldBeSkipped(curNode)) {
        if (!curNode.dataset['sayId']) {
          const id = makeSayId();
          curNode.dataset['sayId'] = id;
        }
        curNode.dataset['sayProcessed'] = 'true';
      }
    } while (curNode);
  }
  return node as PreprocessedNode;
}
export function getPreprocessedCopy(node: Node): PreprocessedNode {
  const clone = node.cloneNode(true);
  return preProcessInPlace(clone);
}
/**
 * Class to encapsulate the idea of a preprocessed node in types, so
 * other functions can statically express they require a preprocessed node
 */
export type PreprocessedNode = HTMLElement & {
  dataset: HTMLElement['dataset'] & { sayId: SayId; sayProcessed: 'true' };
};
export function isPreprocessed(node: Node): node is PreprocessedNode {
  return (
    isElement(node) &&
    isSayId(node.dataset['sayId']) &&
    node.dataset['sayProcessed'] === 'true'
  );
}
