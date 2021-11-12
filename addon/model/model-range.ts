import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {PropertyState, RelativePosition} from "@lblod/ember-rdfa-editor/model/util/types";
import ModelText, {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ArrayUtils from "@lblod/ember-rdfa-editor/model/util/array-utils";
import {Predicate} from "@lblod/ember-rdfa-editor/model/util/predicate-utils";
import ModelTreeWalker, {toFilterSkipFalse} from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";

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

  static fromAroundNode(node: ModelNode) {
    const start = ModelPosition.fromBeforeNode(node);
    const end = ModelPosition.fromAfterNode(node);
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

  hasCommonAncestorWhere(predicate: Predicate<ModelElement>): boolean {
    const result = this.findCommonAncestorsWhere(predicate).next();
    return !!result.value;
  }

  * findCommonAncestorsWhere(predicate: Predicate<ModelElement>): Generator<ModelElement, void, void> {
    let commonAncestor: ModelElement | null = this.getCommonAncestor();
    while (commonAncestor) {
      if (predicate(commonAncestor)) {
        yield commonAncestor;
      }
      commonAncestor = commonAncestor.parent;
    }
  }

  containsNodeWhere(predicate: Predicate<ModelNode>): boolean {
    const result = this.findContainedNodesWhere(predicate).next();
    return !!result.value;
  }

  * findContainedNodesWhere<T extends ModelNode = ModelNode>(predicate: Predicate<T>): Generator<T, void, void> {
    if (this.collapsed) {
      return;
    }
    const walker = new ModelTreeWalker<T>({
      range: this,
      visitParentUpwards: true,
      filter: toFilterSkipFalse(predicate)
    });
    for (const node of walker) {
      yield node;
    }
  }

  getTextAttributes(): Map<TextAttribute, PropertyState> {
    const treeWalker = new ModelTreeWalker<ModelText>({
      range: this,
      filter: toFilterSkipFalse(ModelNode.isModelText)
    });
    const result: Map<TextAttribute, PropertyState> = new Map<TextAttribute, PropertyState>();
    for (const node of treeWalker) {
      for (const [attr, val] of node.getTextAttributes()) {
        const currentVal = result.get(attr);
        if (!currentVal) {
          if (val) {
            result.set(attr, PropertyState.enabled);
          } else {
            result.set(attr, PropertyState.disabled);
          }
        } else if (currentVal === PropertyState.enabled) {
          if (!val) {
            result.set(attr, PropertyState.unknown);
          }
        } else if (currentVal === PropertyState.disabled) {
          if (val) {
            result.set(attr, PropertyState.unknown);
          }

        }
      }
    }
    return result;
  }

  /**
   * Whether this range is confined, aka it is fully contained within one parentElement
   */
  isConfined(): boolean {
    return this.start.parent === this.end.parent;
  }

  collapse(toLeft = false): void {
    if (toLeft) {
      this.end = this.start;
    } else {
      this.start = this.end;
    }
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
    if (startCur.path.length === endCur.path.length) {
      const middle = new ModelRange(startCur, endCur);
      if (!middle.collapsed) {
        result.push(middle);
      }
    } else if (startCur.path.length < endCur.path.length) {
      // |<div>
      //     blabla|blabla
      // </div>
      // endCur is one level lower than startCur, so we can safely take
      // the range from the beginning of its parent and ignore startCur (the remaining range would be collapsed)
      const middle = ModelRange.fromInElement(endCur.parent, 0, endCur.parentOffset);
      if (!middle.collapsed) {
        result.push(middle);
      }
    } else {
      // <div>
      //     blabla|blabla
      // </div>|
      // starCur is one level lower than endCur, so we can safely take
      // the range from startcur to the end of its parent and ignore endCur (the remaining range would be collapsed)
      const middle = ModelRange.fromInElement(startCur.parent, startCur.parentOffset, startCur.parent.getMaxOffset());
      if (!middle.collapsed) {
        result.push(middle);
      }
    }
    temp.reverse();
    result.push(...temp);
    return result;

  }

  sameAs(other: ModelRange): boolean {
    return this.start.sameAs(other.start) && this.end.sameAs(other.end);
  }

  clone(modelRoot?: ModelElement): ModelRange {
    return new ModelRange(this.start.clone(modelRoot), this.end.clone(modelRoot));
  }

  toString(): string {
    return `ModelRange<[${this.start.path.toString()}] - [${this.end.path.toString()}]>`;
  }
}

export interface RangeFactory {
  fromPaths(path1: number[], path2: number[], root?: ModelElement): ModelRange;

  fromInElement(element: ModelElement, startOffset: number, endOffset: number): ModelRange;

  fromAroundNode(node: ModelNode): ModelRange;

  fromInTextNode(node: ModelText, startOffset: number, endOffset: number): ModelRange;

  fromInNode(node: ModelNode, startOffset: number, endOffset: number): ModelRange;

  fromAroundAll(): ModelRange;
}

export class ModelRangeFactory implements RangeFactory {
  private readonly root: ModelElement;

  constructor(root: ModelElement) {
    this.root = root;
  }

  fromPaths(path1: number[], path2: number[], root: ModelElement = this.root): ModelRange {
    return ModelRange.fromPaths(root, path1, path2);
  }

  fromInElement(element: ModelElement, startOffset = 0, endOffset: number = element.getMaxOffset()): ModelRange {
    return ModelRange.fromInElement(element, startOffset, endOffset);
  }

  fromAroundNode(node: ModelNode): ModelRange {
    return ModelRange.fromAroundNode(node);
  }

  fromInTextNode(node: ModelText, startOffset = 0, endOffset: number = node.length): ModelRange {
    return ModelRange.fromInTextNode(node, startOffset, endOffset);
  }

  fromInNode(node: ModelNode, startOffset: number, endOffset: number): ModelRange {
    return ModelRange.fromInNode(node, startOffset, endOffset);
  }

  fromAroundAll(): ModelRange {
    return this.fromInElement(this.root);
  }


}
