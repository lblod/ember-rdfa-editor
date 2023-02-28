import { action } from '@ember/object';
import Component from '@glimmer/component';
import { commands } from '@guardian/prosemirror-invisibles';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';

type Args = {
  controller?: SayController;
};

export default class RdfaBlocksToggleComponent extends Component<Args> {
  get controller() {
    return this.args.controller;
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
