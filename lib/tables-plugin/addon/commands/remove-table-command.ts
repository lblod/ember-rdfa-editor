import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";
import ModelTable from "@lblod/ember-rdfa-editor/core/model/model-table";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/archive/utils/errors";
import Command from "@lblod/ember-rdfa-editor/core/command";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";

export default class RemoveTableCommand extends Command<[ModelSelection], void> {
  name = "remove-table";

  constructor(model: EditorModel) {
    super(model);
  }

  canExecute(): boolean {
    return true;
  }

  execute(executedBy: string, selection: ModelSelection = this.model.selection): void {
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }

    const table = ModelTable.getTableFromSelection(selection);
    if (!table) {
      throw new Error('The selection is not inside a table');
    }

    this.model.change(executedBy, mutator => {
      if (table.parent) {
        const offset = table.getOffset();
        if (offset) {
          selection.collapseIn(table.parent, offset);
        } else {
          selection.collapseIn(table.parent);
        }
      }
      table.removeTable(mutator);
    });
  }
}
