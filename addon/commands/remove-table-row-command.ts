import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import ModelTable from '@lblod/ember-rdfa-editor/model/model-table';
import { MisbehavedSelectionError } from '@lblod/ember-rdfa-editor/utils/errors';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import Command, { CommandContext } from './command';

export interface RemoveTableRowCommandArgs {
  selection?: ModelSelection;
}

export default class RemoveTableRowCommand
  implements Command<RemoveTableRowCommandArgs, void>
{
  name = 'remove-table-row';

  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(
    { state, dispatch }: CommandContext,
    { selection = state.selection }: RemoveTableRowCommandArgs
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
    const tr = state.createTransaction();
    if (position.y === 0 && tableDimensions.y === 1) {
      table.removeTable(tr);
    } else {
      const cellYToSelect =
        position.y === tableDimensions.y - 1 ? position.y - 1 : position.y;

      const cellToSelect = table.getCell(position.x, cellYToSelect);

      if (cellToSelect) {
        tr.collapseIn(cellToSelect);
      }
      table.removeRow(tr, position.y);
    }
    dispatch(tr);
  }
}
