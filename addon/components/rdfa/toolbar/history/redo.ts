import { action } from '@ember/object';
import Component from '@glimmer/component';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';
import { redo } from 'prosemirror-history';

type Args = {
  controller: ProseController;
};
export default class RedoComponent extends Component<Args> {
  @action
  onClick() {
    this.args.controller.focus();
    this.args.controller.doCommand(redo);
  }
}
