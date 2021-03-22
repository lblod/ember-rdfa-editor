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
import {HtmlTag} from "@lblod/ember-rdfa-editor/model/util/types";
import HtmlBreakReader from "@lblod/ember-rdfa-editor/model/readers/html-break-reader";


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
  private breakReader: HtmlBreakReader;

  constructor(private model: Model) {
    this.elementReader = new HtmlElementReader(model);
    this.textReader = new HtmlTextReader(model);
    this.wrappedAttributeReader = new WrappedAttributeReader();
    this.voidReader = new HtmlVoidReader();
    this.breakReader = new HtmlBreakReader();
    this.listReader = new HtmlListReader(model, this.elementReader);
    this.elementConfig = new Map<keyof HTMLElementTagNameMap, Reader<HTMLElement, ModelElement>>(
      [
        ["li", this.listReader],
        ["strong", this.wrappedAttributeReader],
        ["em", this.wrappedAttributeReader],
        ["b", this.wrappedAttributeReader],
        ["i", this.wrappedAttributeReader],
        ["u", this.wrappedAttributeReader],
        ["del", this.wrappedAttributeReader],
        ["span", this.wrappedAttributeReader]
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

      for (const child of node.childNodes) {
        if (!["ul", "ol"].includes(result?.type || "") || tagName(child) === "li") {
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
      }

    } else if (isTextNode(node)) {
      result = this.textReader.read(node);
    } else {
      result = this.voidReader.read(node);
    }
    if (result) {
      this.model.bindNode(result, node);
    }
    return result;
  }
}
