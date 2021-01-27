import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelNodeFinder, {
  ModelNodeFinderFilter,
  ModelNodeFinderPredicate
} from "@lblod/ember-rdfa-editor/model/util/model-node-finder";
import {Direction, FilterAndPredicate} from "@lblod/ember-rdfa-editor/model/util/types";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";

/**
 * Model-space equivalent of a {@link Range}
 * Not much more than a container for two {@link ModelPosition ModelPositions}
 */
export default class ModelRange {
  private _start: ModelPosition;
  private _end: ModelPosition;

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
   */
  getSelectedTopPositions(): ModelPosition[] | null {
    return ModelPosition.getTopPositionsBetween(this.start, this.end);
  }

  /**
   * Get a {@link ModelNodeFinder} which searches for nodes between start and end, or the other way round
   * @param direction
   * @param config
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
   */
  getNodes<T extends ModelNode = ModelNode>(config: FilterAndPredicate<T>): T[] {
    const finder = this.getNodeFinder<T>(Direction.FORWARDS, config);
    return [...finder];
  }

  /**
   * Get all {@link ModelText} nodes between start and end
   */
  getTextNodes(): ModelText[] {
    return this.getNodes({filter: ModelNode.isModelText});
  }
}

