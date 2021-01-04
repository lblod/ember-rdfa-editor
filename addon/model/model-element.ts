import ModelNode, {ModelNodeType} from "@lblod/ember-rdfa-editor/model/model-node";
import ModelText, {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";
import {Cloneable} from "@lblod/ember-rdfa-editor/model/util/types";

export type ElementType = keyof HTMLElementTagNameMap;

export default class ModelElement extends ModelNode implements Cloneable<ModelElement>{
  nodeType: ModelNodeType = "ELEMENT";

  private _children: ModelNode[] = [];
  private _type: ElementType;

  constructor(type: ElementType = "span") {
    super();
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
    if (position === undefined) {
      this._children.push(child);
    } else {
      this._children.splice(position, 0, child);
    }
    child.parent = this;
  }
  appendChildren(...children: ModelNode[]) {
    for(const child of children) {
      this.addChild(child);
    }
  }


  setTextAttribute(key: TextAttribute, value: boolean) {
    for(const child of this.children) {
      if (child instanceof ModelText || child instanceof ModelElement) {
        child.setTextAttribute(key, value);
      }
    }
  }
}
