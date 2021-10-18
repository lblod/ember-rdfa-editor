import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/archive/utils/errors";
import ModelTable from "@lblod/ember-rdfa-editor/core/model/model-table";
import Command from "@lblod/ember-rdfa-editor/core/command";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";

export default abstract class InsertTableRowCommand extends Command<[ModelSelection], void> {
  abstract insertAbove: boolean;

  constructor(model: EditorModel) {
    super(model);
  }

  execute(executedBy: string, selection: ModelSelection = this.model.selection) {
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }

    const cell = ModelTable.getCellFromSelection(selection);
    if (!cell) {
      throw Error('The selection is not inside a cell');
    }

    const table = ModelTable.getTableFromSelection(selection);
    if (!table) {
      throw Error('The selection is not inside a table');
    }

    const position = ModelTable.getCellIndex(cell);
    if (!position || position.y === null) {
      //Shouldn't happen
      throw new Error('Position is null');
    }

    const insertPosition = this.insertAbove ? position.y : position.y + 1;

    this.model.change(executedBy, mutator => {
      table.addRow(mutator, insertPosition);
    });

  }
}
