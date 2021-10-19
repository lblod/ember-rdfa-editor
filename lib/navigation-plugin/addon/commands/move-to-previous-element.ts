import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";
import Command from "@lblod/ember-rdfa-editor/core/command";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";
import ModelPosition from "@lblod/ember-rdfa-editor/core/model/model-position";
import ModelText from "@lblod/ember-rdfa-editor/core/model/model-text";
import {INVISIBLE_SPACE} from "@lblod/ember-rdfa-editor/util/constants";
import ImmediateModelMutator from "@lblod/ember-rdfa-editor/core/mutators/immediate-model-mutator";

export default class MoveToPreviousElement extends Command<[ModelElement, ModelSelection], void> {
  name = 'move-to-previous-element';

  constructor(model: EditorModel) {
    super(model);
  }

  execute(executedBy: string, element: ModelElement, selection: ModelSelection = this.model.selection) {
    this.model.change(executedBy, mutator => {
      const previousElement = this.findPreviousElement(element, mutator)
      selection.collapseIn(previousElement, previousElement.getMaxOffset());
    });
  }

  findPreviousElement(element: ModelElement, mutator: ImmediateModelMutator) {
    if(element.previousSibling){
      return element.previousSibling;
    } else if(element.parent) {
      return this.findPreviousElement(element.parent, mutator);
    } else {
      const positionBeforeElement = ModelPosition.fromBeforeNode(element);
      const invisibleSpace = new ModelText(INVISIBLE_SPACE);
      mutator.insertAtPosition(positionBeforeElement, invisibleSpace);
      return invisibleSpace;
    }
  }
}