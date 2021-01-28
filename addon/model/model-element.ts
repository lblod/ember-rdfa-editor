import ModelNode, {ModelNodeType, NodeConfig} from "@lblod/ember-rdfa-editor/model/model-node";
import ModelText, {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";
import {Cloneable} from "@lblod/ember-rdfa-editor/model/util/types";
import {nonBlockNodes} from "@lblod/ember-rdfa-editor/model/util/constants";
import {ModelError} from "@lblod/ember-rdfa-editor/utils/errors";

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

  get length() {
    return this._children.length;
  }

  get firstChild() {
    return this._children[0];
  }

  get lastChild() {
    return this._children[this._children.length - 1];
  }

  get isBlock() {
    return !nonBlockNodes.has(this.type);
  }

  clone(): ModelElement {
    const result = new ModelElement(this.type);
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

    if (prev) {
      prev.nextSibling = child;
    }
    if (next) {
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
    if(child.previousSibling) {

      child.previousSibling.nextSibling = child.nextSibling;
    }
    if(child.nextSibling) {
      child.nextSibling.previousSibling = child.previousSibling;
    }

    this.children[index + 1].previousSibling = this.children[index - 1] || null;
    this.children.splice(index, 1);
  }

  getChildIndex(child: ModelNode): number | null {
    return this.children.indexOf(child);
  }


  setTextAttribute(key: TextAttribute, value: boolean) {
    for (const child of this.children) {
      if (child instanceof ModelText || child instanceof ModelElement) {
        child.setTextAttribute(key, value);
      }
    }
  }

  split(index: number): { left: ModelElement, right: ModelElement } {
    if(index < 0) {
      index = 0;
    }
    const leftChildren = this.children.slice(0, index);
    if (leftChildren.length) {
      leftChildren[leftChildren.length - 1].nextSibling = null;
    }
    const rightChildren = this.children.slice(index);
    if (rightChildren.length) {
      rightChildren[0].previousSibling = null;
    }

    this.children = leftChildren;
    const right = this.clone();
    right.children = [];
    right.appendChildren(...rightChildren);
    this.parent?.addChild(right, this.index! + 1);

    return {left: this, right};
  }

  /**
   * replace an element by its children
   * If withBreaks is true, insert a break after every child
   * @param withBreaks
   */
  unwrap(withBreaks: boolean = false) {
    const parent = this.parent;
    if(!parent) {
      throw new ModelError("Can't unwrap root node");
    }
    let insertIndex = this.index! + 1;


    for (const child of this.children) {
      this.parent?.addChild(child, insertIndex);
      insertIndex++;
      if(withBreaks){
        this.parent?.addChild(new ModelElement("br"), insertIndex);
        insertIndex++;
      }
    }
    this.parent?.removeChild(this);

  }
}
