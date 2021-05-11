import Command from "./command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelTable from "@lblod/ember-rdfa-editor/model/model-table";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";


export default class InsertTableRowAboveCommand extends Command {
  name = "insert-table-row-above";

  constructor(model: Model) {
    super(model);
  }

  canExecute(): boolean {
    return true;
  }

  execute(): void {

    const selection= this.model.selection;
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }

    const cell = ModelTable.getCellFromSelection(selection);
    if(!cell) {
      throw Error('The selection is not inside a cell');
    }

    const table = ModelTable.getTableFromSelection(selection);

    if(!table) {
      throw Error('The selection is not inside a table');
    }

    const position = ModelTable.getCellIndex(cell);
    table.addRow(position.y);

    this.model.write();
  }
}
