import {action} from "@ember/object";
import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import { PropertyState } from "@lblod/ember-rdfa-editor/util/types";

interface StrikethroughButtonArgs {
  controller: EditorController
}

export default class TextStylesStrikethroughButtonComponent extends Component<StrikethroughButtonArgs> {
  @tracked isStrikethrough;
  constructor(owner: unknown, args: StrikethroughButtonArgs) {
    super(owner, args);
    this.isStrikethrough = args.controller.selection.strikethrough === PropertyState.enabled;
    this.args.controller.onEvent('selectionChanged', (event) => {
      this.isStrikethrough = event.payload.selection.strikethrough === PropertyState.enabled;
    });
  }

  @action
  toggleStrikethrough() {
    if(this.isStrikethrough) {
      this.args.controller.executeCommand("remove-strikethrough");
    } else {
      this.args.controller.executeCommand("make-strikethrough");
    }
  }
}
