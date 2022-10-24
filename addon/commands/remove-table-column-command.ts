import ModelSelection from '@lblod/ember-rdfa-editor/core/model/model-selection';
import ModelTable from '@lblod/ember-rdfa-editor/core/model/nodes/model-table';
import { MisbehavedSelectionError } from '@lblod/ember-rdfa-editor/utils/errors';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import Command, { CommandContext } from './command';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    removeTableColumn: RemoveTableColumnCommand;
  }
}

export interface RemoveTableColumnCommandArgs {
  selection?: ModelSelection;
}

export default class RemoveTableColumnCommand
  implements Command<RemoveTableColumnCommandArgs, void>
{
  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(
    { transaction }: CommandContext,
    {
      selection = transaction.workingCopy.selection,
    }: RemoveTableColumnCommandArgs
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

    const position = ModelTable.getCellIndex(transaction.currentDocument, cell);
    if (!position || position.x === null) {
      //Shouldn't happen
      throw new Error('Position is null');
    }

    const tableDimensions = table.getDimensions();
    if (position.x === 0 && tableDimensions.x === 1) {
      table.removeTable(transaction);
    } else {
      const cellXToSelect =
        position.x === tableDimensions.x - 1 ? position.x - 1 : position.x;

      const cellToSelect = table.getCell(cellXToSelect, position.y);

      if (cellToSelect) {
        transaction.collapseIn(cellToSelect);
      }
      table.removeColumn(transaction, position.x);
    }
  }
}
