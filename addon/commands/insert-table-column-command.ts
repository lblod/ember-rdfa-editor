import Command from "@lblod/ember-rdfa-editor/commands/command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelTable from "@lblod/ember-rdfa-editor/model/model-table";

export default class InsertTableColumnCommand extends Command {
  name = "insert-table-column";

  constructor(model: Model) {
    super(model);
  }

  execute(before: boolean, selection: ModelSelection = this.model.selection) {
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

    const insertPosition = before ? position.x : position.x + 1;
    table.addColumn(insertPosition);

    this.model.write();
  }
}
