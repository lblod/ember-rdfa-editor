import InsertTableRowCommand from '@lblod/ember-rdfa-editor/commands/insert-table-row-command';

export default class InsertTableRowBelowCommand extends InsertTableRowCommand {
  name = 'insert-table-row-below';
  insertAbove = false;
}
