import { action } from '@ember/object';
import Component from '@glimmer/component';
import { undo } from '#root/plugins/history/index.ts';
import SayController from '#root/core/say-controller.ts';
import { UndoIcon } from '@appuniversum/ember-appuniversum/components/icons/undo';
import ToolbarButton from '#root/components/toolbar/button.gts';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';

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

  <template>
    <ToolbarButton
      @disabled={{this.disabled}}
      @title={{t "ember-rdfa-editor.undo"}}
      @icon={{this.UndoIcon}}
      {{on "click" this.onClick}}
    />
  </template>
}
