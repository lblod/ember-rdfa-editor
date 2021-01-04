import ModelText, {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import Fragment from "@lblod/ember-rdfa-editor/model/fragment";

export type ModelNodeType = "TEXT" | "ELEMENT" | "FRAGMENT";

export default abstract class ModelNode {
  abstract nodeType: ModelNodeType;

  private _attributeMap: Map<string, string>;
  private _parent: ModelElement | null = null;
  private _boundNode: Node | null = null;


  protected constructor() {
    this._attributeMap = new Map<string, string>();
  }

  static isModelElement(node?: ModelNode | null): node is ModelElement {
    return !!node && node.nodeType === "ELEMENT";
  }

  static isModelText(node?: ModelNode | null): node is ModelText {
    return !!node && node.nodeType === "TEXT";
  }

  static isFragment(node?: ModelNode | null): node is Fragment {
    return !!node && node.nodeType === "FRAGMENT";
  }

  get attributeMap(): Map<string, string> {
    return this._attributeMap;
  }

  set attributeMap(value: Map<string, string>) {
    this._attributeMap = value;
  }

  get parent(): ModelElement | null {
    return this._parent;
  }

  set parent(value: ModelElement | null) {
    this._parent = value;
  }

  get boundNode(): Node | null {
    return this._boundNode;
  }

  set boundNode(value: Node | null) {
    this._boundNode = value;
  }

  abstract clone(): any;

  getAttribute(key: string) {
    return this._attributeMap.get(key);
  }

  setAttribute(key: string, value: string) {
    this._attributeMap.set(key, value);
  }

  setTextAttribute(_key: TextAttribute, _value: boolean) {
  }


}
