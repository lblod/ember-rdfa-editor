import InsertTableColumnCommand from "@lblod/ember-rdfa-editor/commands/insert-table-column-command";

export default class InsertTableColumnAfterCommand extends InsertTableColumnCommand {
  name = "insert-table-column-after";
  insertBefore = false;
}
