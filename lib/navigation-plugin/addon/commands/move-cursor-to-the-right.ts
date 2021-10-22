import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";
import Command from "@lblod/ember-rdfa-editor/core/command";
import {MutableModel} from "@lblod/ember-rdfa-editor/core/editor-model";
import MoveToNextElement from "navigation-plugin/commands/move-to-next-element-command";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";

export default class MoveCursorToTheRight extends Command<[ModelSelection], void> {
  name = 'move-cursor-to-the-right';

  constructor(model: MutableModel) {
    super(model);
  }

  execute(executedBy: string, selection: ModelSelection = this.model.selection): void {
    const selectionEndPosition = selection.getRangeAt(0).end;
    const selectionEndParent = selectionEndPosition.parent;
    const selectionEndParentOffset = selectionEndPosition.parentOffset;
    if (selectionEndParentOffset === selectionEndParent.getMaxOffset()) {
      const moveToNextElementCommand = new MoveToNextElement(this.model);
      const actualRange = new ModelRange(selectionEndPosition, selectionEndPosition);
      moveToNextElementCommand.execute(executedBy, actualRange);
    } else {
      const nextCursorElement = selectionEndParent.childAtOffset(selectionEndParentOffset + 1, true);
      if (ModelElement.isModelElement(nextCursorElement)) {
        this.model.change(executedBy, () => {
          selection.collapseIn(nextCursorElement, 0);
        });
      } else {
        this.model.change(executedBy, () => {
          selection.collapseIn(selectionEndParent, selectionEndParentOffset + 1);
        });
      }
    }
  }
}
