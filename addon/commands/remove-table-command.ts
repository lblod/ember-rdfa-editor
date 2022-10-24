import ModelSelection from '@lblod/ember-rdfa-editor/core/model/model-selection';
import ModelTable from '@lblod/ember-rdfa-editor/core/model/nodes/model-table';
import { MisbehavedSelectionError } from '@lblod/ember-rdfa-editor/utils/errors';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import Command, { CommandContext } from './command';
import unwrap from '@lblod/ember-rdfa-editor/utils/unwrap';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    removeTable: RemoveTableCommand;
  }
}

export interface RemoveTableCommandArgs {
  selection?: ModelSelection;
}

export default class RemoveTableCommand
  implements Command<RemoveTableCommandArgs, void>
{
  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(
    { transaction }: CommandContext,
    { selection = transaction.workingCopy.selection }: RemoveTableCommandArgs
  ): void {
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }

    const table = ModelTable.getTableFromSelection(selection);
    if (!table) {
      throw new Error('The selection is not inside a table');
    }

    if (table.getParent(transaction.currentDocument)) {
      const offset = table.getOffset();
      if (offset) {
        transaction.collapseIn(
          unwrap(table.getParent(transaction.currentDocument)),
          offset
        );
      } else {
        transaction.collapseIn(
          unwrap(table.getParent(transaction.currentDocument))
        );
      }
    }
    table.removeTable(transaction);
  }
}
