import InsertTableRowCommand from '@lblod/ember-rdfa-editor/commands/insert-table-row-command';

export default class InsertTableRowAboveCommand extends InsertTableRowCommand {
  name = 'insert-table-row-above';
  insertAbove = true;
}
