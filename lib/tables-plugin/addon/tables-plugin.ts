import {EditorPlugin} from "@lblod/ember-rdfa-editor/core/editor-plugin";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import InsertTableColumnAfterCommand from "tables-plugin/commands/insert-table-column-after-command";
import InsertTableColumnBeforeCommand from "tables-plugin/commands/insert-table-column-before-command";
import InsertTableCommand from "tables-plugin/commands/insert-table-command";
import InsertTableRowAboveCommand from "tables-plugin/commands/insert-table-row-above-command";
import InsertTableRowBelowCommand from "tables-plugin/commands/insert-table-row-below-command";
import RemoveTableCommand from "tables-plugin/commands/remove-table-command";
import RemoveTableColumnCommand from "tables-plugin/commands/remove-table-column-command";
import RemoveTableRowCommand from "tables-plugin/commands/remove-table-row-command";

export default class TablesPlugin implements EditorPlugin {
  static create(): TablesPlugin {
    return new TablesPlugin();
  }

  get name() {
    return "tables";
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(controller: EditorController): Promise<void> {
    controller.registerCommand(InsertTableColumnAfterCommand);
    controller.registerCommand(InsertTableColumnBeforeCommand);
    controller.registerCommand(InsertTableCommand);
    controller.registerCommand(InsertTableRowAboveCommand);
    controller.registerCommand(InsertTableRowBelowCommand);
    controller.registerCommand(RemoveTableColumnCommand);
    controller.registerCommand(RemoveTableCommand);
    controller.registerCommand(RemoveTableRowCommand);

  }

}
