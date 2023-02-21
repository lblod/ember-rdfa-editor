import { action } from '@ember/object';
import Component from '@glimmer/component';
import { undo, undoDepth } from '@lblod/ember-rdfa-editor/plugins/history';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';

type Args = {
  controller?: SayController;
};
export default class UndoComponent extends Component<Args> {
  get disabled() {
    if (!this.args.controller) {
      return true;
    }
    const editorState = this.args.controller?.getState(true);
    const redosAvailable = undoDepth(editorState) as number;
    return redosAvailable === 0;
  }

  @action
  onClick() {
    if (this.args.controller) {
      this.args.controller.focus();
      this.args.controller.doCommand(undo);
    }
  }
}
