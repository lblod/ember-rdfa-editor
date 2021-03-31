import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelNodeFinder from "@lblod/ember-rdfa-editor/model/util/model-node-finder";
import {Direction, FilterAndPredicate, RelativePosition} from "@lblod/ember-rdfa-editor/model/util/types";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelTreeWalker, {ModelNodeFilter} from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";
import {NotImplementedError} from "@lblod/ember-rdfa-editor/utils/errors";

/**
 * Model-space equivalent of a {@link Range}
 * Not much more than a container for two {@link ModelPosition ModelPositions}
 */
export default class ModelRange {
  private _start: ModelPosition;
  private _end: ModelPosition;

  static fromParents(root: ModelElement, start: ModelNode, startOffset: number, end: ModelNode, endOffset: number): ModelRange {
    return new ModelRange(ModelPosition.fromParent(root, start, startOffset), ModelPosition.fromParent(root, end, endOffset));
  }

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

  static fromChildren(element: ModelElement) {
    const basePath = element.getOffsetPath();
    return ModelRange.fromPaths(element.root, [...basePath, 0], [...basePath, element.getMaxOffset()]);
  }

  static fromInnerContent(node: ModelNode) {
    if (ModelNode.isModelElement(node)) {
      return ModelRange.fromChildren(node);
    } else if (ModelNode.isModelText(node)) {
      const basePath = node.getOffsetPath();
      const endPath = [...basePath];
      endPath[endPath.length - 1] += node.length;
      return ModelRange.fromPaths(node.root, basePath, endPath);
    } else {
      throw new NotImplementedError("Node type not supported");
    }


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

  /**
   * Find the common ancestor of start and end positions.
   */
  getCommonPosition(): ModelPosition | null {
    if (this.start.root !== this.end.root) {
      return null;
    }
    return ModelPosition.getCommonPosition(this.start, this.end);
  }

  getCommonAncestor(): ModelNode | null {
    return this.getCommonPosition()?.nodeAfter() || null;
  }


  /**
   * Get all child positions of the commonAncestor that are touched by the selection
   * @deprecated
   */
  getSelectedTopPositions(): ModelPosition[] | null {
    return ModelPosition.getTopPositionsBetween(this.start, this.end);
  }

  /**
   * Get a {@link ModelNodeFinder} which searches for nodes between start and end, or the other way round
   * @param direction
   * @param config
   * @deprecated use {@link ModelTreeWalker} instead
   */
  getNodeFinder<T extends ModelNode = ModelNode>(direction: Direction = Direction.FORWARDS, config: FilterAndPredicate<T>): ModelNodeFinder<T> {
    const {filter, predicate} = config;
    return new ModelNodeFinder({
      startNode: this.start.parent,
      endNode: this.end.parent,
      rootNode: this.start.root,
      nodeFilter: filter,
      predicate,
      direction
    });

  }

  /**
   * Eagerly get all nodes between start and end, filtered by filter
   * @param config
   * @deprecated use {@link ModelTreeWalker} instead
   */
  getNodes<T extends ModelNode = ModelNode>(config: FilterAndPredicate<T> = {}): T[] {
    const finder = this.getNodeFinder<T>(Direction.FORWARDS, config);
    return [...finder];
  }

  getWalker(filter?: ModelNodeFilter) {
    return new ModelTreeWalker({range: this, filter});
  }

  /**
   * Get all {@link ModelText} nodes between start and end
   * @deprecated use {@link ModelTreeWalker} instead
   */
  getTextNodes(): ModelText[] {
    return this.getNodes({filter: ModelNode.isModelText});
  }


  /**
   * Whether this range is confined, aka it is fully contained within one parentElement
   */
  isConfined(): boolean {
    return this.start.parent === this.end.parent;
  }


  /**
   * Return the minimal set of confined ranges that, when combined, form an equivalent range to this one
   */
  getMinimumConfinedRanges(): ModelRange[] {

    const commonAncestor = this.getCommonAncestor() as ModelElement;
    return this.getMininumConfinedRangesRec(this.clone(), commonAncestor);

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

  private getMininumConfinedRangesRec(range: ModelRange, commonAncestor: ModelElement): ModelRange[] {
    if (range.isConfined()) {
      return [range];
    }
    let left: ModelRange | null = null;
    let right: ModelRange | null = null;
    let middleStart: ModelPosition;
    let middleEnd: ModelPosition;

    if (range.start.parent !== commonAncestor) {
      const leftStart = range.start.clone();
      const leftEnd = ModelPosition.fromInElement(range.start.parent, range.start.parent.getMaxOffset());
      left = new ModelRange(leftStart, leftEnd);
      middleStart = ModelPosition.fromAfterNode(range.start.parent);
    } else {
      middleStart = range.start;
    }

    if (range.end.parent !== commonAncestor) {
      const rightStart = ModelPosition.fromInElement(range.end.parent, 0);
      const rightEnd = range.end.clone();
      right = new ModelRange(rightStart, rightEnd);
      middleEnd = ModelPosition.fromBeforeNode(range.end.parent);
    } else {
      middleEnd = range.end;
    }

    const middle = new ModelRange(middleStart, middleEnd);
    const middleConfinedNodes = this.getMininumConfinedRangesRec(middle, commonAncestor);
    if (left) {
      if (right) {
        return [left, ...middleConfinedNodes, right];
      } else {
        return [left, ...middleConfinedNodes];
      }
    } else {
      if (right) {
        return [...middleConfinedNodes, right];
      } else {
        return middleConfinedNodes;
      }

    }
  }


  sameAs(other: ModelRange): boolean {
    return this.start.sameAs(other.start) && this.end.sameAs(other.end);
  }

  clone(): ModelRange {
    return new ModelRange(this.start.clone(), this.end.clone());
  }
}

