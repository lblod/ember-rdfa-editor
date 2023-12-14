import { traverseElements } from './traverseElements';
import { RDFA_ATTRIBUTES } from '../../constants';

const ALLOWED_EMPTY_ELEMENTS = ['BR', 'IMG'];
const NOTRIM_ELEMENTS = ['SPAN'];

function hasRdfaAttributes(element: Element) {
  for (const attr of RDFA_ATTRIBUTES) {
    if (element.hasAttribute(attr)) {
      return true;
    }
  }
  return false;
}
function isEmpty(element: Element): boolean {
  if (ALLOWED_EMPTY_ELEMENTS.includes(element.nodeName)) {
    return false;
  }
  if (hasRdfaAttributes(element)) {
    return false;
  }
  let content;
  if (NOTRIM_ELEMENTS.includes(element.nodeName)) {
    content = element.innerHTML;
  } else {
    content = element.innerHTML.trim();
  }

  return !content;
}

function removeIfEmpty(element: Element): void {
  if (isEmpty(element)) {
    const { parentElement } = element;

    element.remove();

    if (parentElement) {
      removeIfEmpty(parentElement);
    }
  }
}

export function cleanEmptyElements(rootNode: Node): void {
  traverseElements(rootNode, (element) => {
    removeIfEmpty(element);
    return true;
  });
}
