import {action} from "@ember/object";
import Component from "@glimmer/component";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";

interface BoldButtonArgs {
  controller: EditorController
}

export default class BoldButton extends Component<BoldButtonArgs> {
  @action
  makeBold() {
    this.args.controller.executeCommand("make-bold");
  }
}
