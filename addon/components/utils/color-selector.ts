import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';
import { defaultColors } from '@lblod/ember-rdfa-editor/config/colors';
import { dependencySatisfies, macroCondition } from '@embroider/macros';
import { importSync } from '@embroider/macros';
const AddIcon = macroCondition(
  dependencySatisfies('@appuniversum/ember-appuniversum', '>=3.4.1'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync('@appuniversum/ember-appuniversum/components/icons/add').AddIcon
  : 'add';
const CircleXIcon = macroCondition(
  dependencySatisfies('@appuniversum/ember-appuniversum', '>=3.4.1'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync('@appuniversum/ember-appuniversum/components/icons/circle-x')
      .CircleXIcon
  : 'circle-x';

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
