import ModelText, {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import Fragment from "@lblod/ember-rdfa-editor/model/fragment";

export type ModelNodeType = "TEXT" | "ELEMENT" | "FRAGMENT";

export interface NodeConfig {
  debugInfo: any;
}

/**
 * Basic building block of the model. Cannot be instantiated, any node will always have a more specific type
 */
export default abstract class ModelNode {
  abstract nodeType: ModelNodeType;

  private _attributeMap: Map<string, string>;
  private _parent: ModelElement | null = null;
  private _boundNode: Node | null = null;
  private _nextSibling: ModelNode | null = null;
  private _previousSibling: ModelNode | null = null;
  private _debugInfo: any;


  protected constructor(config?: NodeConfig) {
    this._attributeMap = new Map<string, string>();
    if (config) {
      this._debugInfo = config.debugInfo;
    }
  }

  /**
   * Typechecking utility to verify whether the node is {@link ModelElement}
   * @param node
   */
  static isModelElement(node?: ModelNode | null): node is ModelElement {
    return !!node && node.nodeType === "ELEMENT";
  }

  /**
   * Typechecking utility to verify whether the node is {@link ModelText}
   * @param node
   */
  static isModelText(node?: ModelNode | null): node is ModelText {
    return !!node && node.nodeType === "TEXT";
  }

  /**
   * Typechecking utility to verify whether the node is {@link Fragment}
   * @param node
   */
  static isFragment(node?: ModelNode | null): node is Fragment {
    return !!node && node.nodeType === "FRAGMENT";
  }

  get attributeMap(): Map<string, string> {
    return this._attributeMap;
  }

  get previousSibling(): ModelNode | null {
    return this._previousSibling;
  }

  set previousSibling(value: ModelNode | null) {
    this._previousSibling = value;
  }

  get nextSibling(): ModelNode | null {
    return this._nextSibling;
  }

  set nextSibling(value: ModelNode | null) {
    this._nextSibling = value;
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

  abstract get length(): number;

  get index(): number | null {
    if (this.parent) {
      return this.parent.getChildIndex(this);
    }
    return null;
  }

  abstract get isBlock(): boolean;

  getIndexPath(): number[] {
    const result = [];

    let child: ModelNode = this;
    let parent = this.parent;
    while (parent) {
      const index = parent.getChildIndex(child);
      if (index === null) {
        break;
      }
      result.unshift(index);
      child = parent;
      parent = parent.parent;
    }

    return result;

  }

  /**
   * Debugging utility
   */
  get debugInfo(): any {
    return this._debugInfo;
  }

  set debugInfo(value: any) {
    this._debugInfo = value;
  }

  abstract clone(): any;

  getAttribute(key: string) {
    return this._attributeMap.get(key);
  }

  setAttribute(key: string, value: string) {
    this._attributeMap.set(key, value);
  }

  /**
   * Generic no-op default for setting a text attribute. Should be overridden by subclasses
   * that care about textAttributes. Intentionally a no-op and not an abstract method.
   * @param _key
   * @param _value
   */
  setTextAttribute(_key: TextAttribute, _value: boolean) {
  }

}
