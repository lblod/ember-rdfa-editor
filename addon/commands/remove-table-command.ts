import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import ModelTable from '@lblod/ember-rdfa-editor/model/model-table';
import { MisbehavedSelectionError } from '@lblod/ember-rdfa-editor/utils/errors';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import Command, { CommandContext } from './command';
export interface RemoveTableCommandArgs {
  selection?: ModelSelection;
}

export default class RemoveTableCommand
  implements Command<RemoveTableCommandArgs, void>
{
  name = 'remove-table';

  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(
    { state, dispatch }: CommandContext,
    { selection = state.selection }: RemoveTableCommandArgs
  ): void {
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }

    const table = ModelTable.getTableFromSelection(selection);
    if (!table) {
      throw new Error('The selection is not inside a table');
    }
    const tr = state.createTransaction();

    if (table.parent) {
      const offset = table.getOffset();
      if (offset) {
        tr.collapseIn(table.parent, offset);
      } else {
        tr.collapseIn(table.parent);
      }
    }
    table.removeTable(tr);
    dispatch(tr);
  }
}
