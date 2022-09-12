import InsertTableColumnCommand from '@lblod/ember-rdfa-editor/commands/insert-table-column-command';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    insertTableColumnAfter: InsertTableColumnAfterCommand;
  }
}
export default class InsertTableColumnAfterCommand extends InsertTableColumnCommand {
  insertBefore = false;
}
