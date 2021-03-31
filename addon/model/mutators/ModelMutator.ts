import {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";
import Operation from "@lblod/ember-rdfa-editor/model/operations/operation";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import AttributeOperation from "@lblod/ember-rdfa-editor/model/operations/attribute-operation";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import InsertOperation from "@lblod/ember-rdfa-editor/model/operations/insert-operation";

export default class ModelMutator {

  private batch: Operation[] = [];

  setTextProperty(range: ModelRange, key: TextAttribute, value: boolean) {
    const op = new AttributeOperation(range, key, String(value));
    this.batch.push(op);
  }

  insertNode(range: ModelRange, node: ModelNode) {
    const op = new InsertOperation(range, node);
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

