import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {RelativePosition} from "@lblod/ember-rdfa-editor/model/util/types";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ArrayUtils from "@lblod/ember-rdfa-editor/model/util/array-utils";

/**
 * Model-space equivalent of a {@link Range}
 * Not much more than a container for two {@link ModelPosition ModelPositions}
 */
export default class ModelRange {
  private _start: ModelPosition;
  private _end: ModelPosition;

  static fromPaths(root: ModelElement, path1: number[], path2: number[]) {
    //TODO: should we copy here? or leave it to the caller?
    const pos1 = ModelPosition.fromPath(root, path1);
    const pos2 = ModelPosition.fromPath(root, path2);
    const cmpResult = pos1.compare(pos2);
    if (cmpResult === RelativePosition.AFTER) {
      return new ModelRange(pos2, pos1);
    } else {
      return new ModelRange(pos1, pos2);
    }
  }

  static fromInElement(element: ModelElement, startOffset: number, endOffset: number) {
    const start = ModelPosition.fromInElement(element, startOffset);
    const end = ModelPosition.fromInElement(element, endOffset);
    return new ModelRange(start, end);
  }

  static fromInTextNode(node: ModelText, startOffset: number, endOffset: number) {
    const start = ModelPosition.fromInTextNode(node, startOffset);
    const end = ModelPosition.fromInTextNode(node, endOffset);
    return new ModelRange(start, end);
  }

  static fromInNode(node: ModelNode, startOffset: number, endOffset: number) {
    const start = ModelPosition.fromInNode(node, startOffset);
    const end = ModelPosition.fromInNode(node, endOffset);
    return new ModelRange(start, end);
  }

  constructor(start: ModelPosition, end: ModelPosition = start.clone()) {
    this._start = start;
    this._end = end;
  }

  /**
   * start, aka leftmost position of the range
   */
  get start(): ModelPosition {
    return this._start;
  }

  set start(value: ModelPosition) {
    this._start = value;
  }

  get root(): ModelElement {
    return this._start.root;
  }

  /**
   * end, aka rightmost position of the range
   */
  get end(): ModelPosition {
    return this._end;
  }

  set end(value: ModelPosition) {
    this._end = value;
  }

  /**
   * whether start and end positions are the same
   */
  get collapsed(): boolean {
    return this.start.sameAs(this.end);
  }

  getCommonPosition(): ModelPosition | null {
    if (this.start.root !== this.end.root) {
      return null;
    }
    return ModelPosition.getCommonPosition(this.start, this.end);
  }

  /**
   * Find the common ancestor of start and end positions.
   */
  getCommonAncestor(): ModelElement {
    return this.start.getCommonAncestor(this.end);
  }

  /**
   * Whether this range is confined, aka it is fully contained within one parentElement
   */
  isConfined(): boolean {
    return this.start.parent === this.end.parent;
  }


  /**
   * Return a new range that is expanded to include all children
   * of the commonAncestor that are "touched" by this range
   */
  getMaximizedRange(): ModelRange {
    const commonAncestorPath = this.getCommonPosition()!.path;
    let start = this.start;
    let end = this.end;
    if (this.start.path.length > commonAncestorPath.length + 1) {
      const basePath = this.start.path.slice(0, commonAncestorPath.length + 1);
      if (basePath[basePath.length - 1] > 0) {
        basePath[basePath.length - 1]--;
      }
      start = ModelPosition.fromPath(this.root, basePath);
    }
    if (this.end.path.length > commonAncestorPath.length + 1) {
      const basePath = this.end.path.slice(0, commonAncestorPath.length + 1);
      basePath[basePath.length - 1]++;
      end = ModelPosition.fromPath(this.root, basePath);
    }

    return new ModelRange(start, end);


  }

  /**
   * Return the minimal set of confined ranges that, when combined, form an equivalent range to this one
   */
  getMinimumConfinedRanges(): ModelRange[] {

    const commonPath = ArrayUtils.findCommonSlice(this.start.path, this.end.path);
    const commonLength = commonPath.length;
    const result = [];

    let startCur = this.start;
    while (startCur.path.length > commonLength + 1) {
      const parent = startCur.parent;
      const range = new ModelRange(startCur, ModelPosition.fromInElement(parent, parent.getMaxOffset()));
      if (!range.collapsed) {
        result.push(range);
      }
      startCur = ModelPosition.fromAfterNode(parent);
    }

    const temp = [];
    let endCur = this.end;
    while (endCur.path.length > commonLength + 1) {
      const parent = endCur.parent;
      const range = new ModelRange(ModelPosition.fromInElement(parent, 0), endCur);
      if (!range.collapsed) {
        temp.push(range);
      }
      endCur = ModelPosition.fromBeforeNode(parent);
    }
    const middle = new ModelRange(startCur, endCur);
    if (!middle.collapsed) {
      result.push(middle);

    }
    temp.reverse();
    result.push(...temp);
    return result;

  }


  sameAs(other: ModelRange): boolean {
    return this.start.sameAs(other.start) && this.end.sameAs(other.end);
  }

  clone(): ModelRange {
    return new ModelRange(this.start.clone(), this.end.clone());
  }
}

