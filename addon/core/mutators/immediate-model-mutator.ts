import {Mutator} from "@lblod/ember-rdfa-editor/core/mutator";
import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import InsertOperation from "@lblod/ember-rdfa-editor/core/operations/insert-operation";
import ModelPosition from "@lblod/ember-rdfa-editor/core/model/model-position";
import ModelText, {TextAttribute} from "@lblod/ember-rdfa-editor/core/model/model-text";
import {PropertyState} from "@lblod/ember-rdfa-editor/util/types";
import ModelTreeWalker from "@lblod/ember-rdfa-editor/util/model-tree-walker";
import MoveOperation from "@lblod/ember-rdfa-editor/core/operations/move-operation";
import AttributeOperation from "@lblod/ember-rdfa-editor/core/operations/attribute-operation";
import SplitOperation from "@lblod/ember-rdfa-editor/core/operations/split-operation";
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";

/**
 * {@link Mutator} implementation where all operations immediately
 * execute. This means that sequential invocation of multiple
 * methods behave in a natural way, where each invocation can depend
 * on the modified state after the previous.
 */
export default class ImmediateModelMutator implements Mutator {
  /**
   * @inheritDoc
   * @param range
   * @param nodes
   * @return resultRange the resulting range of the execution
   */
  insertNodes(range: ModelRange, ...nodes: ModelNode[]): ModelRange {
    const op = new InsertOperation(range, ...nodes);
    return op.execute();
  }

  insertAtPosition(position: ModelPosition, ...nodes: ModelNode[]): ModelRange {
    return this.insertNodes(new ModelRange(position, position), ...nodes);
  }

  insertText(range: ModelRange, text: string): ModelRange {
    const textNode = new ModelText(text);
    for (const [attr, val] of range.getTextAttributes().entries()) {
      if (val === PropertyState.enabled) {
        textNode.setTextAttribute(attr, true);
      }
    }
    const op = new InsertOperation(range, textNode);

    const resultRange = op.execute();
    const start = ModelPosition.fromBeforeNode(textNode.previousSibling || textNode);
    const end = ModelPosition.fromAfterNode(textNode.nextSibling || textNode);
    const mergeRange = new ModelRange(start, end);
    this.mergeTextNodesInRange(mergeRange);

    return resultRange;
  }

  mergeTextNodesInRange(range: ModelRange) {
    if (!range.isConfined()) {
      return;
    }
    if (range.collapsed) {
      return;
    }
    const walker = new ModelTreeWalker({range, descend: false});

    const nodes: ModelNode[] = [];
    for (const node of walker) {
      const last = nodes[nodes.length - 1];
      if (ModelNode.isModelText(last) && ModelNode.isModelText(node) && last.isMergeable(node)) {
        last.content += node.content;
      } else {
        nodes.push(node.clone());
      }
    }

    const op = new InsertOperation(range, ...nodes);
    op.execute();
  }

  /**
   * @inheritDoc
   * @param rangeToMove
   * @param targetPosition
   * @return resultRange the resulting range of the execution
   */
  moveToPosition(rangeToMove: ModelRange, targetPosition: ModelPosition): ModelRange {
    const op = new MoveOperation(rangeToMove, targetPosition);
    return op.execute();
  }

  /**
   * @inheritDoc
   * @param range
   * @param key
   * @param value
   * @return resultRange the resulting range of the execution
   */
  setTextProperty(range: ModelRange, key: TextAttribute, value: boolean): ModelRange {
    const op = new AttributeOperation(range, key, value);
    return op.execute();
  }

  splitTextAt(position: ModelPosition): ModelPosition {
    const range = new ModelRange(position, position);
    const op = new SplitOperation(range, false);
    const resultRange = op.execute();
    return resultRange.start;
  }

  splitElementAt(position: ModelPosition, splitAtEnds = false): ModelPosition {
    if (!splitAtEnds) {
      if (position.parentOffset === position.parent.getMaxOffset()) {
        return ModelPosition.fromAfterNode(position.parent);
      }
      if (position.parentOffset === 0) {
        return ModelPosition.fromBeforeNode(position.parent);
      }
    }

    const range = new ModelRange(position, position);
    const op = new SplitOperation(range);
    const resultRange = op.execute();
    return resultRange.start;
  }

