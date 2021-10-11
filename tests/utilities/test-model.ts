import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";
import {ModelError} from "@lblod/ember-rdfa-editor/archive/utils/errors";
import {HtmlModel} from "@lblod/ember-rdfa-editor/core/editor-model";
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";

export default class TestModel extends HtmlModel {
  private shouldWriteSelection = true;

  public read(readSelection = true) {
    super.read(readSelection);
  }

  public write(source: string = "test-model", tree: ModelElement = this.rootModelNode, writeSelection = true) {
    super.write(source, tree, writeSelection);
  }

  fillRoot(node: ModelNode) {
    if (ModelNode.isModelElement(node)) {
      this.rootModelNode.children = [];
      this.rootModelNode.appendChildren(...node.children);
    } else if (ModelNode.isModelText(node)) {
      this.rootModelNode.addChild(node);
    } else {
      throw new ModelError("Non-element, non-text nodes not supported here");
    }

    this.write("test-model", this.rootModelNode);
  }

  disableSelectionWriting() {
    this.shouldWriteSelection = false;
  }

  enableSelectionWriting() {
    this.shouldWriteSelection = true;
  }

  writeSelection() {
    if (this.shouldWriteSelection) {
      super.writeSelection();
    }
  }
}
