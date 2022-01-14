import Reader from '@lblod/ember-rdfa-editor/model/readers/reader';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import { HtmlReaderContext } from '@lblod/ember-rdfa-editor/model/readers/html-reader';
import { ElementType } from '@lblod/ember-rdfa-editor/model/model-element';
import HtmlListReader from '@lblod/ember-rdfa-editor/model/readers/html-list-reader';
import {
  isElement,
  isTextNode,
  tagName,
} from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import HtmlElementReader from '@lblod/ember-rdfa-editor/model/readers/html-element-reader';
import HtmlTextReader from '@lblod/ember-rdfa-editor/model/readers/html-text-reader';
import HtmlTableReader from '@lblod/ember-rdfa-editor/model/readers/html-table-reader';
import HtmlSpanReader from '@lblod/ember-rdfa-editor/model/readers/html-span-reader';
import { pushOrExpand } from '@lblod/ember-rdfa-editor/model/util/array-utils';

type Constructor<T> = new (...args: unknown[]) => T;
type ElementReader = Reader<Element, ModelNode[], HtmlReaderContext>;

export default class HtmlNodeReader
  implements Reader<Node, ModelNode[], HtmlReaderContext>
{
  static elementConfig = new Map<ElementType, Constructor<ElementReader>>([
    ['ul', HtmlListReader],
    ['ol', HtmlListReader],
    ['table', HtmlTableReader],
    ['span', HtmlSpanReader],
  ]);

  read(from: Node, context: HtmlReaderContext): ModelNode[] {
    let result: ModelNode[];
    if (isElement(from)) {
      const tag = tagName(from) as ElementType;

      const marks = context.matchMark(from);
      if (marks.size) {
        context.activeMarks.add(...marks);
        const reader = new HtmlNodeReader();
        result = [];

        for (const child of from.childNodes) {
          const modelChild = reader.read(child, context);
          if (modelChild) {
            pushOrExpand(result, modelChild);
          }
        }
        context.activeMarks.delete(...marks);
      } else {
        let reader: ElementReader;
        const ctor = HtmlNodeReader.elementConfig.get(tag);
        if (ctor) {
          reader = new ctor();
        } else {
          reader = new HtmlElementReader();
        }
        result = reader.read(from, context);
      }
    } else if (isTextNode(from)) {
      const reader = new HtmlTextReader();
      result = reader.read(from, context);
    } else {
      result = [];
    }

    return result;
  }
}
