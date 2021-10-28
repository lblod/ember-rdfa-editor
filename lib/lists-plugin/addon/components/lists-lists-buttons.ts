import {action} from "@ember/object";
import Component from "@glimmer/component";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import { tracked } from "@glimmer/tracking";
import { PropertyState } from "@lblod/ember-rdfa-editor/util/types";

interface BoldButtonArgs {
  controller: EditorController
}

export default class ListsListButtonComponent extends Component<BoldButtonArgs> {
  @tracked isInList;
  @tracked canInsertList;
  @tracked canUnindent;
  @tracked canIndent;
  constructor(owner: unknown, args: BoldButtonArgs) {
    super(owner, args);
    this.isInList = args.controller.selection.inListState === PropertyState.enabled;
    this.canInsertList = args.controller.canExecuteCommand("make-list");
    this.canUnindent = args.controller.canExecuteCommand("unindent-list");
    this.canIndent = args.controller.canExecuteCommand("indent-list");
    this.args.controller.onEvent('selectionChanged', (event) => {
      this.isInList = event.payload.selection.inListState === PropertyState.enabled;
      this.canInsertList = args.controller.canExecuteCommand("make-list");
      this.canUnindent = args.controller.canExecuteCommand("unindent-list");
      this.canIndent = args.controller.canExecuteCommand("indent-list");
    });
  }

  @action
  toggleUnorderedList() {
    if (this.isInList) {
      this.args.controller.executeCommand("remove-list");
    } else {
      this.args.controller.executeCommand("make-list", "ul");
    }
  }

  @action
  insertIndent() {
    if (this.isInList) {
      this.args.controller.executeCommand("indent-list");
    }
  }

  @action
  insertUnindent() {
    if (this.isInList) {
      this.args.controller.executeCommand("unindent-list");
    }
  }

}
