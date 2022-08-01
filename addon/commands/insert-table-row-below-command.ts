import InsertTableRowCommand from '@lblod/ember-rdfa-editor/commands/insert-table-row-command';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    insertTableRowBelow: InsertTableRowBelowCommand;
  }
}
export default class InsertTableRowBelowCommand extends InsertTableRowCommand {
  insertAbove = false;
}
