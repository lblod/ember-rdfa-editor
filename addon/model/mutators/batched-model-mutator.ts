import {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";
import Operation from "@lblod/ember-rdfa-editor/model/operations/operation";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import AttributeOperation from "@lblod/ember-rdfa-editor/model/operations/attribute-operation";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import InsertOperation from "@lblod/ember-rdfa-editor/model/operations/insert-operation";
import MoveOperation from "@lblod/ember-rdfa-editor/model/operations/move-operation";
import ModelMutator from "@lblod/ember-rdfa-editor/model/mutators/model-mutator";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";

/**
 * {@link ModelMutator} implementation where any operations are batched
 * and have to be manually flushed.
 */
export default class BatchedModelMutator extends ModelMutator<void> {

  private batch: Operation[] = [];

  setTextProperty(range: ModelRange, key: TextAttribute, value: boolean) {
    const op = new AttributeOperation(range, key, String(value));
    this.batch.push(op);
  }

  insertNodes(range: ModelRange, ...nodes: ModelNode[]) {
    const op = new InsertOperation(range, ...nodes);
    this.batch.push(op);
  }

  moveToPos(rangeToMove: ModelRange, targetPos: ModelPosition) {
    const op = new MoveOperation(rangeToMove, targetPos);
    this.batch.push(op);
  }

  /**
   * Execute all batched operations sequentially
   * @return resultingRange the resulting range of the last execution
   */
  flush(): ModelRange | null {
    let resultingRange = null;
    for (const op of this.batch) {
      resultingRange = op.execute();
    }
    this.batch = [];
    return resultingRange;
  }
}

