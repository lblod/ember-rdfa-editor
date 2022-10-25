import ModelNode, {
  DirtyType,
  ModelNodeType,
  NodeCompareOpts,
  NodeConfig,
} from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import ModelText from '@lblod/ember-rdfa-editor/core/model/nodes/model-text';
import {
  LEAF_NODES,
  LUMP_NODE_PROPERTY,
  NON_BLOCK_NODES,
} from '@lblod/ember-rdfa-editor/utils/constants';
import {
  IndexOutOfRangeError,
  ModelError,
  OffsetOutOfRangeError,
} from '@lblod/ember-rdfa-editor/utils/errors';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/utils/model-node-utils';
import { parsePrefixString } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import RdfaAttributes from '@lblod/marawa/rdfa-attributes';
import { TextAttribute } from '@lblod/ember-rdfa-editor/commands/text-properties/set-text-property-command';

export type ElementType = keyof HTMLElementTagNameMap;

export default class ModelElement extends ModelNode {
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
    //TODO: Check correctness
    return this._children.length
      ? this._children[this._children.length - 1]
      : null;
  }

  get isBlock() {
    return !NON_BLOCK_NODES.has(this.type);
  }

  get isLeaf() {
    //TODO: Check correctness
    const properties = this.getRdfaAttributes().properties;
    return (
      LEAF_NODES.has(this.type) ||
      (properties && properties.includes(LUMP_NODE_PROPERTY))
    );
  }

  /**
   * Get the largest valid offset inside this element.
   * You can think of it as the cursor position right before the
   * "<" of the closing tag in html
   */
  getMaxOffset() {
    let sum = 0;
    this.children.forEach((node) => (sum += node.offsetSize));
    return sum;
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
    const config = {
      debugInfo: '',
      rdfaPrefixes: new Map<string, string>(this._currentRdfaPrefixes),
    };
    const result = new ModelElement(this.type, config);
    result.attributeMap = new Map<string, string>(this.attributeMap);
    result.modelNodeType = this.modelNodeType;
    return result;
  }

  addChild(child: ModelNode, position?: number) {
    if (position === undefined) {
      this._children.push(child);
    } else {
      this._children.splice(position, 0, child);
    }

    if (ModelNode.isModelElement(child)) {
      child.updateRdfaPrefixes(this.getRdfaPrefixes());
    }
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

  /**
   * Split this element, returning both sides of the split.
   * Mostly for internal use, prefer using {@link ModelPosition.splitParent}
   * where possible
   * @param index
   */
  split(
    root: ModelElement,
    index: number
  ): { left: ModelElement; right: ModelElement } {
    if (index < 0) {
      index = 0;
    }
    const leftChildren = this.children.slice(0, index);
    const rightChildren = this.children.slice(index);
    this.children = leftChildren;
    const right = this.clone();
    right.children = [];
    right.appendChildren(...rightChildren);
    this.getParent(root)?.addChild(right, this.getIndex(root)! + 1);

    return { left: this, right };
  }

  /**
   * replace an element by its children
   * If withBreaks is true, insert a break after every child
   * @param withBreaks
   */
  unwrap(root: ModelElement, withBreaks = false) {
    const parent = this.getParent(root);
    if (!parent) {
      throw new ModelError("Can't unwrap root node");
    }

    let insertIndex = this.getIndex(root)! + 1;
    for (const child of [...this.children]) {
      parent?.addChild(child, insertIndex);
      insertIndex++;
      if (withBreaks) {
        parent?.addChild(new ModelElement('br'), insertIndex);
        insertIndex++;
      }
    }
    parent?.removeChild(this);
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
  isolateChildAt(
    root: ModelElement,
    index: number
  ): {
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
      const { left, right } = this.split(root, index + 1);
      return { left: null, middle: left, right };
    }

    if (index === this.length - 1) {
      const { left, right } = this.split(root, index);
      return { left, middle: right, right: null };
    }

    const firstSplit = this.split(root, index + 1);
    const secondSplit = firstSplit.left.split(root, index);

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
   *
   * This behavior is to facilitate converting domOffsets (which are a bit like
   * weird indices)
   *
   * @param index
   */
  indexToOffset(index: number): number {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += this.children[i].offsetSize;
    }
    return offset;
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
    // TODO: calculating rdfa prefixes and attributes for specific nodes should be improved in the future.
    const myPrefixString = this.getAttribute('prefix');
    if (myPrefixString) {
      const myPrefixes = parsePrefixString(myPrefixString);
      this._currentRdfaPrefixes = new Map([...prefixes, ...myPrefixes]);
    } else {
      this._currentRdfaPrefixes = prefixes;
    }
    this.children.forEach((child) => {
      if (ModelNode.isModelElement(child)) {
        child.updateRdfaPrefixes(this.getRdfaPrefixes());
      }
    });
  }

  setAttribute(key: string, value: string) {
    super.setAttribute(key, value);
    if (key === 'prefix') {
      this.updateRdfaPrefixes();
    }
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
    if (compareOpts) {
      if (compareOpts.ignoredAttributes) {
        ignoredAttributes = compareOpts.ignoredAttributes;
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

  diff(other: ModelNode): Set<DirtyType> {
    const dirtiness: Set<DirtyType> = new Set();
    if (!ModelElement.isModelElement(other)) {
      dirtiness.add('node');
      dirtiness.add('content');
    } else {
      if (
        this.type !== other.type ||
        !ModelNodeUtils.areAttributeMapsSame(
          this.attributeMap,
          other.attributeMap
        )
      ) {
        dirtiness.add('node');
      }
      if (this.length !== other.length) {
        dirtiness.add('content');
      } else {
        for (let i = 0; i < this.length; i++) {
          const child1 = this.children[i];
          const child2 = other.children[i];
          if (ModelNode.isModelText(child1) || ModelNode.isModelText(child2)) {
            const diff = child1.diff(child2);
            if (diff.has('mark') || diff.has('node')) {
              dirtiness.add('content');
              break;
            }
          }
        }
      }
    }

    return dirtiness;
  }
}
