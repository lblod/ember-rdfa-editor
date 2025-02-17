import { getListContentHtml } from './getListContentHtml.ts';
import { getListLevel } from './getListLevel.ts';
import { isList } from './isList.ts';
import { isOrderedList } from './isOrderedList.ts';
import { parseHtmlElement } from './parseHtmlElement.ts';

interface Result {
  list: Element | null;
  nextSibling: Element | null;
}

export function buildList(element: Element): Result {
  const listLevel = getListLevel(element);
  let listHtml = '';
  let nextSibling: Element | null = element;

  while (nextSibling) {
    if (!isList(nextSibling)) {
      break;
    }

    const nextListLevel = getListLevel(nextSibling);

    if (nextListLevel < listLevel) {
      // Lower level found. Current list is done.
      listHtml += `</li>`;
      break;
    }

    if (nextListLevel > listLevel) {
      const nestedList = buildList(nextSibling);

      if (nestedList.list) {
        listHtml += nestedList.list.outerHTML;
      }

      nextSibling = nestedList.nextSibling;
      continue;
    }

    listHtml += `<li>${getListContentHtml(nextSibling)}`;
    const currentElement = nextSibling;
    nextSibling = currentElement.nextElementSibling;
    currentElement.remove();
  }

  const listTagName = isOrderedList(element) ? 'ol' : 'ul';
  const list = parseHtmlElement(`<${listTagName}>${listHtml}</${listTagName}>`);

  return { list, nextSibling };
}
