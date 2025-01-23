import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';
import { defaultColors } from '#root/config/colors';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';
import { CircleXIcon } from '@appuniversum/ember-appuniversum/components/icons/circle-x';

type Args = {
  onChange: (color?: string) => unknown;
  presetColors?: string[];
};

export default class ColorSelector extends Component<Args> {
  AddIcon = AddIcon;
  CircleXIcon = CircleXIcon;
  colorPicker?: HTMLElement;
  setUpColorPicker = modifier((element: HTMLElement) => {
    this.colorPicker = element;
  });
  htmlSafe = htmlSafe;

  get presetColors() {
    return this.args.presetColors ?? defaultColors;
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
