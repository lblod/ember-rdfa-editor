import Command, { CommandContext } from './command';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import ModelTable from '@lblod/ember-rdfa-editor/model/model-table';
import { MisbehavedSelectionError } from '@lblod/ember-rdfa-editor/utils/errors';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
export interface InsertTableCommandArgs {
  selection?: ModelSelection;
  rows?: number;
  columns?: number;
}

export default class InsertTableCommand
  implements Command<InsertTableCommandArgs, void>
{
  name = 'insert-table';
  arguments: string[] = ['selection', 'rows', 'columns'];

  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(
    { transaction }: CommandContext,
    {
      selection = transaction.workingCopy.selection,
      rows = 2,
      columns = 2,
    }: InsertTableCommandArgs
  ): void {
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }

    const table = new ModelTable(rows, columns);
    const firstCell = table.getCell(0, 0) as ModelElement;

    transaction.insertNodes(selection.lastRange, table);
    transaction.collapseIn(firstCell);
  }
}
