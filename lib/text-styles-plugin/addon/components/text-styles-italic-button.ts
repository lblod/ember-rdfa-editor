import {action} from "@ember/object";
import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import { PropertyState } from "@lblod/ember-rdfa-editor/util/types";

interface ItalicButtonArgs {
  controller: EditorController
}

export default class TextStylesItalicdButtonComponent extends Component<ItalicButtonArgs> {
  @tracked isItalic;
  constructor(owner: unknown, args: ItalicButtonArgs) {
    super(owner, args);
    this.isItalic = args.controller.selection.italic === PropertyState.enabled;
    this.args.controller.onEvent('selectionChanged', (event) => {
      this.isItalic = event.payload.selection.italic === PropertyState.enabled;
    });
  }

  @action
  toggleItalic() {
    if(this.isItalic) {
      this.args.controller.executeCommand("remove-italic");
    } else {
      this.args.controller.executeCommand("make-italic");
    }
  }
}
