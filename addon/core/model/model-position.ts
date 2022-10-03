import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import {
  NotImplementedError,
  PositionError,
} from '@lblod/ember-rdfa-editor/utils/errors';
import {
  Direction,
  RelativePosition,
} from '@lblod/ember-rdfa-editor/utils/types';
import ArrayUtils from '@lblod/ember-rdfa-editor/utils/array-utils';
import ModelText from '@lblod/ember-rdfa-editor/core/model/nodes/model-text';
import arrayEquals from '../../utils/array-equals';
import GenTreeWalker from '@lblod/ember-rdfa-editor/utils/gen-tree-walker';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import { toFilterSkipFalse } from '@lblod/ember-rdfa-editor/utils/model-tree-walker';
import ModelNodeUtils from '../../utils/model-node-utils';
import { INVISIBLE_SPACE } from '../../utils/constants';

/**
 * Represents a single position in the model. In contrast to the dom,
 * where a position is defined as a {@link Node} and an offset, we represent a position
 * here as a path of offsets from the root. The definition of these offsets is subject to change.
 */
export default class ModelPosition {
  private _path: number[];
  private _root: ModelElement;
  private parentCache: ModelElement | null = null;

  /**
   * Build a position from a rootNode and a path
   * @param root
   * @param path
   */
  static fromPath(root: ModelElement, path: number[]) {
    const result = new ModelPosition(root);
    result.path = path;

    return result;
  }

  static fromAfterNode(node: ModelNode): ModelPosition {
    const basePath = node.getOffsetPath();
    basePath[basePath.length - 1] += node.offsetSize;

    return ModelPosition.fromPath(node.root, basePath);
  }

  static fromBeforeNode(node: ModelNode): ModelPosition {
    return ModelPosition.fromPath(node.root, node.getOffsetPath());
  }

  static fromInTextNode(node: ModelText, offset: number): ModelPosition {
    if (offset < 0 || offset > node.length) {
      throw new PositionError(
        `Offset ${offset} out of range of text node with length ${node.length}`
      );
    }

    const path = node.getOffsetPath();
    path[path.length - 1] += offset;

    return ModelPosition.fromPath(node.root, path);
  }

  static fromInElement(element: ModelElement, offset: number) {
    if (element.type === 'br') {
      return ModelPosition.fromBeforeNode(element);
    }

    if (offset < 0 || offset > element.getMaxOffset()) {
      throw new PositionError(
        `Offset ${offset} out of range of element with maxOffset ${element.getMaxOffset()}`
      );
    }

    const path = element.getOffsetPath();
    path.push(offset);

    return ModelPosition.fromPath(element.root, path);
  }

  static fromInNode(node: ModelNode, offset: number) {
    if (ModelNode.isModelText(node)) {
      return ModelPosition.fromInTextNode(node, offset);
    } else if (ModelNode.isModelElement(node)) {
      return ModelPosition.fromInElement(node, offset);
    } else if (ModelNode.isModelInlineComponent(node)) {
      return ModelPosition.fromBeforeNode(node);
    } else {
      throw new NotImplementedError('Unsupported node type');
    }
  }

  static getCommonPosition(
    pos1: ModelPosition,
    pos2: ModelPosition
  ): ModelPosition | null {
    if (pos1.root !== pos2.root) {
      return null;
    }
    const commonPath = ArrayUtils.findCommonSlice(pos1.path, pos2.path);

    return ModelPosition.fromPath(pos1.root, commonPath);
  }

  constructor(root: ModelElement) {
    this._root = root;
    this._path = [];
  }

  /**
   * The path of offsets from this position's root node.
   */
  get path(): number[] {
    return this._path;
  }

  set path(value: number[]) {
    this._path = value;
    this.parentCache = null;
  }

  get parent(): ModelElement {
    if (this.parentCache) {
      return this.parentCache;
    }

    if (this.path.length === 0) {
      this.parentCache = this.root;
      return this.root;
    }

    let i = 0;
    let current: ModelNode | null = this.root;
    while (ModelNode.isModelElement(current) && i < this.path.length - 1) {
      if (!current.childAtOffset(this.path[i], true)) {
        current.childAtOffset(this.path[i], true);
      }
      current = current.childAtOffset(this.path[i], true);
      i++;
    }

    if (ModelNode.isModelText(current)) {
      this.parentCache = current.parent;
      return current.parent!;
    }

    if (i > 0 && i !== this.path.length - 1) {
      throw new PositionError('invalid path');
    }
    this.parentCache = current as ModelElement;

    return current as ModelElement;
  }

