import { action } from '@ember/object';
import Component from '@glimmer/component';
import { redo } from 'prosemirror-history';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';

type Args = {
  controller: SayController;
};
export default class RedoComponent extends Component<Args> {
  @action
  onClick() {
    this.args.controller.focus();
    this.args.controller.doCommand(redo);
  }
}
