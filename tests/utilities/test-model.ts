import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {ModelError} from "@lblod/ember-rdfa-editor/utils/errors";

export default class TestModel extends Model{
  private shouldWriteSelection = true;
  fillRoot(node: ModelNode) {
    if(ModelNode.isModelElement(node)) {
      this._rootModelNode.children = node.children;
    } else if (ModelNode.isModelText(node)) {
      this.rootModelNode.addChild(node);
    } else {
      throw new ModelError("Non-element, non-text nodes not supported here");
    }
  }
  disableSelectionWriting() {
    this.shouldWriteSelection = false;
  }
  enableSelectionWriting() {
    this.shouldWriteSelection = true;
  }
  writeSelection() {
    if(this.shouldWriteSelection) {
      super.writeSelection();
    }
  }
}
