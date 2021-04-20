import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import Model from "@lblod/ember-rdfa-editor/model/model";

export default abstract class ModelMutator<T> {
  protected model: Model;

  constructor(model: Model) {
    this.model = model;
  }

  abstract setTextProperty(range: ModelRange, key: TextAttribute, value: boolean): T;

  abstract insertNodes(range: ModelRange, ...nodes: ModelNode[]): T;

  abstract move(rangeToMove: ModelRange, targetRange: ModelRange): T;

  selectRange(range: ModelRange) {
    this.model.selection.selectRange(range);
  }
}
