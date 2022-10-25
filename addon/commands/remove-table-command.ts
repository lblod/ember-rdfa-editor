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
    transaction.deepClone();
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }
    const workingSelection = transaction.cloneSelection(selection);
    const root = transaction.currentDocument;

    const table = ModelTable.getTableFromSelection(workingSelection);
    if (!table) {
      throw new Error('The selection is not inside a table');
    }

    if (table.getParent(root)) {
      const offset = table.getOffset(transaction.currentDocument);
      if (offset) {
        transaction.collapseIn(unwrap(table.getParent(root)), offset);
      } else {
        transaction.collapseIn(unwrap(table.getParent(root)));
      }
    }
    table.removeTable(transaction);
  }
}
