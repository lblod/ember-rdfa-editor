import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelNodeFinder from "@lblod/ember-rdfa-editor/model/util/model-node-finder";
import {Direction, FilterAndPredicate, RelativePosition} from "@lblod/ember-rdfa-editor/model/util/types";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import {ModelNodeFilter, ModelTreeWalker} from "@lblod/ember-rdfa-editor/model/util/tree-walker";
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
    const pos1 = ModelPosition.from(root, path1);
    const pos2 = ModelPosition.from(root, path2);
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
   * This will always be either one, two, or three ranges.
   */
  getMinimumConfinedRanges(): ModelRange[] {
    if (this.isConfined()) {
      return [this];
    }

    // commonAncestor can only be a non-element if start and end are inside the same textnode, and that is covered
    // by the isConfined() check above
    // TODO: this can be encoded in type information, similar to WellBehavedSelection
    const commonAncestor = this.getCommonAncestor()!;

    // for the left and right ranges, get the common part between resulting start and end positions
    const leftEndPath = this.start.path.slice(0, this.start.path.length - 1);
    const rightStartPath = this.end.path.slice(0, this.end.path.length - 1);

    let middle = null;

    if (this.start.parent === commonAncestor) {
      // the end of the left range is the offset of the end path at the level of the startPosition
      leftEndPath.push(this.end.path[this.start.path.length - 1]);
      // the start of the right range is the start of its parent node
      rightStartPath.push(0);
    } else if (this.end.parent === commonAncestor) {
      leftEndPath.push(this.start.parent.getMaxOffset());
      // the start of the right range is the offset of the start path at the level of the endPosition
      rightStartPath.push(this.start.path[this.end.path.length - 1] + 1);
    } else {
      // get the common path
      const commonPath = commonAncestor.getOffsetPath();
      // make two paths in the commonAncestor which contain all nodes between the start and end path
      const fromPath = [...commonPath, this.start.path[commonPath.length] + 1];
      const toPath = [...commonPath, this.end.path[commonPath.length]];
      middle = new ModelRange(ModelPosition.from(this.root, fromPath), ModelPosition.from(this.root, toPath));

      // for the left and right ranges, select the rest of their parent nodes in the appropriate
      // direction
      leftEndPath.push(this.start.parent.getMaxOffset());
      rightStartPath.push(0);

    }

    const left = new ModelRange(this.start, ModelPosition.from(this.root, leftEndPath));
    const right = new ModelRange(ModelPosition.from(this.root, rightStartPath), this.end);
    if (middle && !middle.collapsed) {
      return [left, middle, right];
    } else {
      return [left, right];
    }


  }

  sameAs(other: ModelRange): boolean {
    return this.start.sameAs(other.start) && this.end.sameAs(other.end);
  }
}

