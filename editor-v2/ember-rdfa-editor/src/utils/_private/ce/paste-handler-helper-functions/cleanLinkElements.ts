import { isFragmentHref } from './isFragmentHref.ts';
import { traverseElements } from './traverseElements.ts';
import { unwrapElement } from './unwrapElement.ts';

export function cleanLinkElements(rootNode: Node): void {
  traverseElements(rootNode, (element) => {
    if (element.tagName !== 'A') {
      return true;
    }

    const href = element.getAttribute('href');

    if (!href || isFragmentHref(href)) {
      unwrapElement(element);
    }

    if (href && element.querySelector('img')) {
      for (const span of element.querySelectorAll('span')) {
        if (!span.innerText) {
          unwrapElement(span);
        }
      }
    }

    return true;
  });
}
