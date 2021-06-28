import Command from "./command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelTable from "@lblod/ember-rdfa-editor/model/model-table";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import {logExecute} from "@lblod/ember-rdfa-editor/utils/logging-utils";


export default class InsertTableColumnBeforeCommand extends Command {
  name = "insert-table-column-before";

  constructor(model: Model) {
    super(model);
  }

  canExecute(): boolean {
    return true;
  }

  @logExecute
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

    if(!position || position.x === null) {
      //Shouldn't happen
      throw new Error('Position is null');
    }

    table.addColumn(position.x);

    this.model.write();
  }
}
