import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {HtmlReaderContext} from "@lblod/ember-rdfa-editor/model/readers/html-reader";
import {ElementType} from "@lblod/ember-rdfa-editor/model/model-element";
import HtmlListReader from "@lblod/ember-rdfa-editor/model/readers/html-list-reader";
import {isElement, isTextNode, tagName} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import HtmlElementReader from "@lblod/ember-rdfa-editor/model/readers/html-element-reader";
import HtmlTextReader from "@lblod/ember-rdfa-editor/model/readers/html-text-reader";
import HtmlTableReader from "@lblod/ember-rdfa-editor/model/readers/html-table-reader";
import HtmlSpanReader from "@lblod/ember-rdfa-editor/model/readers/html-span-reader";
import WrappedAttributeReader from "@lblod/ember-rdfa-editor/model/readers/wrapped-attribute-reader";

type Constructor<T> = new (...args: unknown[]) => T;
type ElementReader = Reader<Element, ModelNode[], HtmlReaderContext>;

export default class HtmlNodeReader implements Reader<Node, ModelNode[], HtmlReaderContext> {
  static elementConfig = new Map<ElementType, Constructor<ElementReader>>(
    [
      ["ul", HtmlListReader],
      ["ol", HtmlListReader],
      ["table", HtmlTableReader],
      ["span", HtmlSpanReader],
      ["strong", WrappedAttributeReader],
      ["em", WrappedAttributeReader],
      ["b", WrappedAttributeReader],
      ["i", WrappedAttributeReader],
      ["u", WrappedAttributeReader],
      ["del", WrappedAttributeReader]
    ]
  );

  read(from: Node, context: HtmlReaderContext): ModelNode[] {
    let result: ModelNode[];
    if (isElement(from)) {
      const tag = tagName(from) as ElementType;
      let reader: ElementReader;
      const ctor = HtmlNodeReader.elementConfig.get(tag);
      if (ctor) {
        reader = new ctor();
      } else {
        reader = new HtmlElementReader();
      }
      result = reader.read(from, context);

    } else if (isTextNode(from)) {
      const reader = new HtmlTextReader();
      result = reader.read(from, context);
    } else {
      result = [];
    }

    return result;
  }

}
