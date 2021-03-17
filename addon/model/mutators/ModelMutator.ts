import {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";
import Operation from "@lblod/ember-rdfa-editor/model/operations/operation";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import AttributeOperation from "@lblod/ember-rdfa-editor/model/operations/attribute-operation";

export default class ModelMutator {

  private batch: Operation[] = [];

  setTextProperty(range: ModelRange, key: TextAttribute, value: boolean) {
    const op = new AttributeOperation(range, key, String(value));
    this.batch.push(op);
  }
  flush() {
    for (const op of this.batch) {
      op.execute();
    }
    this.batch = [];
  }
}

