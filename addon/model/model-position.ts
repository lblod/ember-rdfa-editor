import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {NotImplementedError, PositionError, SelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import {RelativePosition} from "@lblod/ember-rdfa-editor/model/util/types";

export default class ModelPosition {
  private _path: number[];
  private _root: ModelElement;
  private parentCache: ModelNode | null = null;


  static from(root: ModelElement, path: number[]) {
    const result = new ModelPosition(root);
    result.path = path;
    return result;
  }

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

  get root(): ModelElement {
    return this._root;
  }

  get parentOffset(): number {
    return this.path[this.path.length - 1];
  }

  sameAs(other: ModelPosition): boolean {
    return this.compare(other) === RelativePosition.EQUAL;
  }

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
