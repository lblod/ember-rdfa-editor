import {action} from "@ember/object";
import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import { PropertyState } from "@lblod/ember-rdfa-editor/util/types";

interface BoldButtonArgs {
  controller: EditorController
}

export default class TablesTableButtonComponent extends Component<BoldButtonArgs> {
  @tracked isInTable;
  constructor(owner: unknown, args: BoldButtonArgs) {
    super(owner, args);
    this.isInTable = args.controller.selection.inTableState === PropertyState.enabled;
    this.args.controller.onEvent('selectionChanged', (event) => {
      this.isInTable = event.payload.selection.inTableState === PropertyState.enabled;
    });
  }

  @action
  insertTable() {
    this.args.controller.executeCommand("insert-table");
  }

  @action
  insertRowBelow() {
    this.args.controller.executeCommand("insert-table-row-below");
  }

  @action
  insertRowAbove() {
    this.args.controller.executeCommand("insert-table-row-above");
  }

  @action
  insertColumnAfter() {
    this.args.controller.executeCommand("insert-table-column-after");
  }

  @action
  insertColumnBefore() {
    this.args.controller.executeCommand("insert-table-column-before");
  }

  @action
  removeTableRow() {
    this.args.controller.executeCommand("remove-table-row");
  }

  @action
  removeTableColumn() {
    this.args.controller.executeCommand("remove-table-column");
  }

  @action
  removeTable() {
    this.args.controller.executeCommand("remove-table");
  }

}
