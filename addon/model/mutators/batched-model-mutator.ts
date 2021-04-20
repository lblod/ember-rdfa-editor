import {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";
import Operation from "@lblod/ember-rdfa-editor/model/operations/operation";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import AttributeOperation from "@lblod/ember-rdfa-editor/model/operations/attribute-operation";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import InsertOperation from "@lblod/ember-rdfa-editor/model/operations/insert-operation";
import MoveOperation from "@lblod/ember-rdfa-editor/model/operations/move-operation";
import ModelMutator from "@lblod/ember-rdfa-editor/model/mutators/mutator";


export default class BatchedModelMutator implements ModelMutator<void> {

  private batch: Operation[] = [];

  setTextProperty(range: ModelRange, key: TextAttribute, value: boolean) {
    const op = new AttributeOperation(range, key, String(value));
    this.batch.push(op);
  }

  insertNodes(range: ModelRange, ...nodes: ModelNode[]) {
    const op = new InsertOperation(range, ...nodes);
    this.batch.push(op);
  }

  move(rangeToMove: ModelRange, targetRange: ModelRange) {
    const op = new MoveOperation(rangeToMove, targetRange);
    this.batch.push(op);

  }

  flush(): ModelRange | null {
    let resultingRange = null;
    for (const op of this.batch) {
      resultingRange = op.execute();
    }
    this.batch = [];
    return resultingRange;
  }
}

