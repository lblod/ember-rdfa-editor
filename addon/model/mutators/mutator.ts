import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";

export default interface ModelMutator<T>{

  setTextProperty(range: ModelRange, key: TextAttribute, value: boolean): T;
  insertNodes(range: ModelRange, ...nodes: ModelNode[]): T;
  move(rangeToMove: ModelRange, targetRange: ModelRange): T;
}
