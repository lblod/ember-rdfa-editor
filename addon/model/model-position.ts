import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {PositionError, SelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import {RelativePosition} from "@lblod/ember-rdfa-editor/model/util/types";

/**
 * Represents a single position in the model. In contrast to the dom,
 * where a position is defined as a {@link Node} and an offset, we represent a position
 * here as a path of offsets from the root. The definition of these offsets is subject to change.
 */
export default class ModelPosition {
  private _path: number[];
  private _root: ModelElement;
  private parentCache: ModelNode | null = null;


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

  get parent(): ModelNode {
    if(this.parentCache) {
      return this.parentCache;
    }
    let cur: ModelNode = this.root;
    for (const offset of this.path) {
      if (ModelNode.isModelElement(cur)) {
        cur = cur.children[offset];
      } else {
        return cur;
      }
    }
    this.parentCache = cur;
    return cur;
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

  /**
   * Compare two paths and determine their order. A parent is considered to be in front of its children
   * @param path1
   * @param path2
   */
  static comparePath(path1: number[], path2: number[]): RelativePosition {
    if (!(path1.length && path2.length)) {
      throw new PositionError("cannot compare paths where one is empty");
    }

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

}
