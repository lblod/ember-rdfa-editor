import { action } from '@ember/object';
import Component from '@glimmer/component';
import { undo } from 'prosemirror-history';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';

type Args = {
  controller: SayController;
};
export default class UndoComponent extends Component<Args> {
  @action
  onClick() {
    this.args.controller.focus();
    this.args.controller.doCommand(undo);
  }
}
