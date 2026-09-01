import { action } from '@ember/object';
import Component from '@glimmer/component';
import { redo } from '#root/plugins/history/index.ts';
import SayController from '#root/core/say-controller.ts';
import { RedoIcon } from '@appuniversum/ember-appuniversum/components/icons/redo';
import ToolbarButton from '#root/components/toolbar/button.gts';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';

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
  <template>
    <ToolbarButton
      @disabled={{this.disabled}}
      @title={{t "ember-rdfa-editor.redo"}}
      @icon={{this.RedoIcon}}
      {{on "click" this.onClick}}
    />
  </template>
}
