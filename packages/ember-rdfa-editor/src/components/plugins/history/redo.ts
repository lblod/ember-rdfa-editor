import { action } from '@ember/object';
import Component from '@glimmer/component';
import { redo } from '@lblod/ember-rdfa-editor/plugins/history/index.ts';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller.ts';
import { RedoIcon } from '@appuniversum/ember-appuniversum/components/icons/redo';

type Args = {
  controller?: SayController;
};
export default class RedoComponent extends Component<Args> {
  RedoIcon = RedoIcon;

  get mainEditorView() {
    return this.args.controller?.mainEditorView;
  }

  get disabled() {
    return !this.args.controller?.checkCommand(redo, {
      view: this.mainEditorView,
    });
  }

  @action
  onClick() {
    if (this.args.controller) {
      this.args.controller.focus();
      this.args.controller.doCommand(redo, {
        view: this.mainEditorView,
      });
    }
  }
}
