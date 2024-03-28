import { action } from '@ember/object';
import Component from '@glimmer/component';
import { redo } from '@lblod/ember-rdfa-editor/plugins/history';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import { dependencySatisfies, macroCondition } from '@embroider/macros';
import { importSync } from '@embroider/macros';
const RedoIcon = macroCondition(
  dependencySatisfies('@appuniversum/ember-appuniversum', '>=3.4.1'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync('@appuniversum/ember-appuniversum/components/icons/redo')
      .RedoIcon
  : 'redo';

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
