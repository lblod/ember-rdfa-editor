import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";
import RichElementContainer from "@lblod/ember-rdfa-editor/model/rich-element-container";
import HtmlTextReader from "@lblod/ember-rdfa-editor/model/readers/html-text-reader";
import WrappedAttributeReader from "@lblod/ember-rdfa-editor/model/readers/wrapped-attribute-reader";
import {RichTextContainer} from "@lblod/ember-rdfa-editor/model/rich-text-container";
import {isElement, isTextNode} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import {NotImplementedError} from "@lblod/ember-rdfa-editor/utils/errors";
import Model from "@lblod/ember-rdfa-editor/model/model";


export default class HtmlReader implements Reader<Node, RichElementContainer | RichTextContainer | null> {
  textReader: HtmlTextReader;
  wrappedAttributeReader: WrappedAttributeReader;

  constructor(private model: Model) {
    this.textReader = new HtmlTextReader();
    this.wrappedAttributeReader = new WrappedAttributeReader();
  }

  read(node: Node): RichElementContainer | RichTextContainer | null {
    node.normalize();
    if(isTextNode(node)) {
      return this.textReader.read(node);
    } else if(isElement(node) && WrappedAttributeReader.isWrappedAttributeElement(node)) {
      const parsed = this.wrappedAttributeReader.read(node);
      this.model.bindRichElement(parsed, node);
      return parsed;
    } else if (node.nodeType === Node.COMMENT_NODE) {
      return null;
    } else if(isElement(node)) {
      const container = new RichElementContainer(node.tagName as keyof HTMLElementTagNameMap);
      for(const child of node.childNodes) {
        const parsed = this.read(child);
        if (parsed) {
          container.addChild(parsed);
        }
      }
      this.model.bindRichElement(container, node);
      return container;
    } else {
      throw new NotImplementedError("Node type not implemented by HtmlReader");
    }
  }
}