  /**
   * Get the first ancestor which is a ModelElement.
   * @deprecated Use {@link parent} as this is now identical.
   */
  get parentElement(): ModelElement {
    return this.parent;
  }

  /**
   * Root node of the position. In practice, this is almost always the same as the model root,
   * but it does not have to be (e.g. to support multiple model trees).
   */
  get root(): ModelElement {
    return this._root;
  }

  /**
   * Get the offset from the parent, equivalent to a DOM position offset.
   */
  get parentOffset(): number {
    return this.path[this.path.length - 1];
  }

  set parentOffset(offset: number) {
    if (offset < 0 || offset > this.parent.getMaxOffset()) {
      throw new PositionError(
        `Offset ${offset} is out of range of parent with maxOffset ${this.parent.getMaxOffset()}`
      );
    }
    this.path[this.path.length - 1] = offset;
    this.parentCache = null;
  }

  /**
   * Resets the parent cache.
   * Call this when the parent tree of the position has possibly changed.
   * TODO: this is a hack, redesign this
   * Can be resolved relatively elegantly by a robust event system by having every position listen to
   * operation events and invalidating their caches greedily.
   */
  invalidateParentCache(): void {
    this.parentCache = null;
  }

  /**
   * Check if two model positions describe the same position.
   * @param other
   */
  sameAs(other: ModelPosition): boolean {
    return this.compare(other) === RelativePosition.EQUAL;
  }

  /**
   * Compare this position to another and see if it comes before, after, or is the same position.
   * @param other
   */
  compare(other: ModelPosition): RelativePosition {
    return ModelPosition.comparePath(this.path, other.path);
  }

  isBetween(
    start: ModelPosition,
    end: ModelPosition,
    inclusive = false
  ): boolean {
    let startRslt = this.compare(start);
    let endRslt = this.compare(end);

    if (inclusive) {
      if (startRslt === RelativePosition.EQUAL) {
        startRslt = RelativePosition.AFTER;
      }
      if (endRslt === RelativePosition.EQUAL) {
        endRslt = RelativePosition.BEFORE;
      }
    }
    return (
      startRslt === RelativePosition.AFTER &&
      endRslt === RelativePosition.BEFORE
    );
  }

  getCommonPosition(other: ModelPosition): ModelPosition | null {
    return ModelPosition.getCommonPosition(this, other);
  }

  getCommonAncestor(other: ModelPosition): ModelElement {
    if (this.root !== other.root) {
      throw new PositionError('Cannot compare nodes with different roots');
    }

    const leftLength = this.path.length;
    const rightLength = other.path.length;
    const lengthDiff = leftLength - rightLength;

    let left: ModelElement | null = this.parent;
    let right: ModelElement | null = other.parent;

    if (lengthDiff > 0) {
      // left position is lower than right position
      for (let i = 0; i < lengthDiff; i++) {
        if (!left.parent) {
          throw new PositionError('impossible position');
        }
        left = left.parent;
      }
    } else if (lengthDiff < 0) {
      // right position is lower than left position
      for (let i = 0; i < Math.abs(lengthDiff); i++) {
        if (!right.parent) {
          throw new PositionError('impossible position');
        }
        right = right.parent;
      }
    }

    while (left && right && left !== right) {
      left = left.parent;
      right = right.parent;
    }

    if (left) {
      return left;
    } else {
      return this.root;
    }
  }

