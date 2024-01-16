import { traverseElements } from './traverseElements';

const ALLOWED_EMPTY_ELEMENTS = ['BR', 'IMG', 'TR', 'TD', 'HR'];
const NOTRIM_ELEMENTS = ['SPAN'];

function isEmpty(element: Element): boolean {
  if (
    element.hasAttribute('data-content-container') ||
    element.hasAttribute('data-rdfa-container')
  ) {
    return false;
  }
  if (ALLOWED_EMPTY_ELEMENTS.includes(element.nodeName)) {
    return false;
  }
  if (element.hasAttributes()) {
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
