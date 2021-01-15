import ModelNode, {ModelNodeType, NodeConfig} from "@lblod/ember-rdfa-editor/model/model-node";
import ModelText, {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";
import {Cloneable} from "@lblod/ember-rdfa-editor/model/util/types";

export type ElementType = keyof HTMLElementTagNameMap;

export default class ModelElement extends ModelNode implements Cloneable<ModelElement> {
  nodeType: ModelNodeType = "ELEMENT";

  private _children: ModelNode[] = [];
  private _type: ElementType;

  constructor(type: ElementType = "span", config?: NodeConfig) {
    super(config);
    this._type = type;
  }

  get type(): ElementType {
    return this._type;
  }

  set type(value: ElementType) {
    this._type = value;
  }

  get children(): ModelNode[] {
    return this._children;
  }

  set children(value: ModelNode[]) {
    this._children = value;
  }

  get childCount() {
    return this._children.length;
  }

  get firstChild() {
    return this._children[0];
  }

  get lastChild() {
    return this._children[this._children.length - 1];
  }

  clone(): ModelElement {
    const result = new ModelElement();
    result.attributeMap = new Map<string, string>(this.attributeMap);
    result.nodeType = this.nodeType;
    const clonedChildren = this.children.map(c => c.clone());
    result.appendChildren(...clonedChildren);
    return result;
  }

  addChild(child: ModelNode, position?: number) {
    let prev;
    let next = null;
    if (position === undefined) {
      prev = this.children[this.childCount - 1];
      this._children.push(child);
    } else {

      next = this.children[position];
      prev = this.children[position - 1];

      this._children.splice(position, 0, child);
    }

    if(prev) {
      prev.nextSibling = child;
    }
    if(next) {
      next.previousSibling = child;
    }
    child.previousSibling = prev;
    child.nextSibling = next;

    child.parent = this;
  }

  appendChildren(...children: ModelNode[]) {
    for (const child of children) {
      this.addChild(child);
    }
  }

  removeChild(child: ModelNode) {
    const index = this.children.indexOf(child);
    this.children.splice(index,1);
  }


  setTextAttribute(key: TextAttribute, value: boolean) {
    for (const child of this.children) {
      if (child instanceof ModelText || child instanceof ModelElement) {
        child.setTextAttribute(key, value);
      }
    }
  }
}
