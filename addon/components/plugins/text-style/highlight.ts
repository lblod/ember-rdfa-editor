import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { SayController, Selection } from '@lblod/ember-rdfa-editor';

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
    const mark = this.schema.marks.highlight.create({ value: color });
    const { selection } = this.state;
    if (selection.empty) {
      this.controller.withTransaction((tr) => {
        return tr.addStoredMark(mark);
      });
    } else {
      this.controller.withTransaction((tr) => {
        return tr
          .addMark(tr.selection.from, tr.selection.to, mark)
          .setSelection(Selection.near(tr.selection.$to));
      });
    }
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
