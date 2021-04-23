import ModelMutator from "@lblod/ember-rdfa-editor/model/mutators/model-mutator";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import AttributeOperation from "@lblod/ember-rdfa-editor/model/operations/attribute-operation";
import InsertOperation from "@lblod/ember-rdfa-editor/model/operations/insert-operation";
import MoveOperation from "@lblod/ember-rdfa-editor/model/operations/move-operation";
import {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import SplitOperation from "@lblod/ember-rdfa-editor/model/operations/split-operation";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";

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

  /**
   * @inheritDoc
   * @param rangeToMove
   * @param targetRange
   * @return resultRange the resulting range of the execution
   */
  moveToPos(rangeToMove: ModelRange, targetPos: ModelPosition): ModelRange {
    const op = new MoveOperation(rangeToMove, targetPos);
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

  splitElementAt(position: ModelPosition): ModelPosition {
    const range = new ModelRange(position, position);
    const op = new SplitOperation(range);
    const resultRange = op.execute();
    return resultRange.start;
  }

  splitUntil(position: ModelPosition, untilPredicate: (element: ModelElement) => boolean): ModelPosition {
    let range = new ModelRange(position, position);
    while(!untilPredicate(range.start.parent)) {
      const op = new SplitOperation(range);
      range = op.execute();
    }
    return range.start;
  }

}
