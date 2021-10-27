import {action} from "@ember/object";
import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import { PropertyState } from "@lblod/ember-rdfa-editor/util/types";

interface UnderlineButtonArgs {
  controller: EditorController
}

export default class TextStylesUnderlineButtonComponent extends Component<UnderlineButtonArgs> {
  @tracked isUnderline;
  constructor(owner: unknown, args: UnderlineButtonArgs) {
    super(owner, args);
    this.isUnderline = args.controller.selection.underline === PropertyState.enabled;
    this.args.controller.onEvent('selectionChanged', (event) => {
      this.isUnderline = event.payload.selection.underline === PropertyState.enabled;
    });
  }

  @action
  toggleUnderline() {
    if(this.isUnderline) {
      this.args.controller.executeCommand("remove-underline");
    } else {
      this.args.controller.executeCommand("make-underline");
    }
  }
}
