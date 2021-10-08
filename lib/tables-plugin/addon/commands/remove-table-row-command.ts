import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";
import ModelTable from "@lblod/ember-rdfa-editor/core/model/model-table";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/archive/utils/errors";
import Command from "@lblod/ember-rdfa-editor/core/command";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";


export default class RemoveTableRowCommand extends Command<[ModelSelection], void> {
  name = "remove-table-row";

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

    const cell = ModelTable.getCellFromSelection(selection);
    if (!cell) {
      throw new Error('The selection is not inside a cell');
    }

    const table = ModelTable.getTableFromSelection(selection);
    if (!table) {
      throw new Error('The selection is not inside a table');
    }

    const position = ModelTable.getCellIndex(cell);
    if (!position || position.y === null) {
      //Shouldn't happen
      throw new Error('Position is null');
    }

    const tableDimensions = table.getDimensions();
    if (position.y === 0 && tableDimensions.y === 1) {
      table.removeTable();
      this.model.write(executedBy);
    } else {
      const cellYToSelect = position.y === tableDimensions.y - 1
        ? position.y - 1
        : position.y + 1;

      const cellToSelect = table.getCell(position.x, cellYToSelect);
      if (cellToSelect) {
        selection.collapseIn(cellToSelect);
      }
      this.model.write(executedBy);

      table.removeRow(position.y);
      this.model.write(executedBy);
    }
  }
}
