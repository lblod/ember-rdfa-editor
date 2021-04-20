import ModelMutator from "@lblod/ember-rdfa-editor/model/mutators/mutator";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import AttributeOperation from "@lblod/ember-rdfa-editor/model/operations/attribute-operation";
import InsertOperation from "@lblod/ember-rdfa-editor/model/operations/insert-operation";
import MoveOperation from "@lblod/ember-rdfa-editor/model/operations/move-operation";
import {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";

export default class ImmediateModelMutator implements ModelMutator<ModelRange> {
  insertNodes(range: ModelRange, ...nodes: ModelNode[]): ModelRange {
    const op = new InsertOperation(range, ...nodes);
    return op.execute();
  }

  move(rangeToMove: ModelRange, targetRange: ModelRange): ModelRange {
    const op = new MoveOperation(rangeToMove, targetRange);
    return op.execute();
  }

  setTextProperty(range: ModelRange, key: TextAttribute, value: boolean): ModelRange {
    const op = new AttributeOperation(range, key, String(value));
    return op.execute();
  }

}
