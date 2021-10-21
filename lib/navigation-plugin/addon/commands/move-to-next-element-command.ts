import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";
import Command from "@lblod/ember-rdfa-editor/core/command";
import {MutableModel} from "@lblod/ember-rdfa-editor/core/editor-model";
import ModelPosition from "@lblod/ember-rdfa-editor/core/model/model-position";
import ModelText from "@lblod/ember-rdfa-editor/core/model/model-text";
import {INVISIBLE_SPACE} from "@lblod/ember-rdfa-editor/util/constants";
import {Mutator} from "@lblod/ember-rdfa-editor/core/mutator";
import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";

export default class MoveToNextElement extends Command<[ModelElement, ModelSelection], void> {
  name = 'move-to-next-element';

  constructor(model: MutableModel) {
    super(model);
  }

  execute(executedBy: string, element: ModelElement, selection: ModelSelection = this.model.selection) {
    this.model.change(executedBy, mutator => {
      const nextElement = this.findNextElement(element, mutator);
      selection.collapseIn(nextElement);
    });
  }

  findNextElement(element: ModelElement, mutator: Mutator): ModelNode {
    if (element.nextSibling) {
      return element.nextSibling;
    } else if (element.parent && element.parent !== element.root) {
      return this.findNextElement(element.parent, mutator);
    } else {
      const positionAfterElement = ModelPosition.fromAfterNode(element);
      const invisibleSpace = new ModelText(INVISIBLE_SPACE);
      mutator.insertAtPosition(positionAfterElement, invisibleSpace);
      return invisibleSpace;
    }
  }
}
