import InsertTableRowCommand from '@lblod/ember-rdfa-editor/commands/insert-table-row-command';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    insertTableRowAbove: InsertTableRowAboveCommand;
  }
}
export default class InsertTableRowAboveCommand extends InsertTableRowCommand {
  insertAbove = true;
}
