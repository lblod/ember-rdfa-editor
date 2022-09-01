import ModelElement, {
  ElementType,
} from '@lblod/ember-rdfa-editor/model/model-element';
import { isElement, tagName } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import readHtmlNode from '@lblod/ember-rdfa-editor/model/readers/html-node-reader';
import { copyAttributes } from '@lblod/ember-rdfa-editor/model/readers/reader-utils';
import { HtmlReaderContext } from './html-reader';

/**
 * Reader for an <ul> or <ol> element.
 * NOTE: currently enforces the permitted content constraints very aggressively by ignoring any
 * children which are not <li> elements.
 */

export default function readHtmlList(
  element: HTMLUListElement | HTMLOListElement,
  context: HtmlReaderContext
) {
  const wrapper = new ModelElement(tagName(element) as ElementType);
  for (const child of element.childNodes) {
    // non-li childnodes are not allowed
    if (isElement(child) && tagName(child) === 'li') {
      const parsedChildren = readHtmlNode(child, context);
      if (parsedChildren) {
        wrapper.appendChildren(...parsedChildren);
      }
    }
  }
  // empty lists are useless
  if (!wrapper.length) {
    return [];
  }
  copyAttributes(element, wrapper);
  return [wrapper];
}
