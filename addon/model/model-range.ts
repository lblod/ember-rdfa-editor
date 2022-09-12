import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import { RelativePosition } from '@lblod/ember-rdfa-editor/utils/types';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ArrayUtils from '@lblod/ember-rdfa-editor/utils/array-utils';
import { Predicate } from '@lblod/ember-rdfa-editor/utils/predicate-utils';
import ModelTreeWalker, {
  FilterResult,
  toFilterSkipFalse,
} from '@lblod/ember-rdfa-editor/utils/model-tree-walker';
import GenTreeWalker, {
  WalkFilter,
} from '@lblod/ember-rdfa-editor/utils/gen-tree-walker';
import { IllegalArgumentError } from '@lblod/ember-rdfa-editor/utils/errors';
import { MarkSet } from '@lblod/ember-rdfa-editor/model/mark';
import { INVISIBLE_SPACE } from '@lblod/ember-rdfa-editor/utils/constants';
import InsertOperation from '@lblod/ember-rdfa-editor/model/operations/insert-operation';

export type StickySide = 'none' | 'left' | 'right' | 'both';

export type SimpleRangeContextStrategy =
  | 'rangeContains'
  | 'rangeIsInside'
  | 'rangeTouches';

export type DetailedRangeContextStrategy =
  | RangeContainsStrategy
  | RangeIsInsideStrategy
  | RangeTouchesStrategy;
/**
 * Consider all nodes contained by this range.
 *
 * Conceptually, imagine selecting your range in the serialized
 * html representation and considering all opening tags and full textNodes you encounter.
 * (in this metaphor, consider textnodes to not have tags).
 *
 * With this image in mind, we should consider what happens with textnodes at the edges.
 *
 * e.g.
 *
 * <text>ab|c</text><text>de|f</text>
 *
 * For historical reasons, the default behavior of this strategy is to always
 * consider textnodes at the start and end if the start or end positions
 * are "inside" the respective textnode. So in the above example,
 * both would be considered.
 *
 * But if we have:
 * <text>abc</text>|<text>de|f</text>
 *
 * Only the second node would be considered.
 *
 * TODO: add options to adjust this behavior when the need arises
 *
 */
export type RangeContainsStrategy = {
  type: 'rangeContains';
};
/**
 * Consider all nodes which the range "is inside of"
 * This means: consider the common ancestor of start and end,
 * and its entire ancestry tree up to and including root.
 *
 * If both start and end have the same parent, and both are located "inside"
 * the same textnode (i.e. their offset falls between the offset of a textnode and (offset + length)
 * that node is also considered.
 *
 * For cases where either side of the range falls just in front or just after a common textnode,
 * the stickyness parameter determines whether that textnode is considered or not
 */
export type RangeIsInsideStrategy = {
  type: 'rangeIsInside';
  /**
   *
   * Recall that a textnode is only considered if both start and end of the range
   * can be considered to be inside of that textnode.
   *
   * With that in mind, the stickyness parameter determines whether either side of
   * the range is "sticky", meaning that the position will be considered to be inside any textnode it
   * is directly adjacent to, in the chosen direction.
   *
   * This leads to the following results:
   *
   * collapsed ranges:
   *
   * <text>abc</text>||
   *
   * without stickyness, the textnode would not be considered.
   * following combinations would consider it:
   * start: left, end: left
   * start: both, end: left
   * start: left, end: both
   * start: both, end: both
   *
   * <text>abc</text>||<text>def</text>
   *
   * the first node would be considered if:
   * start: left, end: left
   * start: left, end: both
   *
   * the second node would be considered if:
   * start: right, end:right
   * start: both, end: right
   *
   * both nodes would be considered if:
   * start: both, end: both
   *
   * uncollapsed ranges:
   *
   * recall: uncollapsed ranges where the node after the start and the node before the end are not the same,
   * are never affected, since they can never be considered to be fully "inside" a textnode.
   *
   * e.g.:
   *
   * <text>ab|c</text><text>de|f</text>
   *
   * No matter the stickyness, neither textnode will be considered.
   *
   * However in the following scenario, stickyness does matter:
   *
   * |<text>abc</text>|
   *
   * the node will be considered if:
   * start: right, end: left
   * start: right, end: both
   * start: both, end: left
   * start: both, end: both
   *
   * and another scenario:
   *
   * <text>ab|c</text>|
   *
   * considered if:
   * end: left or both
   * (start stickyness doesn't matter here since start is unambiguously inside the node already)
   *
   */
  textNodeStickyness?: {
    start?: StickySide;
    end?: StickySide;
  };
};

