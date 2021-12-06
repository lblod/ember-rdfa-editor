import InsertTableColumnCommand from '@lblod/ember-rdfa-editor/commands/insert-table-column-command';

export default class InsertTableColumnBeforeCommand extends InsertTableColumnCommand {
  name = 'insert-table-column-before';
  insertBefore = true;
}
