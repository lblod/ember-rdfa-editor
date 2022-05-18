import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import ModelTable from '@lblod/ember-rdfa-editor/model/model-table';
import { MisbehavedSelectionError } from '@lblod/ember-rdfa-editor/utils/errors';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
export interface InsertTableColumnCommandArgs {
  selection?: ModelSelection;
}

export default abstract class InsertTableColumnCommand
  implements Command<InsertTableColumnCommandArgs, void>
{
  name = 'insert-table-column';
  abstract insertBefore: boolean;

  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(
    { state, dispatch }: CommandContext,
    { selection = state.selection }: InsertTableColumnCommandArgs
  ) {
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
    if (!position || position.x === null) {
      //Shouldn't happen
      throw new Error('Position is null');
    }
    const tr = state.createTransaction();

    const insertPosition = this.insertBefore ? position.x : position.x + 1;
    table.addColumn(tr, insertPosition);

    dispatch(tr);
  }
}
