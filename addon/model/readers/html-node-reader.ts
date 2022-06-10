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
import SetUtils from '@lblod/ember-rdfa-editor/model/util/set-utils';
import HtmlInlineComponentReader from './html-inline-component-reader';

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
      const inlineComponent = context.matchInlineComponent(from);
      if (inlineComponent) {
        const reader = new HtmlInlineComponentReader();
        result = reader.read({ element: from, spec: inlineComponent }, context);
      } else {
        const marks = context.matchMark(from);
        if (marks.size) {
          context.markViewRootStack.push(from);
          SetUtils.addMany(context.activeMarks, ...marks);
          const reader = new HtmlNodeReader();
          result = [];

          for (const child of from.childNodes) {
            const modelChild = reader.read(child, context);
            if (modelChild) {
              pushOrExpand(result, modelChild);
            }
          }
          SetUtils.deleteMany(context.activeMarks, ...marks);
          context.markViewRootStack.pop();
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
