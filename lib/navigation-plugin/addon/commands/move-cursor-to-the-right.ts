import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";
import Command from "@lblod/ember-rdfa-editor/core/command";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";
import MoveToNextElement from "navigation-plugin/commands/move-to-next-element-command";

export default class MoveCursorToTheRight extends Command<[ModelElement, ModelSelection], void> {
  name = 'move-cursor-to-the-right';

  constructor(model: EditorModel) {
    super(model);
  }

  execute(executedBy: string, element: ModelElement, selection: ModelSelection = this.model.selection) {
    this.model.change(executedBy, mutator => {
      const selectionEndPosition = selection.getRangeAt(0).end;
      const selectionEndParent = selectionEndPosition.parent;
      const selectionEndParentOffset = selectionEndPosition.parentOffset;
      if(selectionEndParentOffset === selectionEndParent.getMaxOffset()) {
        const moveToNextElementCommand = new MoveToNextElement(this.model);
        moveToNextElementCommand.execute(executedBy, selectionEndPosition.nodeAfter())
      } else {
        const nextCursorElement = selectionEndParent.childAtOffset(selectionEndParentOffset + 1, true);
        if(ModelElement.isModelElement(nextCursorElement)) {
          selection.collapseIn(nextCursorElement, 0);
        } else {
          selection.collapseIn(selectionEndParent, selectionEndParentOffset + 1);
        }
      }
    });
  }
}