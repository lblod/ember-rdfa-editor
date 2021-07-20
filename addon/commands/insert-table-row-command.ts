import Command from "@lblod/ember-rdfa-editor/commands/command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelTable from "@lblod/ember-rdfa-editor/model/model-table";
import {logExecute} from "@lblod/ember-rdfa-editor/utils/logging-utils";

export default abstract class InsertTableRowCommand extends Command {
  abstract insertAbove: boolean;

  constructor(model: Model) {
    super(model);
  }

  @logExecute
  execute(selection: ModelSelection = this.model.selection) {
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
    table.addRow(insertPosition);

    this.model.write();
  }
}
