import ModelText, {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import Fragment from "@lblod/ember-rdfa-editor/model/fragment";
import {NoParentError, OutsideRootError} from "@lblod/ember-rdfa-editor/utils/errors";

export type ModelNodeType = "TEXT" | "ELEMENT" | "FRAGMENT";

export interface NodeConfig {
  debugInfo: any;
}

/**
 * Basic building block of the model. Cannot be instantiated, any node will always have a more specific type
 */
export default abstract class ModelNode {
  abstract modelNodeType: ModelNodeType;

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
    return !!node && node.modelNodeType === "ELEMENT";
  }

  /**
   * Typechecking utility to verify whether the node is {@link ModelText}
   * @param node
   */
  static isModelText(node?: ModelNode | null): node is ModelText {
    return !!node && node.modelNodeType === "TEXT";
  }

  /**
   * Typechecking utility to verify whether the node is {@link Fragment}
   * @param node
   */
  static isFragment(node?: ModelNode | null): node is Fragment {
    return !!node && node.modelNodeType === "FRAGMENT";
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


  get offsetSize(): number {
    return 1;
  }

  getOffset(): number {
    let counter = 0;
    let sibling = this.previousSibling;
    while(sibling) {
      counter += sibling.offsetSize;
      sibling = sibling.previousSibling;
    }
    return counter;
  }

  getOffsetPath(): number[] {
    const result = [];

    let cur: ModelNode | null = this;
    while (cur) {
      result.push(cur.getOffset());
      cur = cur.parent;
    }
    result.reverse();
    return result;
  }

  abstract hasVisibleText(): boolean;

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

  findAncestor(predicate: (node: ModelNode) => boolean, includeSelf: boolean = true): ModelNode | null {
    if (includeSelf) {
      if (predicate(this)) {
        return this;
      }
    }
    let cur = this.parent;
    while (cur && !predicate(cur)) {
      cur = cur.parent;
    }

    if (cur && !predicate(cur)) {
      return null;
    }
    return cur;
  }

  /**
   * Move the node up so that it becomes a sibling of its parent.
   *
   * @param after Whether the node will end up after its parent or before
   * @return the old parent
   */
  promote(after: boolean = false): ModelElement {

    const oldParent = this.parent;
    if (!oldParent) {
      throw new NoParentError();
    }
    if (!oldParent.parent) {
      // if parent is root, this operation is not allowed
      throw new OutsideRootError();
    }
    const grandparent = oldParent.parent;
    const parentIndex = oldParent.index!;

    oldParent.removeChild(this);
    grandparent.addChild(this, after ? parentIndex + 1 : parentIndex);

    return oldParent;
  }

  /**
   * Splits the parent such that this node ends up as an only child. If the node is already
   * an only child, this does nothing.
   * Throws if node has no parent, or if parent is root
   */
  isolate() {
    const parent = this.parent;
    if (!parent) {
      throw new NoParentError();
    }
    if(!parent.parent) {
      throw new OutsideRootError();
    }
    const index = this.index!;
    parent.isolateChildAt(index);
  }

}
