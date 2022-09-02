import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import { ElementType } from '@lblod/ember-rdfa-editor/model/model-element';
import readHtmlList from '@lblod/ember-rdfa-editor/model/readers/html-list-reader';
import {
  isElement,
  isTextNode,
  tagName,
} from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import readHtmlText from '@lblod/ember-rdfa-editor/model/readers/html-text-reader';
import readHtmlTable from '@lblod/ember-rdfa-editor/model/readers/html-table-reader';
import readHtmlSpan from '@lblod/ember-rdfa-editor/model/readers/html-span-reader';
import { pushOrExpand } from '@lblod/ember-rdfa-editor/model/util/array-utils';
import SetUtils from '@lblod/ember-rdfa-editor/model/util/set-utils';
import readHtmlInlineComponent from './html-inline-component-reader';
import { HtmlReaderContext } from './html-reader';
import readHtmlElement from './html-element-reader';

type ElementReader = (e: Element, c: HtmlReaderContext) => ModelNode[];
const ELEMENT_CONFIG = new Map<ElementType, ElementReader>([
  ['ul', readHtmlList],
  ['ol', readHtmlList],
  ['table', readHtmlTable],
  ['span', readHtmlSpan],
]);

export default function readHtmlNode(
  from: Node,
  context: HtmlReaderContext
): ModelNode[] {
  let result: ModelNode[];
  if (isElement(from)) {
    const tag = tagName(from) as ElementType;
    const inlineComponent = context.matchInlineComponent(from);
    if (inlineComponent) {
      result = readHtmlInlineComponent(from, inlineComponent, context);
    } else {
      const marks = context.matchMark(from);
      if (marks.size) {
        context.markViewRootStack.push(from);
        SetUtils.addMany(context.activeMarks, ...marks);
        result = [];

        for (const child of from.childNodes) {
          const modelChild = readHtmlNode(child, context);
          if (modelChild) {
            pushOrExpand(result, modelChild);
          }
        }
        SetUtils.deleteMany(context.activeMarks, ...marks);
        context.markViewRootStack.pop();
      } else {
        let reader: ElementReader;
        const match = ELEMENT_CONFIG.get(tag);
        if (match) {
          reader = match;
        } else {
          reader = readHtmlElement;
        }
        result = reader(from, context);
      }
    }
  } else if (isTextNode(from)) {
    result = readHtmlText(from, context);
  } else {
    result = [];
  }

  return result;
}
