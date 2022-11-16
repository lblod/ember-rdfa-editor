import ModelText from '@lblod/ember-rdfa-editor/core/model/nodes/model-text';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import {
  AssertionError,
  ModelError,
  NoParentError,
  NotImplementedError,
  OutsideRootError,
} from '@lblod/ember-rdfa-editor/utils/errors';
import XmlWriter, {
  XmlWriterConfig,
} from '@lblod/ember-rdfa-editor/core/model/writers/xml-writer';
import { Predicate } from '@lblod/ember-rdfa-editor/utils/predicate-utils';
import { TextAttribute } from '@lblod/ember-rdfa-editor/commands/text-properties/set-text-property-command';
import { ModelInlineComponent } from '../inline-components/model-inline-component';
import unwrap from '@lblod/ember-rdfa-editor/utils/unwrap';
import { Walkable } from '@lblod/ember-rdfa-editor/utils/gen-tree-walker';

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
  private _debugInfo: unknown;
  private parentCache: WeakMap<ModelNode, ModelElement> = new WeakMap();

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

  static assertModelElement(
    node?: ModelNode | null
  ): asserts node is ModelElement {
    if (!ModelNode.isModelElement(node)) {
      throw new AssertionError();
    }
  }

  /**
   * Typechecking utility to verify whether the node is {@link ModelText}
   * @param node
   */
  static isModelText(node?: ModelNode | null): node is ModelText {
    return !!node && node.modelNodeType === 'TEXT';
  }

  static assertModelText(node?: ModelNode | null): asserts node is ModelText {
    if (!ModelNode.isModelText(node)) {
      throw new AssertionError();
    }
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

  static assertModelInlineComponent(
    node?: ModelNode | null
  ): asserts node is ModelInlineComponent {
    if (!ModelNode.isModelInlineComponent(node)) {
      throw new AssertionError();
    }
  }

  get attributeMap(): Map<string, string> {
    return this._attributeMap;
  }

  set attributeMap(value: Map<string, string>) {
    this._attributeMap = value;
  }

  setParentCache(root: ModelElement, parent: ModelElement) {
    this.parentCache.set(root, parent);
  }

  invalidateParentCache(root: ModelElement){
    this.parentCache.delete(root);
  }

  getParent(root: ModelElement): ModelElement | null {
    const parent = this.parentCache.get(root);
    if (parent) {
      return parent;
    }
    const stack: ModelElement[] = [root];
    while (stack.length > 0) {
      const node = unwrap(stack.shift());
      for (const child of node.children) {
        child.setParentCache(root, node);
        if (child === this) {
          return node;
        }
        if (
          ModelNode.isModelElement(child) ||
          ModelNode.isModelInlineComponent(child)
        )
          stack.push(child);
      }
    }
    return null;
  }

  getNextSibling(root: ModelElement): ModelNode | null {
    const parent = this.getParent(root);
    if (parent) {
      const childIndex = unwrap(parent.getChildIndex(this));
      if (childIndex + 1 < parent.childCount)
        return parent.children[childIndex + 1];
    }
    return null;
  }

  getPreviousSibling(root: ModelElement): ModelNode | null {
    const parent = this.getParent(root);
    if (parent) {
      const childIndex = unwrap(parent.getChildIndex(this));
      if (childIndex - 1 >= 0) return parent.children[childIndex - 1];
    }
    return null;
  }

  getLastChild(): Walkable | null {
    return this.lastChild;
  }

  getFirstChild(): Walkable | null {
    return this.firstChild;
  }

  abstract get length(): number;

  getIndex(root: ModelElement): number | null {
    if (this.getParent(root)) {
      return this.getParent(root)?.getChildIndex(this) ?? null;
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

  get size(): number {
    if (ModelNode.isModelText(this)) {
      return this.content.length;
    } else if (this.isLeaf) {
      return 1;
    } else if (ModelNode.isModelInlineComponent(this)) {
      return 1;
    } else if (ModelNode.isModelElement(this)) {
      return this.children.reduce((prev, node) => prev + node.size, 0) + 2;
    } else {
      throw new NotImplementedError();
    }
  }

  isConnected(root: ModelElement): boolean {
    if ((this as ModelNode) === root) {
      return true;
    }
    return !!this.getParent(root);
  }

  /**
   * Get the offset of the cursorposition right before this node
   * In other words, get the offset at which this node starts in the parent
   */
  getOffset(root: ModelElement): number {
    let counter = 0;
    let sibling = this.getPreviousSibling(root);
    while (sibling) {
      counter += sibling.offsetSize;
      sibling = sibling.getPreviousSibling(root);
    }
    return counter;
  }

  /**
   * Get the path from root to the start of this node
   */
  getOffsetPath(root: ModelElement): number[] {
    const result = [];
    const parent = this.getParent(root);

    if (this.getParent(root)) {
      result.push(this.getOffset(root));
      let cur = parent;
      while (cur?.getParent(root)) {
        result.push(cur.getOffset(root));
        cur = cur?.getParent(root);
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
    root: ModelElement,
    predicate: Predicate<ModelNode>
  ): Generator<ModelNode, void, void> {
    if (predicate(this)) {
      yield this;
    }
    yield* this.findAncestors(root, predicate);
  }

  *findAncestors(
    root: ModelElement,
    predicate: Predicate<ModelElement>
  ): Generator<ModelElement, void, void> {
    let cur = this.getParent(root);
    while (cur) {
      if (predicate(cur)) {
        yield cur;
      }
      cur = cur.getParent(root);
    }
  }

  /**
   * Move the node up so that it becomes a sibling of its parent.
   *
   * @param after Whether the node will end up after its parent or before
   * @return the old parent
   */
  promote(root: ModelElement, after = false): ModelElement {
    const oldParent = this.getParent(root);
    if (!oldParent) {
      throw new NoParentError();
    }
    const grandparent = oldParent.getParent(root);
    if (!grandparent) {
      // if parent is root, this operation is not allowed
      throw new OutsideRootError();
    }
    const parentIndex = oldParent.getIndex(root)!;

    oldParent.removeChild(this);
    grandparent.addChild(this, after ? parentIndex + 1 : parentIndex);

    return oldParent;
  }

  remove(root: ModelElement) {
    if ((this as ModelNode) === root) {
      throw new ModelError('Cannot remove root');
    }
    const parent = this.getParent(root);
    if (!parent) {
      throw new NoParentError();
    }
    parent.removeChild(this);
  }

  /**
   * Convert this node and its subtree to their xml representation
   */
  toXml(config?: XmlWriterConfig): Node {
    const writer = new XmlWriter(config);
    return writer.write(this);
  }

  toXmlClean() {
    return this.toXml({
      showTextNodeLength: false,
      showPositions: false,
      showMarks: false,
    });
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
}
