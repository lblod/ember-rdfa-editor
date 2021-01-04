import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";
import HtmlTextReader from "@lblod/ember-rdfa-editor/model/readers/html-text-reader";
import WrappedAttributeReader from "@lblod/ember-rdfa-editor/model/readers/wrapped-attribute-reader";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {isElement, isTextNode, tagName} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import HtmlVoidReader from "@lblod/ember-rdfa-editor/model/readers/html-void-reader";
import HtmlElementReader from "@lblod/ember-rdfa-editor/model/readers/html-element-reader";
import HtmlListReader from "@lblod/ember-rdfa-editor/model/readers/html-list-reader";
import Fragment from "@lblod/ember-rdfa-editor/model/fragment";
import {HtmlTag} from "@lblod/ember-rdfa-editor/model/util/types";


/**
 * Top-level reader for HTML documents
 */
export default class HtmlReader implements Reader<Node, ModelNode> {
  textReader: HtmlTextReader;
  wrappedAttributeReader: WrappedAttributeReader;
  private voidReader: HtmlVoidReader;
  private elementReader: HtmlElementReader;
  private listReader: HtmlListReader;
  elementConfig: Map<keyof HTMLElementTagNameMap, Reader<HTMLElement, ModelElement | null>>;

  constructor(private model: Model) {
    this.elementReader = new HtmlElementReader(model);
    this.textReader = new HtmlTextReader(model);
    this.wrappedAttributeReader = new WrappedAttributeReader();
    this.voidReader = new HtmlVoidReader();
    this.listReader = new HtmlListReader(model, this.elementReader);
    this.elementConfig = new Map<keyof HTMLElementTagNameMap, Reader<HTMLElement, ModelElement>>(
      [
        ["li", this.listReader],
        ["strong", this.wrappedAttributeReader],
        ["em", this.wrappedAttributeReader],
        ["b", this.wrappedAttributeReader],
        ["i", this.wrappedAttributeReader],

      ]
    );
  }

  read(node: Node): ModelNode {
    node.normalize();
    let result = this.readRec(node);
    if (!result) {
      result = new ModelElement();
    }
    return result;

  }

  private readRec(node: Node): ModelNode | null {
    let result = null;
    if (isElement(node)) {
      const tag = tagName(node) as HtmlTag;
      if (this.elementConfig.has(tag)) {
        result = this.elementConfig.get(tag)!.read(node);
      } else {
        // TODO: we might want to make this explicit and only support explicitly specified elements
        result = this.elementReader.read(node);
      }

      // this check is a bit iffy, this implies that any reader returning something other than a ModelElement
      // has to take care of the potential subtree of the domNode on its own.
      // this is not that weird, since returning a ModelText does imply no children can be added
      // but its not immediately obvious
      for (const child of node.childNodes) {
        const parsed = this.readRec(child);
        if (ModelNode.isFragment(parsed)) {
          for (const child of parsed.children) {
            result?.addChild(child);
          }

        } else {
          if (parsed) {
            result?.addChild(parsed);
          }

        }
      }

    } else if (isTextNode(node)) {
      result = this.textReader.read(node);
    } else {
      result = this.voidReader.read(node);
    }
    return result;
  }
}
