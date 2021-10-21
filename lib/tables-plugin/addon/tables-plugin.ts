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
import MoveToCellCommand from "tables-plugin/commands/move-to-cell-command";
import MoveToNextElement from "tables-plugin/commands/move-to-next-element";
import MoveToPreviousElement from 'tables-plugin/commands/move-to-previous-element';
import { KeydownEvent } from "@lblod/ember-rdfa-editor/archive/utils/event-bus";
import { action } from "@ember/object";
import handleTabInTable from 'tables-plugin/handlers/handle-tab-in-table';

export default class TablesPlugin implements EditorPlugin {
  private controller!: EditorController;

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
    controller.registerCommand(MoveToCellCommand);
    controller.onEvent("keyDown", this.handleKeydown);
    this.controller = controller;
  }

  @action
  handleKeydown(event: KeydownEvent) {
    if (this.isTabEvent(event.payload)) {
      const reverse = event.payload.shiftKey;
      handleTabInTable(event, reverse, this.controller);
      
    }
  }

  isTabEvent(event: KeyboardEvent): boolean {
    // Still composing, don't handle this.
    return !event.isComposing
      && event.key === "Tab";
  }

}
