import { buildList } from './buildList.ts';
import { isList } from './isList.ts';
import { traverseElements } from './traverseElements.ts';

export function cleanListElements(body: Node): void {
  traverseElements(body, (element) => {
    const styleAttribute = element.getAttribute('style');

    if (styleAttribute) {
      element.setAttribute(
        'style',
        styleAttribute.replace(/mso-list:\s*Ignore/gim, 'mso-list:Ignore'),
      );
    }

    return true;
  });

  traverseElements(body, (element) => {
    if (!isList(element)) {
      return true;
    }

    const { parentElement, previousSibling } = element;

    if (!parentElement) {
      return true;
    }

    const { list } = buildList(element);

    if (!list) {
      return true;
    }

    const beforeElement = previousSibling
      ? previousSibling.nextSibling
      : parentElement.firstChild;

    if (beforeElement) {
      parentElement.insertBefore(list, beforeElement);
    } else {
      parentElement.appendChild(list);
    }

    return false;
  });
}