  /**
   * Compare two paths and determine their order. A parent is considered to be in front of its children.
   * @param path1
   * @param path2
   */
  static comparePath(path1: number[], path2: number[]): RelativePosition {
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

  /**
   * Split the text node at the position. If position is not inside a textNode, do nothing.
   * If position is at the end or start of a text node, do nothing.
   */
  split(keepRight = false) {
    const before = this.nodeBefore();
    const after = this.nodeAfter();

    if (ModelNode.isModelText(before)) {
      if (before === after) {
        before.split(this.parentOffset - before.getOffset(), keepRight);
      }
      this.parentCache = null;
    }
  }

  /**
   * If position is "inside" a text node, this will return that node.
   * Otherwise, return the node immediately after the cursor.
   */
  nodeAfter(): ModelNode | null {
    if (this.path.length === 0) {
      return this.root;
    }

    return this.parent.childAtOffset(this.parentOffset) || null;
  }

  /**
   * If position is "inside" a text node, this will return that node.
   * Otherwise, return the node immediately before the cursor.
   */
  nodeBefore(): ModelNode | null {
    return this.parent.childAtOffset(this.parentOffset - 1) || null;
  }

  nodeInDirection(direction: Direction): ModelNode | null {
    if (direction === Direction.FORWARDS) {
      return this.nodeAfter();
    } else {
      return this.nodeBefore();
    }
  }

  /**
   * Collects the characters before the position until either one of the following happens:
   * - an element is encountered
   * - we have reached the start of the parent element of the position
   * - we have collected the desired amount of characters
   *
   * as such, the length of the returned string can vary between 0 (no characters found)
   * and amount
   * @param amount
   * @return string the collected characters, in display order
   */
  charactersBefore(amount: number): string {
    return this.charactersInDirection(amount, false);
  }

  /**
   * Collects the characters after the position until either one of the following happens:
   * - an element is encountered
   * - we have reached the start of the parent element of the position
   * - we have collected the desired amount of characters
   *
   * as such, the length of the returned string can vary between 0 (no characters found)
   * and amount
   * @param amount
   * @return string the collected characters, in display order
   */
  charactersAfter(amount: number): string {
    return this.charactersInDirection(amount, true);
  }

  /**
   * Collects the characters in a certain direction before or after the position until either one of the following happens:
   * - an element is encountered
   * - we have reached the start of the parent element of the position
   * - we have collected the desired amount of characters
   *
   * as such, the length of the returned string can vary between 0 (no characters found)
   * and amount
   * @param amount
   * @param forwards The direction in which to look
   * @return string the collected characters, in display order
   */
  charactersInDirection(amount: number, forwards: boolean) {
    const direction = forwards ? 1 : -1;
    let cur = forwards ? this.nodeAfter() : this.nodeBefore();
    let counter = 0;
    const result = [];
    while (ModelNode.isModelText(cur) && counter < amount) {
      const amountToCollect = amount - counter;
      let startSearch;
      if (
        (cur === this.nodeBefore() && forwards) ||
        (cur === this.nodeAfter() && !forwards)
      ) {
        startSearch = this.parentOffset - cur.getOffset();
      } else {
        startSearch = forwards ? 0 : cur.length;
      }

      let i = 0;
      let charIndex = forwards ? startSearch + i : startSearch - 1 - i;
      while (
        i < amountToCollect &&
        ((forwards && charIndex < cur.length) || (!forwards && charIndex >= 0))
      ) {
        result.push(cur.content.charAt(charIndex));
        counter++;
        i++;
        charIndex += direction;
      }
      cur = forwards ? cur.nextSibling : cur.previousSibling;
    }
    if (!forwards) {
      result.reverse();
    }
    return result.join('');
  }

  /**
   * Return a new position which is this position shifted by a certain offset amount.
   * The path of the new position will be identical except for the last element.
   *
   * In other words, the parent of the new position will be the same parent, with
   * the parentOffset the sum of this position's parentOffset and amount (this
   * means negative amounts will shift towards the left), but bounded
   * by 0 and the parent's maxOffset.
   *
   * You can think of it as moving the cursor by amount characters,
   * while never going outside of this positions parent, and counting elements
   * as 1 character.
   * @param amount
   */
  shiftedBy(amount: number): ModelPosition {
    let newOffset = this.parentOffset + amount;
    const maxOffset = this.parent.getMaxOffset();
    if (newOffset < 0) {
      newOffset = 0;
    }
    if (newOffset > maxOffset) {
      newOffset = maxOffset;
    }
    return ModelPosition.fromInElement(this.parent, newOffset);
  }

  _shiftedVisuallyBackwards(steps: number) {
    let stepsToShift = steps;
    let currentPos: ModelPosition = this.clone();

    const startOfDoc = ModelPosition.fromInNode(currentPos.root, 0);
    const walker = GenTreeWalker.fromRange({
      range: new ModelRange(startOfDoc, currentPos),
      reverse: true,
      filter: toFilterSkipFalse(
        (node) =>
          ModelNodeUtils.getVisualLength(node) > 0 &&
          !ModelNodeUtils.parentIsLumpNode(node)
      ),
      visitParentUpwards: true,
    });

    while (stepsToShift > 0) {
      // Check if there are any direct parent elements to the current position which are not visible and traverse out of them.
      while (
        ModelNodeUtils.getVisualLength(currentPos.parent) === 0 &&
        !currentPos.parent.sameAs(this.root) &&
        currentPos.parentOffset === 0
      ) {
        currentPos = ModelPosition.fromBeforeNode(currentPos.parent);
      }
      if (currentPos.isInsideText()) {
        // If the current position is situated inside a text node, traverse in the right direction
        const nextChar = currentPos.charactersBefore(1);

        if (nextChar !== INVISIBLE_SPACE) {
          stepsToShift -= 1;
        }
        currentPos = currentPos.shiftedBy(-1);
      } else {
        // Check if the current position has a direct parent which is visible (such as li, p, header elements)
        // Adjust the number of steps to shift
        let blockNodeFound = false;
        if (
          ModelNodeUtils.getVisualLength(currentPos.parent) > 0 &&
          currentPos.parentOffset === 0
        ) {
          stepsToShift = Math.max(
            stepsToShift - ModelNodeUtils.getVisualLength(currentPos.parent),
            0
          );
          blockNodeFound = true;
        }
        // Get the next leaf node in the step direction
        let nextNode = walker.nextNode();
        // Assert the next leaf is not the node the current position is currently situated on
        while (nextNode && currentPos.nodeAfter() === nextNode) {
          nextNode = walker.nextNode();
        }

        while (
          nextNode &&
          !nextNode.isLeaf &&
          ModelNode.isModelElement(nextNode)
        ) {
          //TODO: Check correctness
          currentPos = ModelPosition.fromInNode(
            nextNode,
            (nextNode.lastChild?.getOffset() || 0) +
              (nextNode.lastChild?.offsetSize || 0)
          );
          if (!blockNodeFound) {
            stepsToShift = Math.min(
              stepsToShift + ModelNodeUtils.getVisualLength(nextNode),
              0
            );
          }
          blockNodeFound = true;
          const previousNode = nextNode;
          nextNode = walker.nextNode();
          if (nextNode && !previousNode.parent?.sameAs(nextNode)) {
            break;
          }
        }
        if (nextNode) {
          if (ModelElement.isModelText(nextNode)) {
            // If the next leaf is text, determine the correct next position based on the number of steps to take
            currentPos = ModelPosition.fromInNode(
              nextNode,
              ModelNodeUtils.getVisibleIndex(
                nextNode,
                Math.abs(stepsToShift),
                false
              )
            );
          } else if (
            ModelNode.isModelElement(nextNode) ||
            ModelNode.isModelInlineComponent(nextNode)
          ) {
            // If the next leaf is a node, set the position after or before the node based on the direction
            if (blockNodeFound && !nextNode.isLeaf) {
              //TODO: Check correctness
              currentPos = ModelPosition.fromInNode(
                nextNode,
                (nextNode.lastChild?.getOffset() || 0) +
                  (nextNode.lastChild?.offsetSize || 0)
              );
              // currentPos = ModelPosition.fromAfterNode(nextNode);
            } else {
              if (nextNode.previousSibling) {
                currentPos = ModelPosition.fromAfterNode(
                  nextNode.previousSibling
                );
              } else {
                currentPos = ModelPosition.fromBeforeNode(nextNode);
              }
            }
          }
          // Update the number of steps to shift based on the visual length of the leaf
          stepsToShift -= ModelNodeUtils.getVisualLength(nextNode);
        } else {
          break;
        }
      }
    }
    return currentPos;
  }

  _shiftedVisuallyForwards(steps: number) {
    let stepsToShift = steps;
    let currentPos: ModelPosition = this.clone();
    const endOfDoc = ModelPosition.fromInNode(
      currentPos.root,
      currentPos.root.getMaxOffset()
    );
    const walker = GenTreeWalker.fromRange({
      range: new ModelRange(currentPos, endOfDoc),
      reverse: false,
      filter: toFilterSkipFalse(
        (node) =>
          ModelNodeUtils.getVisualLength(node) > 0 &&
          !ModelNodeUtils.parentIsLumpNode(node)
      ),
      visitParentUpwards: true,
    });

    while (stepsToShift > 0) {
      // Check if there are any direct parent elements to the current position which are not visible and traverse out of them.
      while (
        ModelNodeUtils.getVisualLength(currentPos.parent) === 0 &&
        !currentPos.parent.sameAs(this.root) &&
        currentPos.parentOffset === currentPos.parent.getMaxOffset()
      ) {
        currentPos = ModelPosition.fromAfterNode(currentPos.parent);
      }
      if (currentPos.isInsideText()) {
        // If the current position is situated inside a text node, traverse in the right direction
        const nextChar = currentPos.charactersAfter(1);
        if (nextChar !== INVISIBLE_SPACE) {
          stepsToShift -= 1;
        }
        currentPos = currentPos.shiftedBy(1);
      } else {
        // Check if the current position has a direct parent which is visible (such as li, p, header elements)
        // Adjust the number of steps to shift
        let blockNodeFound = false;
        if (ModelNodeUtils.getVisualLength(currentPos.parent) > 0) {
          if (currentPos.parentOffset === currentPos.parent.getMaxOffset()) {
            stepsToShift = Math.max(
              stepsToShift - ModelNodeUtils.getVisualLength(currentPos.parent),
              0
            );
            blockNodeFound = true;
          }
        }
        // Get the next leaf node in the step direction
        let nextNode = walker.nextNode();
        // Assert the next leaf is not the node the current position is currently situated on
        while (nextNode && currentPos.nodeBefore() === nextNode) {
          nextNode = walker.nextNode();
        }

        while (
          nextNode &&
          !nextNode.isLeaf &&
          ModelNode.isModelElement(nextNode)
        ) {
          currentPos = ModelPosition.fromInNode(nextNode, 0);
          if (!blockNodeFound) {
            stepsToShift = Math.max(
              stepsToShift - ModelNodeUtils.getVisualLength(nextNode),
              0
            );
          }
          blockNodeFound = true;
          const previousNode = nextNode;
          nextNode = walker.nextNode();
          if (nextNode && !previousNode.parent?.sameAs(nextNode)) {
            break;
          }
        }
        if (nextNode) {
          if (ModelElement.isModelText(nextNode)) {
            // If the next leaf is text, determine the correct next position based on the number of steps to take
            currentPos = ModelPosition.fromInNode(
              nextNode,
              ModelNodeUtils.getVisibleIndex(
                nextNode,
                Math.abs(stepsToShift),
                true
              )
            );
          } else if (
            ModelNode.isModelElement(nextNode) ||
            ModelNode.isModelInlineComponent(nextNode)
          ) {
            // If the next leaf is a node, set the position after or before the node based on the direction

            if (blockNodeFound && !nextNode.isLeaf) {
              currentPos = ModelPosition.fromInNode(nextNode, 0);
            } else {
              if (nextNode.nextSibling) {
                currentPos = ModelPosition.fromInNode(nextNode.nextSibling, 0);
              } else {
                currentPos = ModelPosition.fromAfterNode(nextNode);
              }
            }
          }
          // Update the number of steps to shift based on the visual length of the leaf
          stepsToShift -= ModelNodeUtils.getVisualLength(nextNode);
        } else {
          break;
        }
      }
    }
    return currentPos;
  }

  /**
   * Return a new position which is this position shifted by a certain
   * amount of "visual steps" aka what an end user would expect to happen
   * when hitting the left or right arrowkey "steps" amount of times.
   * Negative values go left, positive values go right.
   * @param steps
   * @returns The new position after having took the provided number of visual steps
   */
  shiftedVisually(steps: number) {
    return steps < 0
      ? this._shiftedVisuallyBackwards(Math.abs(steps))
      : this._shiftedVisuallyForwards(steps);
  }

  /**
   * This returns true if the position is inside a text node (not right before not right after).
   */
  isInsideText(): boolean {
    return (
      this.nodeAfter() === this.nodeBefore() &&
      ModelNode.isModelText(this.nodeAfter()) &&
      ModelNode.isModelText(this.nodeBefore())
    );
  }

  equals(position?: ModelPosition): boolean {
    if (!position) {
      return false;
    }
    return arrayEquals(this.path, position.path);
  }

  clone(modelRoot?: ModelElement): ModelPosition {
    const root = modelRoot ? modelRoot : this.root;
    return ModelPosition.fromPath(root, [...this.path]);
  }

  findAncestors(
    predicate: (elem: ModelElement) => boolean = () => true
  ): ModelElement[] {
    let current = this.parent;
    const result = [];

    while (current !== this.root) {
      if (predicate(current)) {
        result.push(current);
      }

      current = current.parent!;
    }

    if (predicate(current)) {
      result.push(current);
    }

    return result;
  }
}
