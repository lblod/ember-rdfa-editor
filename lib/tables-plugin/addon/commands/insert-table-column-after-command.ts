import InsertTableColumnCommand from "tables-plugin/commands/insert-table-column-command";

export default class InsertTableColumnAfterCommand extends InsertTableColumnCommand {
  name = "insert-table-column-after";
  insertBefore = false;
}
