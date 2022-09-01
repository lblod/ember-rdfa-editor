import ModelElement, {
  ElementType,
} from '@lblod/ember-rdfa-editor/model/model-element';
import { tagName } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import readHtmlNode from '@lblod/ember-rdfa-editor/model/readers/html-node-reader';
import { copyAttributes } from '@lblod/ember-rdfa-editor/model/readers/reader-utils';
import { HtmlReaderContext } from './html-reader';

export default function readHtmlElement(
  element: HTMLElement,
  context: HtmlReaderContext
): ModelElement[] {
  const result = new ModelElement(tagName(element) as ElementType);
  copyAttributes(element, result);
  result.updateRdfaPrefixes(context.rdfaPrefixes);

  for (const child of element.childNodes) {
    const parsedChildren = readHtmlNode(child, context);
    result.appendChildren(...parsedChildren);
  }
  return [result];
}
