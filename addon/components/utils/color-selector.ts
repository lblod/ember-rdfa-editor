import { action } from '@ember/object';
import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';

type Args = {
  onChange: (color?: string) => unknown;
  presetColors?: string[];
};

export default class ColorSelector extends Component<Args> {
  colorPicker?: HTMLElement;
  setUpColorPicker = modifier(
    (element: HTMLElement) => {
      this.colorPicker = element;
    },
    { eager: false },
  );

  get presetColors() {
    return (
      this.args.presetColors ?? [
        '#ff8000',
        '#ffff00',
        '#00ff00',
        '#00ffff',
        '#0000ff',
        '#ff0000',
      ]
    );
  }
  @action
  openColorPicker() {
    this.colorPicker?.click();
  }

  @action
  selectColor(color: string) {
    this.args.onChange(color);
  }

  @action
  clearColor() {
    this.args.onChange();
  }

  @action
  onColorPickerChange(event: InputEvent) {
    this.selectColor((event.target as HTMLInputElement).value);
  }
}