/**
 * Consider all nodes that this range "touches".
 * Essentially, this is a combination of the "rangeIsInside" and
 * "rangeContains" strategies, giving you first the contained nodes
 * and then the ancestry tree.
 * TODO: respect document order
 */
export type RangeTouchesStrategy = {
  type: 'rangeTouches';
  includeEndTags?: boolean;
  textNodeStickyness?: {
    start?: StickySide;
    end?: StickySide;
  };
};
export type RangeContextStrategy =
  | SimpleRangeContextStrategy
  | DetailedRangeContextStrategy;

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

  static fromInElement(
    element: ModelElement,
    startOffset = 0,
    endOffset: number = element.getMaxOffset()
  ) {
    const start = ModelPosition.fromInElement(element, startOffset);
    const end = ModelPosition.fromInElement(element, endOffset);
    return new ModelRange(start, end);
  }

  static fromAroundNode(node: ModelNode) {
    if (!node.parent) {
      throw new IllegalArgumentError('Cannot create a range around the root');
    }
    const start = ModelPosition.fromBeforeNode(node);
    const end = ModelPosition.fromAfterNode(node);
    return new ModelRange(start, end);
  }

  static fromInTextNode(
    node: ModelText,
    startOffset: number,
    endOffset: number
  ) {
    const start = ModelPosition.fromInTextNode(node, startOffset);
    const end = ModelPosition.fromInTextNode(node, endOffset);
    return new ModelRange(start, end);
  }

  static fromInNode(
    node: ModelNode,
    startOffset = 0,
    endOffset: number = ModelNode.isModelElement(node)
      ? node.getMaxOffset()
      : node.length
  ) {
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

  /**
   * not so janky debug function
   * @trim to trim the whole document to only the internded range
   */
  visualize(truncate = true): string {
    let root = this.root;
    while (root.parent) {
      root = root.parent;
    }
    root = root.clone();
    const range = ModelRange.fromPaths(root, this.start.path, this.end.path);

    const startRange = new ModelRange(range.start, range.start);
    const endRange = new ModelRange(range.end, range.end);
    const startText = new ModelText('[===START===]');
    const endText = new ModelText('[===END===]');
    let startSplit = false;
    let endSplit = false;

    if (range.start.isInsideText() && range.start.parentOffset != 0) {
      startSplit = true;
    }
    if (range.end.isInsideText() && range.end.parentOffset != 0) {
      endSplit = true;
    }

    new InsertOperation(undefined, endRange, endText).execute();

    new InsertOperation(undefined, startRange, startText).execute();

    let modelString = (root.toXml() as Element).innerHTML;

    if (startSplit) {
      modelString = modelString.replace(
        /<\/text><text __dirty="node,content">\[===START===\]<\/text><text.+?>/,
        '  {[===  '
      );
    } else {
      modelString = modelString.replace(
        '<text __dirty="node,content">[===START===]</text>',
        '  {[===  '
      );
    }
    if (endSplit) {
      modelString = modelString.replace(
        /<\/text><text __dirty="node,content">\[===END===\]<\/text><text.+?>/,
        '  ===]}  '
      );
    } else {
      modelString = modelString.replace(
        '<text __dirty="node,content">[===END===]</text>',
        '  ===]}  '
      );
    }

    //convert back to an element and pretty print as a string
    const process = (str: string): string => {
      const div = document.createElement('div');
      div.innerHTML = str.trim();

      return format(div, 0).innerHTML;
    };
    const format = (node: Element, level: number): Element => {
      const indentBefore = new Array(level++ + 1).join('  '),
        indentAfter = new Array(level - 1).join('  ');
      let textNode;

      for (let i = 0; i < node.children.length; i++) {
        textNode = document.createTextNode('\n' + indentBefore);
        node.insertBefore(textNode, node.children[i]);

        format(node.children[i], level);

        if (node.lastElementChild == node.children[i]) {
          textNode = document.createTextNode('\n' + indentAfter);
          node.appendChild(textNode);
        }
      }

      return node;
    };

    modelString = process(modelString);
    if (truncate) {
      const margin = 200;
      let startIndex = modelString.indexOf('  {[===  ');
      let endIndex = modelString.indexOf('  ===]}  ');
      const length = modelString.length;
      if (startIndex > margin) {
        startIndex -= margin;
      }
      if (length - endIndex > margin) {
        endIndex += margin;
      }
      modelString = modelString.substring(startIndex, endIndex);
    }
    return modelString;
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

  *findCommonAncestorsWhere(
    predicate: Predicate<ModelElement>
  ): Generator<ModelElement, void, void> {
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

  *findContainedNodesWhere<T extends ModelNode = ModelNode>(
    predicate: Predicate<T>
  ): Generator<T, void, void> {
    if (this.collapsed) {
      return;
    }
    const walker = new ModelTreeWalker<T>({
      range: this,
      visitParentUpwards: true,
      filter: toFilterSkipFalse(predicate),
    });
    for (const node of walker) {
      yield node;
    }
  }

  getMarks(): MarkSet {
    const nodes = [
      ...this.contextNodes(
        {
          type: 'rangeTouches',
          textNodeStickyness: {
            start: 'both',
            end: 'left',
          },
          includeEndTags: false,
        },
        toFilterSkipFalse<ModelNode>(ModelNode.isModelText)
      ),
    ] as ModelText[];
    if (nodes.length) {
      let result = nodes[0].marks.clone();
      for (const node of nodes.slice(1)) {
        result = result.intersection(node.marks);
      }
      return result;
    } else {
      return new MarkSet();
    }
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
    const commonPath = ArrayUtils.findCommonSlice(
      this.start.path,
      this.end.path
    );
    const commonLength = commonPath.length;
    const result = [];

    let startCur = this.start;
    while (startCur.path.length > commonLength + 1) {
      const parent = startCur.parent;
      const range = new ModelRange(
        startCur,
        ModelPosition.fromInElement(parent, parent.getMaxOffset())
      );
      if (!range.collapsed) {
        result.push(range);
      }
      startCur = ModelPosition.fromAfterNode(parent);
    }

    const temp = [];
    let endCur = this.end;
    while (endCur.path.length > commonLength + 1) {
      const parent = endCur.parent;
      const range = new ModelRange(
        ModelPosition.fromInElement(parent, 0),
        endCur
      );
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
      const middle = ModelRange.fromInElement(
        endCur.parent,
        0,
        endCur.parentOffset
      );
      if (!middle.collapsed) {
        result.push(middle);
      }
    } else {
      // <div>
      //     blabla|blabla
      // </div>|
      // starCur is one level lower than endCur, so we can safely take
      // the range from startcur to the end of its parent and ignore endCur (the remaining range would be collapsed)
      const middle = ModelRange.fromInElement(
        startCur.parent,
        startCur.parentOffset,
        startCur.parent.getMaxOffset()
      );
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
    return new ModelRange(
      this.start.clone(modelRoot),
      this.end.clone(modelRoot)
    );
  }

  *contextNodes(
    strategy: RangeContextStrategy,
    filter?: WalkFilter<ModelNode>
  ): Generator<ModelNode, void, void> {
    let strat: DetailedRangeContextStrategy;
    if (typeof strategy === 'string') {
      strat = {
        type: strategy,
      };
    } else {
      strat = strategy;
    }

    if (strat.type === 'rangeContains') {
      const walker = GenTreeWalker.fromRange({ range: this, filter });
      yield* walker.nodes();
    } else if (strat.type === 'rangeIsInside') {
      yield* this.nodesInside(strat.textNodeStickyness, filter);
    } else if (strat.type === 'rangeTouches') {
      const walker = GenTreeWalker.fromRange({
        range: this,
        filter,
        visitParentUpwards: strat.includeEndTags,
      });

      const yieldedNodes = new Set();
      for (const node of walker.nodes()) {
        yield node;
        yieldedNodes.add(node);
      }
      for (const node of this.nodesInside(strat.textNodeStickyness, filter)) {
        if (!yieldedNodes.has(node)) {
          yield node;
        }
      }
    } else {
      throw new IllegalArgumentError('Unsupported strategy');
    }
  }

  private *nodesInside(
    {
      start = 'none',
      end = 'none',
    }: { start?: StickySide; end?: StickySide } = {},
    filter?: WalkFilter<ModelNode>
  ): Generator<ModelNode, void, void> {
    const extraNodes = [];
    const seenNodes = new Set();
    const beforeStart = this.start.nodeBefore();
    const afterStart = this.start.nodeAfter();
    const beforeEnd = this.end.nodeBefore();
    const afterEnd = this.end.nodeAfter();
    const nodeFilter = filter
      ? (node: ModelNode) => filter(node) === FilterResult.FILTER_ACCEPT
      : () => true;

    if (this.collapsed && !this.start.isInsideText()) {
      if (
        ModelNode.isModelText(beforeStart) &&
        ['left', 'both'].includes(start) &&
        ['left', 'both'].includes(end)
      ) {
        if (!seenNodes.has(beforeStart)) {
          extraNodes.push(beforeStart);
          seenNodes.add(beforeStart);
        }
      }
      if (
        ModelNode.isModelText(afterEnd) &&
        ['right', 'both'].includes(start) &&
        ['right', 'both'].includes(end)
      ) {
        if (!seenNodes.has(afterEnd)) {
          extraNodes.push(afterEnd);
          seenNodes.add(afterEnd);
        }
      }
    } else {
      if (ModelNode.isModelText(afterStart) && afterStart === beforeEnd) {
        if (
          (this.start.isInsideText() || ['right', 'both'].includes(start)) &&
          (this.end.isInsideText() || ['left', 'both'].includes(end))
        ) {
          if (!seenNodes.has(afterStart)) {
            extraNodes.push(afterStart);
            seenNodes.add(afterStart);
          }
        }
      }
    }
    for (const node of extraNodes) {
      if (nodeFilter(node)) {
        yield node;
      }
    }

    yield* this.findCommonAncestorsWhere(nodeFilter);
  }

  getTextContent(): string {
    return this.textContentHelper(false).textContent;
  }

  getTextContentWithMapping(): {
    textContent: string;
    indexToPos: (textIndex: number) => ModelPosition;
  } {
    return this.textContentHelper(true);
  }

  private textContentHelper(calculateMapping: boolean): {
    textContent: string;
    indexToPos: (textIndex: number) => ModelPosition;
  } {
    let textContent = '';

    // a sparse map of character indices of the resultstring to paths
    // it looks something like this:
    // [[4, [0, 0]], [18, [1,3,4]]]
    // the first number is the limitnumber
    // meaning all indices up to 4 correspond to textnode with path [0,0],
    // all indices between 4 and 18 correspond to textnode with path [1,3,4], etc
    // to get the final path of the index, add the difference between the index
    // and the last encountered limit to the last element of the path
    const mapping: [number, number[]][] = [];

    // get all textnodes in range
    const walker = GenTreeWalker.fromRange({
      range: this,
      descend: true,
    });

    // calculate difference between start of range and start of the first textnode
    const startOffset = this.start.isInsideText()
      ? this.start.parentOffset - this.start.nodeAfter()!.getOffset()
      : 0;

    let currentIndex = 0;
    // build the resultstring
    for (const node of walker.nodes()) {
      if (ModelNode.isModelText(node)) {
        // keep a sparse mapping of character indices in the resulting string to paths
        const pattern = new RegExp(`${INVISIBLE_SPACE}`, 'g');
        const sanitizedContent = node.content.replace(pattern, '');
        if (calculateMapping) {
          const path = ModelPosition.fromBeforeNode(node).path;
          mapping.push([
            currentIndex + sanitizedContent.length - startOffset,
            path,
          ]);
          currentIndex += sanitizedContent.length;
        }
        textContent += sanitizedContent;
      } else if (node.isBlock) {
        if (calculateMapping) {
          const path = node.length
            ? ModelPosition.fromInNode(node, 0).path
            : ModelPosition.fromBeforeNode(node).path;
          mapping.push([currentIndex + 1 - startOffset, path]);
          currentIndex += 1;
        }
        textContent += '\n';
      }
    }

    // calculate endoffset, or the difference between the offset just after the final textnode and the endposition of
    // the range
    let endOffset = textContent.length;
    if (this.end.isInsideText()) {
      const textNode = this.end.nodeAfter()!;
      const maxOffset = textNode.getOffset() + textNode.length;
      endOffset -= maxOffset - this.end.parentOffset;
    }

    // the mapping function to convert resultstring indices back to positions
    const indexToPos = (index: number): ModelPosition => {
      let lastLimit = 0;
      for (const [limit, path] of mapping) {
        if (index < limit) {
          const resultPath = [...path];
          const final = resultPath[resultPath.length - 1];
          resultPath[resultPath.length - 1] = final + index - lastLimit;
          return ModelPosition.fromPath(this.root, resultPath);
        }
        lastLimit = limit;
      }
      return this.end;
    };

    return {
      textContent: textContent.substring(startOffset, endOffset),
      indexToPos,
    };
  }

  /**
   * Make a range that is this range with its edges "shrunk" until they
   * are right before or after a textNode or blocknode
   * This means you get the smallest range that is still visually equivalent to this range.
   */
  shrinkToVisible(): ModelRange {
    const walker = GenTreeWalker.fromRange({
      range: this,
      filter: toFilterSkipFalse(
        (node) => ModelNode.isModelText(node) || node.isBlock
      ),
    });
    const textNodes = [...walker.nodes()];
    let start;
    let end;
    const afterStart = this.start.nodeAfter();
    const beforeEnd = this.end.nodeBefore();
    if (
      afterStart &&
      (ModelNode.isModelText(afterStart) || afterStart.isBlock)
    ) {
      start = this.start;
    } else {
      start = ModelPosition.fromBeforeNode(textNodes[0]);
    }
    if (
      // we are right after the opening of a block tag
      (!beforeEnd && this.end.parent.isBlock) ||
      (beforeEnd && ModelNode.isModelText(beforeEnd))
    ) {
      end = this.end;
    } else {
      end = ModelPosition.fromAfterNode(textNodes[textNodes.length - 1]);
    }
    return new ModelRange(start, end);
  }

  toString(): string {
    return `ModelRange<[${this.start.path.toString()}] - [${this.end.path.toString()}]>`;
  }
}

export interface RangeFactory {
  fromPaths(path1: number[], path2: number[], root?: ModelElement): ModelRange;

  fromInElement(
    element: ModelElement,
    startOffset: number,
    endOffset: number
  ): ModelRange;

  fromAroundNode(node: ModelNode): ModelRange;

  fromInTextNode(
    node: ModelText,
    startOffset: number,
    endOffset: number
  ): ModelRange;

  fromInNode(
    node: ModelNode,
    startOffset?: number,
    endOffset?: number
  ): ModelRange;

  fromAroundAll(): ModelRange;
}

export class ModelRangeFactory implements RangeFactory {
  private readonly root: ModelElement;

  constructor(root: ModelElement) {
    this.root = root;
  }

  fromPaths(
    path1: number[],
    path2: number[],
    root: ModelElement = this.root
  ): ModelRange {
    return ModelRange.fromPaths(root, path1, path2);
  }

  fromInElement(
    element: ModelElement,
    startOffset = 0,
    endOffset: number = element.getMaxOffset()
  ): ModelRange {
    return ModelRange.fromInElement(element, startOffset, endOffset);
  }

  fromAroundNode(node: ModelNode): ModelRange {
    return ModelRange.fromAroundNode(node);
  }

  fromInTextNode(
    node: ModelText,
    startOffset = 0,
    endOffset: number = node.length
  ): ModelRange {
    return ModelRange.fromInTextNode(node, startOffset, endOffset);
  }

  fromInNode(
    node: ModelNode,
    startOffset?: number,
    endOffset?: number
  ): ModelRange {
    return ModelRange.fromInNode(node, startOffset, endOffset);
  }

  fromAroundAll(): ModelRange {
    return this.fromInElement(this.root);
  }
}
