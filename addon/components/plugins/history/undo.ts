import { action } from '@ember/object';
import Component from '@glimmer/component';
import { undo } from '@lblod/ember-rdfa-editor/plugins/history';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import { UndoIcon } from '@appuniversum/ember-appuniversum/components/icons/undo';

type Args = {
  controller?: SayController;
};
export default class UndoComponent extends Component<Args> {
  UndoIcon = UndoIcon;

  get mainEditorView() {
    return this.args.controller?.mainEditorView;
  }

  get disabled() {
    return !this.args.controller?.checkCommand(undo, {
      view: this.mainEditorView,
    });
  }

  @action
  onClick() {
    if (this.args.controller) {
      this.args.controller.focus();
      this.args.controller.doCommand(undo, { view: this.mainEditorView });
    }
  }
}
