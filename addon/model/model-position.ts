import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {ModelError, NotImplementedError, PositionError} from "@lblod/ember-rdfa-editor/utils/errors";
import {RelativePosition} from "@lblod/ember-rdfa-editor/model/util/types";
import ArrayUtils from "@lblod/ember-rdfa-editor/model/util/array-utils";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";

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
    if (element.type === "br") {
      return ModelPosition.fromBeforeNode(element);
    }
    if (offset < 0 || offset > element.getMaxOffset()) {
      throw new PositionError(`Offset ${offset} out of range of element with maxOffset ${element.getMaxOffset()}`);
    }
    const path = element.getOffsetPath();
    path.push(offset);
    return ModelPosition.fromPath(element.root, path);
  }

  static fromInNode(node: ModelNode, offset: number) {
    if (ModelNode.isModelText(node)) {
      return ModelPosition.fromInTextNode(node, offset);
    } else if (ModelNode.isModelElement(node)) {
      return ModelPosition.fromInElement(node, offset);
    } else {
      throw new NotImplementedError("Unsupported node type");
    }
  }

  static getCommonPosition(pos1: ModelPosition, pos2: ModelPosition): ModelPosition | null {
    if (pos1.root !== pos2.root) {
      return null;
    }
    const commonPath = ArrayUtils.findCommonSlice(pos1.path, pos2.path);

    return ModelPosition.fromPath(pos1.root, commonPath);
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
    if (this.path.length === 0) {
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

  isBetween(start: ModelPosition, end: ModelPosition, inclusive = false): boolean {
    let startRslt = this.compare(start);
    let endRslt = this.compare(end);

    if (inclusive) {
      if (startRslt === RelativePosition.EQUAL) {
        startRslt = RelativePosition.AFTER;
      }
      if (endRslt === RelativePosition.EQUAL) {
        endRslt = RelativePosition.BEFORE;
      }
    }
    return startRslt === RelativePosition.AFTER && endRslt === RelativePosition.BEFORE;
  }

  getCommonPosition(other: ModelPosition): ModelPosition | null {
    return ModelPosition.getCommonPosition(this, other);
  }

  getCommonAncestor(other: ModelPosition): ModelElement {
    if (this.root !== other.root) {
      throw new PositionError("cannot compare nodes with different roots");
    }

    debugger;
    const leftLength = this.path.length;
    const rightLength = other.path.length;
    const lengthDiff = leftLength - rightLength;

    let left: ModelElement | null = this.parent;
    let right: ModelElement | null = other.parent;

    if(lengthDiff > 0) {
      // left position is lower than right position
      for(let i = 0; i < lengthDiff; i++) {
        if(!left.parent) {
          throw new PositionError("impossible position");
        }
        left = left.parent;
      }
    } else if (lengthDiff < 0) {
      // right position is lower than left position
      for(let i = 0; i < Math.abs(lengthDiff); i++) {
        if(!right.parent) {
          throw new PositionError("impossible position");
        }
        right = right.parent;
      }
    }

    while(left && right && left !== right) {
      left = left.parent;
      right = right.parent;
    }
    if(left) {
      return left;
    } else {
      return this.root;
    }
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
   */
  split() {
    const before = this.nodeBefore();
    const after = this.nodeAfter();
    if (ModelNode.isModelText(before)) {
      if (before === after) {
        before.split(this.parentOffset - before.getOffset());
      }
      this.parentCache = null;
    }

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

  //this returns true if the position is inside a text node (not right before not right after)
  isInsideText(): boolean{
    if(
      (this.nodeAfter() == this.nodeBefore()) &&
      (ModelNode.isModelText(this.nodeAfter()) && ModelNode.isModelText(this.nodeBefore()))
    ){
      return true;
    }
    else{
      return false;
    }
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
