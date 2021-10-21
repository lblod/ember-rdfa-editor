import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";
import Command from "@lblod/ember-rdfa-editor/core/command";
import {MutableModel} from "@lblod/ember-rdfa-editor/core/editor-model";
import ModelPosition from "@lblod/ember-rdfa-editor/core/model/model-position";
import ModelText from "@lblod/ember-rdfa-editor/core/model/model-text";
import {INVISIBLE_SPACE} from "@lblod/ember-rdfa-editor/util/constants";
import { Mutator } from "@lblod/ember-rdfa-editor/core/mutator";
import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";

export default class MoveToPreviousElement extends Command<[ModelElement, ModelSelection], void> {
  name = 'move-to-previous-element';

  constructor(model: MutableModel) {
    super(model);
  }

  execute(executedBy: string, element: ModelElement, selection: ModelSelection = this.model.selection) {
    this.model.change(executedBy, mutator => {
      const previousElement = this.findPreviousElement(element, mutator);
      if (ModelNode.isModelElement(previousElement)) {
        selection.collapseIn(previousElement, previousElement.getMaxOffset());
      } else {
        selection.collapseIn(previousElement, previousElement.length);
      }
    });
  }

  findPreviousElement(element: ModelElement, mutator: Mutator): ModelNode {
    if (element.previousSibling) {
      return element.previousSibling;
    } else if (element.parent && element.parent !== element.root) {
      return this.findPreviousElement(element.parent, mutator);
    } else {
      const positionBeforeElement = ModelPosition.fromBeforeNode(element);
      const invisibleSpace = new ModelText(INVISIBLE_SPACE);
      mutator.insertAtPosition(positionBeforeElement, invisibleSpace);
      return invisibleSpace;
    }
  }
}
