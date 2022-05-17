import ModelMutator from '@lblod/ember-rdfa-editor/model/mutators/model-mutator';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import InsertOperation from '@lblod/ember-rdfa-editor/model/operations/insert-operation';
import MoveOperation from '@lblod/ember-rdfa-editor/model/operations/move-operation';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import SplitOperation from '@lblod/ember-rdfa-editor/model/operations/split-operation';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import {
  AttributeSpec,
  MarkSet,
  MarkSpec,
} from '@lblod/ember-rdfa-editor/model/mark';
import MarkOperation from '@lblod/ember-rdfa-editor/model/operations/mark-operation';
import EventBus from '@lblod/ember-rdfa-editor/utils/event-bus';
import RangeMapper, {
  LeftOrRight,
} from '@lblod/ember-rdfa-editor/model/range-mapper';
import Operation from '@lblod/ember-rdfa-editor/model/operations/operation';
import InsertTextOperation from '@lblod/ember-rdfa-editor/model/operations/insert-text-operation';

/**
 * {@link ModelMutator} implementation where all operations immediately
 * execute. This means that sequential invocation of multiple
 * methods behave in a natural way, where each invocation can depend
 * on the modified state after the previous.
 */
export default class ImmediateModelMutator extends ModelMutator<ModelRange> {
  private eventbus?: EventBus;
  private mapper: RangeMapper;

  constructor(eventbus?: EventBus) {
    super();
    this.eventbus = eventbus;
    this.mapper = new RangeMapper();
  }

  mapRange(range: ModelRange, bias: LeftOrRight = 'right'): ModelRange {
    return this.mapper.mapRange(range, bias);
  }

  /**
   * @inheritDoc
   * @param range
   * @param nodes
   * @return resultRange the resulting range of the execution
   */
  insertNodes(range: ModelRange, ...nodes: ModelNode[]): ModelRange {
    const op = new InsertOperation(this.eventbus, range, ...nodes);
    return this.executeOperation(op);
  }

  insertAtPosition(position: ModelPosition, ...nodes: ModelNode[]): ModelRange {
    return this.insertNodes(new ModelRange(position, position), ...nodes);
  }

  private executeOperation(op: Operation): ModelRange {
    const { defaultRange, mapper } = op.execute();
    this.mapper.appendMapper(mapper);
    return defaultRange;
  }

  insertText(range: ModelRange, text: string, marks: MarkSet): ModelRange {
    const op = new InsertTextOperation(this.eventbus, range, text, marks);
    return this.executeOperation(op);
  }

  /**
   * @inheritDoc
   * @param rangeToMove
   * @param targetPosition
   * @return resultRange the resulting range of the execution
   */
  moveToPosition(
    rangeToMove: ModelRange,
    targetPosition: ModelPosition
  ): ModelRange {
    const op = new MoveOperation(this.eventbus, rangeToMove, targetPosition);
    return this.executeOperation(op);
  }

  addMark(range: ModelRange, spec: MarkSpec, attributes: AttributeSpec) {
    const op = new MarkOperation(this.eventbus, range, spec, attributes, 'add');
    return this.executeOperation(op);
  }

  removeMark(range: ModelRange, spec: MarkSpec, attributes: AttributeSpec) {
    const op = new MarkOperation(
      this.eventbus,
      range,
      spec,
      attributes,
      'remove'
    );
    return this.executeOperation(op);
  }

  setProperty(element: ModelElement, key: string, value: string): ModelElement {
    const oldNode = element;
    if (!oldNode) throw new Error('no element in range');
    const newNode = oldNode.clone();
    newNode.setAttribute(key, value);
    const oldNodeRange = ModelRange.fromAroundNode(oldNode);
    const op = new InsertOperation(this.eventbus, oldNodeRange, newNode);
    this.executeOperation(op);
    return newNode;
  }

  removeProperty(element: ModelElement, key: string): ModelElement {
    const oldNode = element;
    if (!oldNode) throw new Error('no element in range');
    const newNode = oldNode.clone();
    newNode.removeAttribute(key);
    const oldNodeRange = ModelRange.fromAroundNode(oldNode);
    const op = new InsertOperation(this.eventbus, oldNodeRange, newNode);
    this.executeOperation(op);
    return newNode;
  }