  splitUntil(position: ModelPosition, untilPredicate: (element: ModelElement) => boolean, splitAtEnds = false): ModelPosition {
    let pos = position;

    // Execute split at least once
    if (pos.parent === pos.root || untilPredicate(pos.parent)) {
      return this.executeSplit(pos, splitAtEnds, false, false);
    }

    while (pos.parent !== pos.root && !untilPredicate(pos.parent)) {
      pos = this.executeSplit(pos, splitAtEnds, true);
    }

    return pos;
  }

  private executeSplit(position: ModelPosition, splitAtEnds = false, splitParent = true, wrapAround = true) {
    if (!splitAtEnds) {
      if (position.parentOffset === 0) {
        return (!wrapAround || position.parent === position.root) ? position : ModelPosition.fromBeforeNode(position.parent);
      } else if (position.parentOffset === position.parent.getMaxOffset()) {
        return (!wrapAround || position.parent === position.root) ? position : ModelPosition.fromAfterNode(position.parent);
      }
    }

    return this.executeSplitOperation(position, splitParent);
  }

  private executeSplitOperation(position: ModelPosition, splitParent = true) {
    const range = new ModelRange(position, position);
    const op = new SplitOperation(range, splitParent);
    return op.execute().start;
  }

  /**
   * Split the given range until start.parent === startLimit
   * and end.parent === endLimit
   * The resulting range fully contains the split-off elements
   * @param range
   * @param startLimit
   * @param endLimit
   * @param splitAtEnds
   */
  splitRangeUntilElements(range: ModelRange, startLimit: ModelElement, endLimit: ModelElement, splitAtEnds = false): ModelRange {
    const endPos = this.splitUntilElement(range.end, endLimit, splitAtEnds);
    const afterEnd = endPos.nodeAfter();
    const startpos = this.splitUntilElement(range.start, startLimit, splitAtEnds);

    if (afterEnd) {
      return new ModelRange(startpos, ModelPosition.fromBeforeNode(afterEnd));
    } else {
      return new ModelRange(startpos, ModelPosition.fromInElement(endPos.parent, endPos.parent.getMaxOffset()));
    }
  }

  splitUntilElement(position: ModelPosition, limitElement: ModelElement, splitAtEnds = false): ModelPosition {
    return this.splitUntil(position, (element => element === limitElement), splitAtEnds);
  }

  /**
   * Replaces the element by its children. Returns a range containing the unwrapped children
   * @param element
   * @param ensureBlock ensure the unwrapped children are rendered as a block by surrounding them with br elements when necessary
   */
  unwrap(element: ModelElement, ensureBlock = false): ModelRange {
    const srcRange = ModelRange.fromInElement(element, 0, element.getMaxOffset());
    const target = ModelPosition.fromBeforeNode(element);
    const op = new MoveOperation(srcRange, target);
    const resultRange = op.execute();
    this.deleteNode(element);

    if (ensureBlock) {
      const nodeBeforeStart = resultRange.start.nodeBefore();
      const nodeAfterStart = resultRange.start.nodeAfter();
      const nodeBeforeEnd = resultRange.end.nodeBefore();
      const nodeAfterEnd = resultRange.end.nodeAfter();

      if (nodeBeforeEnd && nodeAfterEnd && nodeBeforeEnd !== nodeAfterEnd && !nodeBeforeEnd.isBlock && !nodeAfterEnd.isBlock) {
        this.insertAtPosition(resultRange.end, new ModelElement("br"));
      }
      if (nodeBeforeStart && nodeAfterStart && nodeBeforeStart !== nodeAfterStart && !nodeBeforeStart.isBlock && !nodeAfterStart.isBlock) {
        this.insertAtPosition(resultRange.start, new ModelElement("br"));
      }
    }

    return resultRange;
  }

  delete(range: ModelRange): ModelRange {
    const op = new InsertOperation(range);
    return op.execute();
  }

  deleteNode(node: ModelNode): ModelRange {
    const range = ModelRange.fromAroundNode(node);
    return this.delete(range);
  }
}
