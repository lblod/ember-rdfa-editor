import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelNodeFinder from "@lblod/ember-rdfa-editor/model/util/model-node-finder";
import {Direction, FilterAndPredicate, RelativePosition} from "@lblod/ember-rdfa-editor/model/util/types";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";

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
    const pos1 = ModelPosition.from(root, path1);
    const pos2 = ModelPosition.from(root, path2);
    const cmpResult = pos1.compare(pos2);
    if(cmpResult === RelativePosition.AFTER) {
      return new ModelRange(pos2, pos1);
    } else {
      return new ModelRange(pos1, pos2);
    }
  }

  constructor(start: ModelPosition, end: ModelPosition = start) {
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
  getCommonAncestor(): ModelPosition | null {
    if (this.start.root !== this.end.root) {
      return null;
    }
    return ModelPosition.getCommonAncestor(this.start, this.end);

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
}

