import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelNodeFinder from "@lblod/ember-rdfa-editor/model/util/model-node-finder";
import {Direction, FilterAndPredicate, RelativePosition} from "@lblod/ember-rdfa-editor/model/util/types";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelTreeWalker, {ModelNodeFilter} from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";
import {NotImplementedError} from "@lblod/ember-rdfa-editor/utils/errors";
import ArrayUtils from "@lblod/ember-rdfa-editor/model/util/array-utils";

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

