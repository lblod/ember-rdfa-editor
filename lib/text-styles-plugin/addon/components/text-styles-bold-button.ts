import {action} from "@ember/object";
import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import { PropertyState } from "@lblod/ember-rdfa-editor/util/types";

interface BoldButtonArgs {
  controller: EditorController
}

export default class TextStylesBoldButtonComponent extends Component<BoldButtonArgs> {
  @tracked isBold;
  constructor(owner: unknown, args: BoldButtonArgs) {
    super(owner, args);
    this.isBold = args.controller.selection.bold === PropertyState.enabled;
    this.args.controller.onEvent('selectionChanged', (event) => {
      this.isBold = event.payload.selection.bold === PropertyState.enabled;
    });
  }

  @action
  toggleBold() {
    if(this.isBold) {
      this.args.controller.executeCommand("remove-bold");
    } else {  
      this.args.controller.executeCommand("make-bold");
    }
  }
}
