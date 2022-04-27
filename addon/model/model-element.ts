import ModelNode, {
  ModelNodeType,
  NodeCompareOpts,
  NodeConfig,
} from '@lblod/ember-rdfa-editor/model/model-node';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import { Cloneable } from '@lblod/ember-rdfa-editor/model/util/types';
import {LEAF_NODES, NON_BLOCK_NODES} from '@lblod/ember-rdfa-editor/model/util/constants';
import {
  IndexOutOfRangeError,
  ModelError,
  OffsetOutOfRangeError,
} from '@lblod/ember-rdfa-editor/utils/errors';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/model/util/model-node-utils';
import { parsePrefixString } from '@lblod/ember-rdfa-editor/model/util/rdfa-utils';
import RdfaAttributes from '@lblod/marawa/rdfa-attributes';
import { TextAttribute } from '@lblod/ember-rdfa-editor/commands/text-properties/set-text-property-command';
import SetUtils from '@lblod/ember-rdfa-editor/model/util/set-utils';

export type ElementType = keyof HTMLElementTagNameMap;

export default class ModelElement
  extends ModelNode
  implements Cloneable<ModelElement>
{
  modelNodeType: ModelNodeType = 'ELEMENT';

  private _children: ModelNode[] = [];
  private _type: ElementType;
  private _currentRdfaPrefixes: Map<string, string>;

  constructor(type: ElementType = 'span', config?: NodeConfig) {
    super(config);
    this._type = type;
    this._currentRdfaPrefixes =
      config?.rdfaPrefixes || new Map<string, string>();
  }

  get type(): ElementType {
    return this._type;
  }

  set type(value: ElementType) {
    this._type = value;
    this.addDirty('node');
  }

  set className(value: string) {
    this.setAttribute('class', value);
  }

  get className() {
    const className = this.getAttribute('class');
    if (className) {
      return className;
    } else {
      return '';
    }
  }

  get children(): ModelNode[] {
    return this._children;
  }

  set children(value: ModelNode[]) {
    this._children = value;
    this.addDirty('content');
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
    return !NON_BLOCK_NODES.has(this.type);
  }
  get isLeaf() {
    return LEAF_NODES.has(this.type);
  }

  /**
   * Get the largest valid offset inside this element.
   * You can think of it as the cursor position right before the
   * "<" of the closing tag in html
   */
  getMaxOffset() {
    if (!this.lastChild) {
      return 0;
    }
    return this.lastChild.getOffset() + this.lastChild.offsetSize;
  }

  clone(): ModelElement {
    const config = {
      debugInfo: '',
      rdfaPrefixes: new Map<string, string>(this._currentRdfaPrefixes),
    };
    const result = new ModelElement(this.type, config);

    result.attributeMap = new Map<string, string>(this.attributeMap);
    result.modelNodeType = this.modelNodeType;

    const clonedChildren = this.children.map((c) => c.clone());
    result.appendChildren(...clonedChildren);

    return result;
  }

  shallowClone(): ModelElement {
    const result = new ModelElement(this.type);
    result.attributeMap = new Map<string, string>(this.attributeMap);
    result.modelNodeType = this.modelNodeType;
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

    if (ModelNode.isModelElement(child)) {
      child.updateRdfaPrefixes(this.getRdfaPrefixes());
    }

    child.parent = this;
    this.addDirty('content');
  }

  insertChildAtOffset(child: ModelNode, offset: number) {
    if (offset < 0 || offset > this.getMaxOffset()) {
      throw new OffsetOutOfRangeError(offset, this.getMaxOffset());
    }
    this.addChild(child, this.offsetToIndex(offset));
  }

  insertChildrenAtOffset(offset: number, ...children: ModelNode[]) {
    let myOffset = offset;
    for (const child of children) {
      this.insertChildAtOffset(child, myOffset);
      myOffset += child.offsetSize;
    }
  }

  insertChildrenAtIndex(index: number, ...children: ModelNode[]) {
    let myIndex = index;
    for (const child of children) {
      this.addChild(child, myIndex);
      myIndex++;
    }
  }

  appendChildren(...children: ModelNode[]) {
    for (const child of children) {
      this.addChild(child);
    }
  }

  removeChild(child: ModelNode) {
    const index = this.children.indexOf(child);
    if (index === -1) {
      return;
    }
    if (child.previousSibling) {
      child.previousSibling.nextSibling = child.nextSibling;
    }
    if (child.nextSibling) {
      child.nextSibling.previousSibling = child.previousSibling;
    }

    if (this.length > index + 1) {
      this.children[index + 1].previousSibling =
        this.children[index - 1] || null;
    }
    this.children.splice(index, 1);
    this.addDirty('content');
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

  /**
   * Split this element, returning both sides of the split.
   * Mostly for internal use, prefer using {@link ModelPosition.splitParent}
   * where possible
   * @param index
   */
  split(index: number): { left: ModelElement; right: ModelElement } {
    if (index < 0) {
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
    this.addDirty('content');
    const right = this.clone();
    right.children = [];
    right.appendChildren(...rightChildren);
    this.parent?.addChild(right, this.index! + 1);

    return { left: this, right };
  }

  /**
   * replace an element by its children
   * If withBreaks is true, insert a break after every child
   * @param withBreaks
   */
  unwrap(withBreaks = false) {
    const parent = this.parent;
    if (!parent) {
      throw new ModelError("Can't unwrap root node");
    }

    let insertIndex = this.index! + 1;
    for (const child of this.children) {
      this.parent?.addChild(child, insertIndex);
      insertIndex++;
      if (withBreaks) {
        this.parent?.addChild(new ModelElement('br'), insertIndex);
        insertIndex++;
      }
    }
    this.parent?.removeChild(this);
  }

  hasVisibleText(): boolean {
    if (this.type === 'br') {
      return true;
    }
    for (const child of this.children) {
      if (child.hasVisibleText()) {
        return true;
      }
    }
    return false;
  }

  /**
   * Split this node such that child at index is an only child. Return all sides of the split. The specified
   * child will always be the only child of the middle part.
   * If child at index is already an only child, this does nothing and returns this element as the middle part.
   * Throws an exception if index is out of range.
   * @param index
   */
  isolateChildAt(index: number): {
    left: ModelElement | null;
    middle: ModelElement;
    right: ModelElement | null;
  } {
    if (index < 0 || index >= this.length) {
      throw new IndexOutOfRangeError();
    }

    if (this.length === 1) {
      return { left: null, middle: this, right: null };
    }

    if (index === 0) {
      const { left, right } = this.split(index + 1);
      return { left: null, middle: left, right };
    }

    if (index === this.length - 1) {
      const { left, right } = this.split(index);
      return { left, middle: right, right: null };
    }

    const firstSplit = this.split(index + 1);
    const secondSplit = firstSplit.left.split(index);

    return {
      left: secondSplit.left,
      middle: secondSplit.right,
      right: firstSplit.right,
    };
  }

  /**
   * Convert an offset to the index of the child that either contains
   * that offset (when the offset points to a position inside a textnode)
   * or right after that offset
   * @param offset
   */
  offsetToIndex(offset: number): number {
    if (offset < 0 || offset > this.getMaxOffset()) {
      throw new OffsetOutOfRangeError(offset, this.getMaxOffset());
    }

    let offsetCounter = 0;
    let indexCounter = 0;
    for (const child of this.children) {
      offsetCounter += child.offsetSize;
      if (offsetCounter > offset) {
        return indexCounter;
      }
      indexCounter++;
    }
    return indexCounter;
  }

  /**
   * Convert an index to the startoffset of the child at that index
   * If index is one more than the index of the last child, return the
   * {@link getMaxOffset maxOffset}
   *
   * This behavior is to facilitate converting domOffsets (which are a bit like
   * weird indices)
   *
   * @param index
   */
  indexToOffset(index: number): number {
    if (index === this.length) {
      return this.getMaxOffset();
    }
    return this.children[index].getOffset();
  }

  /**
   * Return the child containing, or immediately after, the offset
   * @param offset
   * @param includeLast whether we should return the last node when given an offset after the last node
   */
  childAtOffset(offset: number, includeLast = false): ModelNode | null {
    if (includeLast && offset === this.getMaxOffset()) {
      return this.lastChild;
    }

    try {
      return this.children[this.offsetToIndex(offset)] || null;
    } catch (e) {
      if (e instanceof OffsetOutOfRangeError) {
        return null;
      } else {
        throw e;
      }
    }
  }

  getVocab(): string | null {
    return this.getRdfaPrefixes().get('') ?? null;
  }

  getRdfaPrefixes(): Map<string, string> {
    // NOTE: We map vocab to an empty string prefix, because this is convenient for passing to children.
    //       It's also conveniently how marawa uses it in the RdfaAttributes class.
    const vocab = this.getAttribute('vocab');
    if (vocab) {
      return new Map([...this._currentRdfaPrefixes, ['', vocab]]);
    } else {
      return new Map([...this._currentRdfaPrefixes]);
    }
  }

  getAttributesRecord(): Record<string, string> {
    const record: Record<string, string> = {};
    for (const [key, value] of this.attributeMap.entries()) {
      const rdfaAttribute = (
        this.getRdfaAttributes() as unknown as Record<string, string | string[]>
      )[key];
      if (rdfaAttribute) {
        if (rdfaAttribute instanceof Array) {
          record[key] = rdfaAttribute.join(' ');
        } else {
          record[key] = rdfaAttribute;
        }
      } else {
        record[key] = value;
      }
    }
    return record;
  }

  updateRdfaPrefixes(
    prefixes: Map<string, string> = this._currentRdfaPrefixes
  ) {
    const myPrefixString = this.getAttribute('prefix');
    if (myPrefixString) {
      const myPrefixes = parsePrefixString(myPrefixString);
      this._currentRdfaPrefixes = new Map([...prefixes, ...myPrefixes]);
    } else {
      this._currentRdfaPrefixes = prefixes;
    }
  }

  setAttribute(key: string, value: string) {
    super.setAttribute(key, value);
    if (key === 'prefix') {
      this.updateRdfaPrefixes();
    }
    this.addDirty('node');
  }

  /**
   * Returns a parsed representation of the rdfa attributes.
   * Prefixes are expanded and multi value attributes are split on space and returned as an array.
   */
  getRdfaAttributes(): RdfaAttributes {
    return new RdfaAttributes(this, Object.fromEntries(this.getRdfaPrefixes()));
  }

  sameAs(other: ModelNode, compareOpts?: NodeCompareOpts): boolean {
    if (!ModelNode.isModelElement(other)) {
      return false;
    }

    if (this.type !== other.type) {
      return false;
    }

    if (this.length !== other.length) {
      return false;
    }

    let ignoredAttributes = ModelNodeUtils.DEFAULT_IGNORED_ATTRS;
    let ignoreDirtyness: boolean | undefined = true;
    if (compareOpts) {
      if (compareOpts.ignoredAttributes) {
        ignoredAttributes = compareOpts.ignoredAttributes;
      }
      ignoreDirtyness = compareOpts.ignoreDirtiness;
    }
    if (!ignoreDirtyness) {
      if (!SetUtils.areSetsSame(this.dirtiness, other.dirtiness)) {
        return false;
      }
    }

    if (
      !ModelNodeUtils.areAttributeMapsSame(
        this.attributeMap,
        other.attributeMap,
        ignoredAttributes
      )
    ) {
      return false;
    }

    for (let i = 0; i < this.length; i++) {
      if (!other.children[i].sameAs(this.children[i], compareOpts)) {
        return false;
      }
    }

    return true;
  }

  isMergeable(other: ModelNode): boolean {
    if (!ModelNode.isModelElement(other)) {
      return false;
    }
    if (other.type !== this.type) {
      return false;
    }
    return ModelNodeUtils.areAttributeMapsSame(
      this.attributeMap,
      other.attributeMap
    );
  }
}
