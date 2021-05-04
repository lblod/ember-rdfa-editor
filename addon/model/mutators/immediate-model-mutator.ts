import ModelMutator from "@lblod/ember-rdfa-editor/model/mutators/model-mutator";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import AttributeOperation from "@lblod/ember-rdfa-editor/model/operations/attribute-operation";
import InsertOperation from "@lblod/ember-rdfa-editor/model/operations/insert-operation";
import MoveOperation from "@lblod/ember-rdfa-editor/model/operations/move-operation";
import ModelText, {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import SplitOperation from "@lblod/ember-rdfa-editor/model/operations/split-operation";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import {PropertyState} from "@lblod/ember-rdfa-editor/model/util/types";
import ModelTreeWalker from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";

/**
 * {@link ModelMutator} implementation where all operations immediately
 * execute. This means that sequential invocation of multiple
 * methods behave in a natural way, where each invocation can depend
 * on the modified state after the previous.
 */
export default class ImmediateModelMutator extends ModelMutator<ModelRange> {

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
      if(val === PropertyState.enabled) {
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

  private mergeTextNodesInRange(range: ModelRange) {
    if (!range.isConfined()) {
      return;
    }
    if(range.collapsed) {
      return;
    }
    const walker = new ModelTreeWalker({range, descend: false});

    const nodes: ModelNode[] = [];
    for (const node of walker) {
      const last = nodes[nodes.length - 1];
      if(ModelNode.isModelText(last) && ModelNode.isModelText(node) && last.isMergeable(node)) {
        last.content += node.content;
      } else {
        nodes.push(node.clone());
      }
    }

    const op = new InsertOperation(range, ...nodes);
    op.execute();
  }

  /**
   * Merge two text nodes. Both nodes will be replaced by a new node with content
   * equal to left.content + right.content
   * If nodes are not siblings, do nothing
   * @param left
   * @param right
   * @return resultPosition a position at the end of the left node, which will be at the boundary of the original
   * if the merge was successful
   */
  mergeSiblingTextNodes(left: ModelText, right: ModelText): ModelPosition {
    const resultPosition = ModelPosition.fromAfterNode(left);
    if (left.nextSibling !== right) {
      return resultPosition;
    }
    const newNode = left.clone();
    newNode.content += right.content;
    const start = ModelPosition.fromBeforeNode(left);
    const end = ModelPosition.fromAfterNode(right);
    const replaceRange = new ModelRange(start, end);
    const op = new InsertOperation(replaceRange, newNode);
    op.execute();
    resultPosition.invalidateParentCache();
    return resultPosition;

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
    const op = new AttributeOperation(range, key, String(value));
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
    while (pos.parent !== pos.root && !untilPredicate(pos.parent)) {
      if (splitAtEnds) {
        const range = new ModelRange(pos, pos);
        const op = new SplitOperation(range);
        pos = op.execute().start;
      } else {
        if (pos.parentOffset === 0) {
          pos = ModelPosition.fromBeforeNode(pos.parent);
        } else if (pos.parentOffset === pos.parent.getMaxOffset()) {
          pos = ModelPosition.fromAfterNode(pos.parent);
        } else {
          const range = new ModelRange(pos, pos);
          const op = new SplitOperation(range);
          pos = op.execute().start;
        }
      }
    }
    return pos;
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
  splitRangeUntilElements(range: ModelRange, startLimit: ModelElement, endLimit: ModelElement, splitAtEnds = false) {
    const endpos = this.splitUntilElement(range.end, endLimit, splitAtEnds);
    const afterEnd = endpos.nodeAfter();
    const startpos = this.splitUntilElement(range.start, startLimit, splitAtEnds);
    if (afterEnd) {

      return new ModelRange(startpos, ModelPosition.fromBeforeNode(afterEnd));
    } else {
      return new ModelRange(startpos, ModelPosition.fromInElement(range.root, range.root.getMaxOffset()));
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
