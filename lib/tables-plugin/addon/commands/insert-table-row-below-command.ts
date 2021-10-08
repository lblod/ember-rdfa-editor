import InsertTableRowCommand from "tables-plugin/commands/insert-table-row-command";

export default class InsertTableRowBelowCommand extends InsertTableRowCommand {
  name = "insert-table-row-below";
  insertAbove = false;
}
