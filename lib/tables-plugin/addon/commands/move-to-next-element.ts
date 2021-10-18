import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";
import Command from "@lblod/ember-rdfa-editor/core/command";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";
import ModelPosition from "@lblod/ember-rdfa-editor/core/model/model-position";
import ModelText from "@lblod/ember-rdfa-editor/core/model/model-text";
import {INVISIBLE_SPACE} from "@lblod/ember-rdfa-editor/util/constants";

export default class MoveToNextElement extends Command<[ModelElement, ModelSelection], void> {
  name = 'move-to-next-element';

  constructor(model: EditorModel) {
    super(model);
  }

  execute(executedBy: string, element: ModelElement, selection: ModelSelection = this.model.selection) {
    this.model.change(executedBy, mutator => {
      if(element.nextSibling) {
        selection.collapseIn(element.nextSibling);
      } else {
        const positionAfterTable = ModelPosition.fromAfterNode(element);
        const invisibleSpace = new ModelText(INVISIBLE_SPACE);
        mutator.insertAtPosition(positionAfterTable, invisibleSpace);
        selection.collapseIn(invisibleSpace);
      }
    });
  }
}
