import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import ModelTable from '@lblod/ember-rdfa-editor/model/nodes/model-table';
import { MisbehavedSelectionError } from '@lblod/ember-rdfa-editor/utils/errors';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
export interface InsertTableRowCommandArgs {
  selection?: ModelSelection;
}

export default abstract class InsertTableRowCommand
  implements Command<InsertTableRowCommandArgs, void>
{
  abstract insertAbove: boolean;

  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(
    { transaction }: CommandContext,
    { selection = transaction.workingCopy.selection }: InsertTableRowCommandArgs
  ) {
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

    table.addRow(transaction, insertPosition);
  }
}
