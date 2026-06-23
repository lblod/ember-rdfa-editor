import { isElement } from '#root/utils/_private/dom-helpers.ts';
import { makeSayId, type SayId, isSayId } from './say-id.ts';

function shouldBeSkipped(node: Node) {
  return (
    isElement(node) &&
    (node.dataset['contentContainer'] ||
      node.dataset['rdfaContainer'] ||
      node.dataset['sayPlaceholder'])
  );
}
/**
 * For our parsing logic, we need to distinguish between cases where the RDFa parser gets the triple's object from html attributes and cases where it gets it from the textcontent.
 * This is unambiguously defined in the spec.
 *
 * TODO: make sure we handle all cases
 */
export function childContentIsRdfaObjectValue(element: HTMLElement) {
  if (element.getAttribute('property')) {
    if (
      !(
        element.getAttribute('content') ||
        element.getAttribute('resource') ||
        element.getAttribute('href') ||
        element.getAttribute('src')
      )
    ) {
      return true;
    }
  }
  return false;
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
        // this is the crux of the whole parsing trick
        // If we know that the parser will use the node's textcontent for its object value, we instead force it to
        // pick up the node's rdfaId as the value by setting it as the content attribute
        if (childContentIsRdfaObjectValue(curNode)) {
          curNode.setAttribute('content', curNode.dataset['sayId']);
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
