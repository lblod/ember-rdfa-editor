import { traverseElements } from './traverseElements';

const ALLOWED_EMPTY_ELEMENTS = ['BR', 'IMG'];

function isEmpty(element: Element): boolean {
  return (
    !ALLOWED_EMPTY_ELEMENTS.includes(element.nodeName) &&
    !element.innerHTML.trim()
  );
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