  splitTextAt(position: ModelPosition): ModelPosition {
    const range = new ModelRange(position, position);
    const op = new SplitOperation(this.eventbus, range, false);
    const resultRange = this.executeOperation(op);
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
    const op = new SplitOperation(this.eventbus, range);
    const resultRange = this.executeOperation(op);
    return resultRange.start;
  }

  splitUntil(
    position: ModelPosition,
    untilPredicate: (element: ModelElement) => boolean,
    splitAtEnds = false
  ): ModelPosition {
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

  private executeSplit(
    position: ModelPosition,
    splitAtEnds = false,
    splitParent = true,
    wrapAround = true
  ) {
    if (!splitAtEnds) {
      if (position.parentOffset === 0) {
        return !wrapAround || position.parent === position.root
          ? position
          : ModelPosition.fromBeforeNode(position.parent);
      } else if (position.parentOffset === position.parent.getMaxOffset()) {
        return !wrapAround || position.parent === position.root
          ? position
          : ModelPosition.fromAfterNode(position.parent);
      }
    }

    return this.executeSplitOperation(position, splitParent);
  }

  private executeSplitOperation(position: ModelPosition, splitParent = true) {
    const range = new ModelRange(position, position);
    const op = new SplitOperation(this.eventbus, range, splitParent);
    return this.executeOperation(op).start;
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
  splitRangeUntilElements(
    range: ModelRange,
    startLimit: ModelElement,
    endLimit: ModelElement,
    splitAtEnds = false
  ) {
    const endPos = this.splitUntilElement(range.end, endLimit, splitAtEnds);
    const afterEnd = endPos.nodeAfter();
    const startpos = this.splitUntilElement(
      range.start,
      startLimit,
      splitAtEnds
    );

    if (afterEnd) {
      return new ModelRange(startpos, ModelPosition.fromBeforeNode(afterEnd));
    } else {
      return new ModelRange(
        startpos,
        ModelPosition.fromInElement(endPos.parent, endPos.parent.getMaxOffset())
      );
    }
  }

  splitUntilElement(
    position: ModelPosition,
    limitElement: ModelElement,
    splitAtEnds = false
  ): ModelPosition {
    return this.splitUntil(
      position,
      (element) => element === limitElement,
      splitAtEnds
    );
  }

  /**
   * Replaces the element by its children. Returns a range containing the unwrapped children
   * @param element
   * @param ensureBlock ensure the unwrapped children are rendered as a block by surrounding them with br elements when necessary
   */
  unwrap(element: ModelElement, ensureBlock = false): ModelRange {
    const srcRange = ModelRange.fromInElement(
      element,
      0,
      element.getMaxOffset()
    );
    const target = ModelPosition.fromBeforeNode(element);
    const op = new MoveOperation(this.eventbus, srcRange, target);
    const resultRange = this.executeOperation(op);
    this.deleteNode(element);

    if (ensureBlock) {
      const nodeBeforeStart = resultRange.start.nodeBefore();
      const nodeAfterStart = resultRange.start.nodeAfter();
      const nodeBeforeEnd = resultRange.end.nodeBefore();
      const nodeAfterEnd = resultRange.end.nodeAfter();

      if (
        nodeBeforeEnd &&
        nodeAfterEnd &&
        nodeBeforeEnd !== nodeAfterEnd &&
        !nodeBeforeEnd.isBlock &&
        !nodeAfterEnd.isBlock
      ) {
        this.insertAtPosition(resultRange.end, new ModelElement('br'));
      }
      if (
        nodeBeforeStart &&
        nodeAfterStart &&
        nodeBeforeStart !== nodeAfterStart &&
        !nodeBeforeStart.isBlock &&
        !nodeAfterStart.isBlock
      ) {
        this.insertAtPosition(resultRange.start, new ModelElement('br'));
      }
    }

    return resultRange;
  }

  delete(range: ModelRange): ModelRange {
    const op = new InsertOperation(this.eventbus, range);
    return this.executeOperation(op);
  }

  deleteNode(node: ModelNode): ModelRange {
    const range = ModelRange.fromAroundNode(node);
    return this.delete(range);
  }

}
