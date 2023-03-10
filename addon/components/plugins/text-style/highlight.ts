import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { SayController } from '@lblod/ember-rdfa-editor';
import { setHighlight } from '@lblod/ember-rdfa-editor/plugins/highlight';

type Args = {
  controller: SayController;
  defaultColor: string;
};

export default class HighlightMenu extends Component<Args> {
  @tracked selectedColor = this.args.defaultColor;

  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.controller.schema;
  }

  get state() {
    return this.controller.activeEditorState;
  }

  @action
  setHighlight(color: string) {
    this.controller.doCommand(setHighlight(color));
    this.controller.focus();
    this.selectedColor = color;
  }

  @action
  onColorPickerChange(event: InputEvent) {
    this.controller.focus();
    const color = (event.target as HTMLInputElement).value;
    this.setHighlight(color);
  }
}
