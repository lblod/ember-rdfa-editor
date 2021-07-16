import Command from "./command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelTable from "@lblod/ember-rdfa-editor/model/model-table";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import {logExecute} from "@lblod/ember-rdfa-editor/utils/logging-utils";


export default class RemoveTableColumnCommand extends Command {
  name = "remove-table-column";

  constructor(model: Model) {
    super(model);
  }

  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(selection: ModelSelection = this.model.selection): void {
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }

    const cell = ModelTable.getCellFromSelection(selection);
    if(!cell) {
      throw new Error('The selection is not inside a cell');
    }

    const table = ModelTable.getTableFromSelection(selection);
    if(!table) {
      throw new Error('The selection is not inside a table');
    }

    const position = ModelTable.getCellIndex(cell);
    if(!position || position.x === null) {
      //Shouldn't happen
      throw new Error('Position is null');
    }

    const tableDimensions = table.getDimensions();
    if (position.x === 0 && tableDimensions.x === 1) {
      table.removeTable();
      this.model.write();
    } else {
      const cellXToSelect = position.x === tableDimensions.x - 1
        ? position.x - 1
        : position.x + 1;

      const cellToSelect = table.getCell(cellXToSelect, position.y);
      if (cellToSelect) {
        selection.collapseIn(cellToSelect);
      }
      this.model.write();

      table.removeColumn(position.x);
      this.model.write();
    }
  }
}
