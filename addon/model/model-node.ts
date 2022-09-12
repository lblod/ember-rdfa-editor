import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import {
  ModelError,
  NoParentError,
  OutsideRootError,
} from '@lblod/ember-rdfa-editor/utils/errors';
import XmlWriter from '@lblod/ember-rdfa-editor/model/writers/xml-writer';
import { Walkable } from '@lblod/ember-rdfa-editor/utils/gen-tree-walker';
import { Predicate } from '@lblod/ember-rdfa-editor/utils/predicate-utils';
import { TextAttribute } from '@lblod/ember-rdfa-editor/commands/text-properties/set-text-property-command';
import { ModelInlineComponent } from './inline-components/model-inline-component';

export type ModelNodeType =
  | 'TEXT'
  | 'ELEMENT'
  | 'FRAGMENT'
  | 'INLINE-COMPONENT';

export interface NodeConfig {
  debugInfo: unknown;
  rdfaPrefixes?: Map<string, string>;
}

export type DirtyType = 'content' | 'node' | 'mark';

export interface NodeCompareOpts {
  ignoredAttributes?: Set<string>;
}

/**
 * Basic building block of the model. Cannot be instantiated, any node will always have a more specific type
 */
export default abstract class ModelNode implements Walkable {
  abstract modelNodeType: ModelNodeType;

  private _attributeMap: Map<string, string>;
  private _parent: ModelElement | null = null;
  private _nextSibling: ModelNode | null = null;
  private _previousSibling: ModelNode | null = null;
  private _debugInfo: unknown;

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
    return !!node && node.modelNodeType === 'ELEMENT';
  }

  /**
   * Typechecking utility to verify whether the node is {@link ModelText}
   * @param node
   */
  static isModelText(node?: ModelNode | null): node is ModelText {
    return !!node && node.modelNodeType === 'TEXT';
  }

  /**
   * Typechecking utility to verify whether the node is {@link ModelInlineComponent}
   * @param node
   */
  static isModelInlineComponent(
    node?: ModelNode | null
  ): node is ModelInlineComponent {
    return !!node && node.modelNodeType === 'INLINE-COMPONENT';
  }

  get attributeMap(): Map<string, string> {
    return this._attributeMap;
  }

  set attributeMap(value: Map<string, string>) {
    this._attributeMap = value;
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

  get parent(): ModelElement | null {
    return this._parent;
  }

  set parent(value: ModelElement | null) {
    this._parent = value;
  }

  get root(): ModelElement {
    let root = this.parent;
    if (!root) {
      if (ModelNode.isModelElement(this)) {
        return this;
      } else {
        throw new ModelError('Non-element node cannot be root');
      }
    }
    while (root.parent) {
      root = root.parent;
    }
    return root;
  }

  abstract get length(): number;

  get index(): number | null {
    if (this.parent) {
      return this.parent.getChildIndex(this);
    }

    return null;
  }

  abstract get isBlock(): boolean;

  abstract get isLeaf(): boolean;

  /**
   * Represents how much "space" this node takes up in it's parent
   * Elements take up 1 offset, textnodes take up as many offsets as they
   * have characters
   */
  get offsetSize(): number {
    return 1;
  }

  get connected(): boolean {
    if (this.parent) {
      return this.parent.children.indexOf(this) !== -1;
    } else {
      return true;
    }
  }

  /**
   * Get the offset of the cursorposition right before this node
   * In other words, get the offset at which this node starts in the parent
   */
  getOffset(): number {
    let counter = 0;
    let sibling = this.previousSibling;
    while (sibling) {
      counter += sibling.offsetSize;
      sibling = sibling.previousSibling;
    }
    return counter;
  }

  /**
   * Get the path from root to the start of this node
   */
  getOffsetPath(): number[] {
    const result = [];

    if (this.parent) {
      result.push(this.getOffset());
      let cur = this.parent;
      while (cur.parent) {
        result.push(cur.getOffset());
        cur = cur.parent;
      }
      result.reverse();
    }

    return result;
  }

  abstract hasVisibleText(): boolean;
  /**
   * Debugging utility
   */
  get debugInfo(): unknown {
    return this._debugInfo;
  }

  set debugInfo(value: unknown) {
    this._debugInfo = value;
  }

  abstract clone(): ModelNode;

  getAttribute(key: string): string | undefined {
    return this._attributeMap.get(key);
  }

  setAttribute(key: string, value: string) {
    this._attributeMap.set(key, value);
  }

  /**
   * Removes an attribute on this node.
   * Returns true if a removal took place,
   * false if the key wasn't in the map to start with.
   * @param key
   */
  removeAttribute(key: string): boolean {
    return this._attributeMap.delete(key);
  }

  /**
   * Generic no-op default for setting a text attribute. Should be overridden by subclasses
   * that care about textAttributes. Intentionally a no-op and not an abstract method.
   * @param _key
   * @param _value
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setTextAttribute(_key: TextAttribute, _value: boolean) {
    //no-op function
  }
  *findSelfOrAncestors(
    predicate: Predicate<ModelNode>
  ): Generator<ModelNode, void, void> {
    if (predicate(this)) {
      yield this;
    }
    yield* this.findAncestors(predicate);
  }

  *findAncestors(
    predicate: Predicate<ModelElement>
  ): Generator<ModelElement, void, void> {
    let cur = this.parent;
    while (cur) {
      if (predicate(cur)) {
        yield cur;
      }
      cur = cur.parent;
    }
  }

  /**
   * Move the node up so that it becomes a sibling of its parent.
   *
   * @param after Whether the node will end up after its parent or before
   * @return the old parent
   */
  promote(after = false): ModelElement {
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
  remove() {
    if (!this.parent) {
      throw new ModelError('Cannot remove root');
    }
    this.parent.removeChild(this);
  }

  /**
   * Convert this node and its subtree to their xml representation
   */
  toXml(): Node {
    const writer = new XmlWriter();
    return writer.write(this);
  }

  /**
   * Deep, but not reference equality
   * All properties except boundNode, parent and siblings will be compared, and children will be compared recursively
   * @param other
   * @param ignoredAttributes
   */
  abstract sameAs(other: ModelNode, compareOpts?: NodeCompareOpts): boolean;

  /**
   * True if node can be merged with other
   * This means we are ok with this node being replaced by a shallow clone of either this or other,
   * with the children of this and other appended to the clone.
   * @param other
   */
  abstract isMergeable(other: ModelNode): boolean;

  abstract diff(other: ModelNode): Set<DirtyType>;

  abstract get firstChild(): ModelNode | null;

  abstract get lastChild(): ModelNode | null;

  get parentNode(): ModelElement | null {
    return this.parent;
  }
}
