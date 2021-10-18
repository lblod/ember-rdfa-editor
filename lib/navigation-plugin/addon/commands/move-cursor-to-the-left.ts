import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";
import Command from "@lblod/ember-rdfa-editor/core/command";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";
import MoveToPreviousElement from "navigation-plugin/commands/move-to-previous-element";

export default class MoveCursorToTheLeft extends Command<[ModelElement, ModelSelection], void> {
  name = 'move-cursor-to-the-left';

  constructor(model: EditorModel) {
    super(model);
  }

  execute(executedBy: string, element: ModelElement, selection: ModelSelection = this.model.selection) {
    this.model.change(executedBy, mutator => {
      const selectionStartPosition = selection.getRangeAt(0).start;
      const selectionStartParent = selectionStartPosition.parent;
      const selectionStartParentOffset = selectionStartPosition.parentOffset;
      if(selectionStartParentOffset === 0) {
        const moveToPreviousElementCommand = new MoveToPreviousElement(this.model);
        moveToPreviousElementCommand.execute(executedBy, selectionStartPosition.parent)
      } else {
        const previousCursorElement = selectionStartParent.childAtOffset(selectionStartParentOffset - 1);
        if(ModelElement.isModelElement(previousCursorElement)) {
          selection.collapseIn(previousCursorElement, previousCursorElement.getMaxOffset());
        } else {
          selection.collapseIn(selectionStartParent, selectionStartParentOffset - 1);
        }
      }
    });
  }
}