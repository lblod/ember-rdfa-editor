import { action } from '@ember/object';
import Component from '@glimmer/component';
import { undo } from '@lblod/ember-rdfa-editor/plugins/history';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';

type Args = {
  controller?: SayController;
};
export default class UndoComponent extends Component<Args> {
  get disabled() {
    return !this.args.controller?.checkCommand(undo);
  }

  @action
  onClick() {
    if (this.args.controller) {
      this.args.controller.focus();
      this.args.controller.doCommand(undo);
    }
  }
}
