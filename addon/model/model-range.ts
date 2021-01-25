import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelNodeFinder from "@lblod/ember-rdfa-editor/model/util/model-node-finder";
import {Direction} from "@lblod/ember-rdfa-editor/model/util/types";
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
   * Get a {@link ModelNodeFinder} which searches for nodes between start and end, or the other way round
   * @param direction
   * @param filter
   */
  getNodeFinder<T extends ModelNode = ModelNode>(direction: Direction = Direction.FORWARDS, filter?: (node: ModelNode) => node is T): ModelNodeFinder<T> {
    return new ModelNodeFinder({
      startNode: this.start.parent,
      endNode: this.end.parent,
      rootNode: this.start.root,
      nodeFilter: filter,
      direction
    });

  }

  /**
   * Eagerly get all nodes between start and end, filtered by filter
   * @param filter
   */
  getNodes<T extends ModelNode = ModelNode>(filter?: (node: ModelNode) => node is T): T[] {
    const finder = this.getNodeFinder<T>(Direction.FORWARDS, filter);
    return [...finder];
  }

  /**
   * Get all {@link ModelText} nodes between start and end
   */
  getTextNodes(): ModelText[] {
    return this.getNodes(ModelNode.isModelText);
  }
}
