import InsertTableRowCommand from "tables-plugin/commands/insert-table-row-command";

export default class InsertTableRowAboveCommand extends InsertTableRowCommand {
  name = "insert-table-row-above";
  insertAbove = true;
}
