import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";
import {ModelError} from "@lblod/ember-rdfa-editor/archive/utils/errors";

export default class TestModel extends Model {
  private shouldWriteSelection = true;

  fillRoot(node: ModelNode) {
    if (ModelNode.isModelElement(node)) {
      this._rootModelNode.children = [];
      this._rootModelNode.appendChildren(...node.children);
    } else if (ModelNode.isModelText(node)) {
      this.rootModelNode.addChild(node);
    } else {
      throw new ModelError("Non-element, non-text nodes not supported here");
    }

    this.write();
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
