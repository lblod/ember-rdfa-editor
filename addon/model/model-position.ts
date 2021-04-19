import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {ModelError, NotImplementedError, PositionError, SelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import {RelativePosition} from "@lblod/ember-rdfa-editor/model/util/types";
import ArrayUtils from "@lblod/ember-rdfa-editor/model/util/array-utils";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import Model from "@lblod/ember-rdfa-editor/model/model";

/**
 * Represents a single position in the model. In contrast to the dom,
 * where a position is defined as a {@link Node} and an offset, we represent a position
 * here as a path of offsets from the root. The definition of these offsets is subject to change.
 */
export default class ModelPosition {
  private _path: number[];
  private _root: ModelElement;
  private parentCache: ModelElement | null = null;


  /**
   * Build a position from a rootNode and a path
   * @param root
   * @param path
   */
  static fromPath(root: ModelElement, path: number[]) {
    const result = new ModelPosition(root);
    result.path = path;
    return result;
  }


  /**
   * Build a position from a root, a parent and an offset. Especially useful for converting
   * from a DOM position
   * @param root
   * @param parent
   * @param offset
   * @deprecated use {@link fromInTextNode} or {@link fromInElement}
   */
  static fromParent(root: ModelElement, parent: ModelNode, offset: number): ModelPosition {
    if (offset < 0 || offset > parent.length) {
      throw new SelectionError("offset out of range");
    }
    const result = new ModelPosition(root);
    result.path = parent.getOffsetPath();
    result.path.push(offset);
    return result;
  }

  static fromAfterNode(node: ModelNode): ModelPosition {
    const basePath = node.getOffsetPath();
    basePath[basePath.length - 1] += node.offsetSize;
    return ModelPosition.fromPath(node.root, basePath);
  }

  static fromBeforeNode(node: ModelNode): ModelPosition {
    return ModelPosition.fromPath(node.root, node.getOffsetPath());
  }

  static fromInTextNode(node: ModelText, offset: number) {
    if (offset < 0 || offset > node.length) {
      throw new PositionError(`Offset ${offset} out of range of textnode with length ${node.length}`);
    }
    const path = node.getOffsetPath();
    path[path.length - 1] += offset;
    return ModelPosition.fromPath(node.root, path);
  }

  static fromInElement(element: ModelElement, offset: number) {
    if(element.type === "br") {
      return ModelPosition.fromBeforeNode(element);
    }
    if (offset < 0 || offset > element.getMaxOffset()) {
      throw new PositionError(`Offset ${offset} out of range of element with maxOffset ${element.getMaxOffset()}`);
    }
    const path = element.getOffsetPath();
    path.push(offset);
    return ModelPosition.fromPath(element.root, path);
  }

  static getCommonPosition(pos1: ModelPosition, pos2: ModelPosition): ModelPosition | null {
    if (pos1.root !== pos2.root) {
      return null;
    }
    const commonPath = ArrayUtils.findCommonSlice(pos1.path, pos2.path);

    return ModelPosition.fromPath(pos1.root, commonPath);
  }

  /**
   * Get a slice of child positions of the commonAncestor between pos1 and pos2
   * @param pos1
   * @param pos2
   * @deprecated use {@link ModelTreeWalker} instead
   */
  static getTopPositionsBetween(pos1: ModelPosition, pos2: ModelPosition): ModelPosition[] | null {
    const commonAncestor = ModelPosition.getCommonPosition(pos1, pos2);
    if (!commonAncestor) {
      return null;
    }
    const cutoff = commonAncestor.path.length;
    const root = commonAncestor.root;

    const commonPath = commonAncestor.path;
    const path1 = pos1.path.slice(0, cutoff + 1);
    const path2 = pos2.path.slice(0, cutoff + 1);

    const results = [];

    for (let i = path1[path1.length - 1]; i <= path2[path2.length - 1]; i++) {
      results.push(ModelPosition.fromPath(root, commonPath.concat([i, 0])));
    }
    return results;

  }

  constructor(root: ModelElement) {
    this._root = root;
    this._path = [];
  }

  /**
   * The path of offsets from this position's root node
   */
  get path(): number[] {
    return this._path;
  }

  set path(value: number[]) {
    this._path = value;
    this.parentCache = null;
  }

  get parent(): ModelElement {
    if (this.parentCache) {
      return this.parentCache;
    }
    if(this.path.length === 0) {
      this.parentCache = this.root;
      return this.root;
    }
    let cur: ModelNode | null = this.root;
    let i = 0;

    while (ModelNode.isModelElement(cur) && i < this.path.length - 1) {
      if (!cur.childAtOffset(this.path[i], true)) {
        cur.childAtOffset(this.path[i], true);
      }
      cur = cur.childAtOffset(this.path[i], true);
      i++;
    }
    if (ModelNode.isModelText(cur)) {
      this.parentCache = cur.parent;
      return cur.parent!;
    }
    if (i > 0 && i !== this.path.length - 1) {
      throw new PositionError("invalid path");
    }
    this.parentCache = cur as ModelElement;
    return cur as ModelElement;
  }

  /**
   * Get the first ancestor which is a ModelElement
   * @deprecated use {@link parent} as this is now identical
   */
  get parentElement(): ModelElement {
    return this.parent;
  }

  /**
   * Root node of the position. In practice, this is almost always the same as the model root,
   * but it does not have to be (e.g. to support multiple model trees).
   */
  get root(): ModelElement {
    return this._root;
  }

  /**
   * Get the offset from the parent, equivalent to a DOM position offset
   */
  get parentOffset(): number {
    return this.path[this.path.length - 1];
  }

  set parentOffset(offset: number) {
    if (offset < 0 || offset > this.parent.getMaxOffset()) {
      throw new PositionError(`Offset ${offset} is out of range of parent with maxOffset ${this.parent.getMaxOffset()}`);
    }
    this.path[this.path.length - 1] = offset;
    this.parentCache = null;
  }

  /**
   * Check if two modelpositions describe the same position
   * @param other
   */
  sameAs(other: ModelPosition): boolean {
    return this.compare(other) === RelativePosition.EQUAL;
  }

  /**
   * Compare this position to another and see if it comes before, after, or is the same position
   * @param other
   */
  compare(other: ModelPosition): RelativePosition {
    if (this.root !== other.root) {
      throw new PositionError("cannot compare nodes with different roots");
    }
    return ModelPosition.comparePath(this.path, other.path);
  }

  getCommonPosition(other: ModelPosition): ModelPosition | null {
    return ModelPosition.getCommonPosition(this, other);
  }

  getCommonAncestor(other: ModelPosition): ModelElement {
    if (this.root !== other.root) {
      throw new PositionError("cannot compare nodes with different roots");
    }
    const commonPath = ArrayUtils.findCommonSlice(this.path, other.path);
    if(commonPath.length === 0) {
      return this.root;
    }
    const temp = ModelPosition.fromPath(this.root, commonPath);
    const rslt = temp.nodeAfter() || temp.nodeBefore();
    if(!rslt) {
      throw new PositionError("Could not find a commonAncestor");
    }
    return rslt as ModelElement;

  }

  /**
   * Compare two paths and determine their order. A parent is considered to be in front of its children
   * @param path1
   * @param path2
   */
  static comparePath(path1: number[], path2: number[]): RelativePosition {

    for (const [i, offset] of path1.entries()) {
      if (i < path2.length) {
        if (offset < path2[i]) {
          return RelativePosition.BEFORE;
        } else if (offset > path2[i]) {
          return RelativePosition.AFTER;
        }
      }
    }
    if (path1.length < path2.length) {
      return RelativePosition.BEFORE;
    } else if (path1.length > path2.length) {
      return RelativePosition.AFTER;
    }
    return RelativePosition.EQUAL;

  }

  /**
   * Split the textnode at the position. If position is not inside a
   * textNode, do nothing.
   * If position is at the end or start of a textnode, do nothing;
   * If splitting of elements is needed, use
   * {@link splitParent}.
   */
  split() {
    const before = this.nodeBefore();
    const after = this.nodeAfter();
    if(ModelNode.isModelText(before)) {
      if(before === after) {
        before.split(this.parentOffset - before.getOffset());
      }
      this.parentCache = null;
    }

  }

  /**
   * Split the parent element at this position
   * TODO implement this
   */
  splitParent() {
    throw new NotImplementedError();
  }

  /**
   * If position is "inside" a textnode, this will return that node.
   * Otherwise, return the node immediately after the cursor
   */
  nodeAfter(): ModelNode | null {
    if (this.path.length === 0) {
      return this.root;
    }
    return this.parent.childAtOffset(this.parentOffset) || null;

  }

  /**
   * If position is "inside" a textnode, this will return that node.
   * Otherwise, return the node immediately before the cursor
   */
  nodeBefore(): ModelNode | null {
    return this.parent.childAtOffset(this.parentOffset - 1) || null;
  }

  clone(): ModelPosition {
    return ModelPosition.fromPath(this.root, [...this.path]);
  }

  findAncestors(predicate: (elem: ModelElement) => boolean = () => true): ModelElement[] {
    let cur = this.parent;
    const rslt = [];

    while (cur !== this.root) {
      if (predicate(cur)) {
        rslt.push(cur);
      }
      cur = cur.parent!;

    }
    if (predicate(cur)) {
      rslt.push(cur);
    }
    return rslt;
  }

}
