import ModelSelection from '@lblod/ember-rdfa-editor/core/model/model-selection';
import ModelTable from '@lblod/ember-rdfa-editor/core/model/nodes/model-table';
import { MisbehavedSelectionError } from '@lblod/ember-rdfa-editor/utils/errors';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import Command, { CommandContext } from './command';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    removeTableRow: RemoveTableRowCommand;
  }
}
export interface RemoveTableRowCommandArgs {
  selection?: ModelSelection;
}

export default class RemoveTableRowCommand
  implements Command<RemoveTableRowCommandArgs, void>
{
  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(
    { transaction }: CommandContext,
    { selection = transaction.workingCopy.selection }: RemoveTableRowCommandArgs
  ): void {
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
      table.removeTable(transaction);
    } else {
      const cellYToSelect =
        position.y === tableDimensions.y - 1 ? position.y - 1 : position.y;

      const cellToSelect = table.getCell(position.x, cellYToSelect);

      if (cellToSelect) {
        transaction.collapseIn(cellToSelect);
      }
      table.removeRow(transaction, position.y);
    }
  }
}
