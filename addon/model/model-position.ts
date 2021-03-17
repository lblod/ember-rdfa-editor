import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {PositionError, SelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import {RelativePosition} from "@lblod/ember-rdfa-editor/model/util/types";
import ArrayUtils from "@lblod/ember-rdfa-editor/model/util/array-utils";

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
  static from(root: ModelElement, path: number[]) {
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
   */
  static fromParent(root: ModelElement, parent: ModelNode, offset: number): ModelPosition {
    if (offset < 0 || offset > parent.length) {
      throw new SelectionError("offset out of range");
    }
    const result = new ModelPosition(root);
    result.path = parent.getIndexPath();
    result.path.push(offset);
    return result;
  }

  static getCommonAncestor(pos1: ModelPosition, pos2: ModelPosition): ModelPosition | null {
    if (pos1.root !== pos2.root) {
      return null;
    }
    const commonPath = ArrayUtils.findCommonSlice(pos1.path, pos2.path);

    return ModelPosition.from(pos1.root, commonPath);
  }

  /**
   * Get a slice of child positions of the commonAncestor between pos1 and pos2
   * @param pos1
   * @param pos2
   */
  static getTopPositionsBetween(pos1: ModelPosition, pos2: ModelPosition): ModelPosition[] | null {
    const commonAncestor = ModelPosition.getCommonAncestor(pos1, pos2);
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
      results.push(ModelPosition.from(root, commonPath.concat([i, 0])));
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
    let cur: ModelNode = this.root;
    let i = 0;

    while(ModelNode.isModelElement(cur) && i < this.path.length - 1) {
      cur = cur.childAtOffset(this.path[i]);
      i++;
    }
    if(i > 0 && i !== this.path.length - 1) {
      throw new PositionError("invalid path");
    }
    this.parentCache = cur as ModelElement;
    return cur as ModelElement;
  }

  /**
   * Get the first ancestor which is a ModelElement
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

  getCommonAncestor(other: ModelPosition): ModelPosition | null {
    return ModelPosition.getCommonAncestor(this, other);
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

  split() {
    this.parent.split(this.parentOffset);
    this.parentCache = null;
  }

  nodeAfter(): ModelNode | null {
    return this.parent.childAtOffset(this.parentOffset) || null;

  }
  nodeBefore(): ModelNode | null {
    return this.parent.childAtOffset(this.parentOffset - 1) || null;
  }

}
