import InsertTableColumnCommand from '@lblod/ember-rdfa-editor/commands/insert-table-column-command';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    insertTableColumnBefore: InsertTableColumnBeforeCommand;
  }
}
export default class InsertTableColumnBeforeCommand extends InsertTableColumnCommand {
  insertBefore = true;
}
