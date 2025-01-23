import { action } from '@ember/object';
import Component from '@glimmer/component';
import {
  commands,
  selectActiveState,
} from '@say-editor/prosemirror-invisibles';
import SayController from '#root/core/say-controller';

type Args = {
  controller?: SayController;
};

export default class FormattingToggleComponent extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  get isActive() {
    if (this.controller) {
      return selectActiveState(this.controller.mainEditorState);
    } else {
      return false;
    }
  }

  @action
  toggle() {
    if (this.controller) {
      this.controller.focus();
      this.controller.doCommand(commands.toggleActiveState(), {
        view: this.controller.mainEditorView,
      });
    }
  }
}
