import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';
import { defaultColors } from '#root/config/colors.ts';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';
import { CircleXIcon } from '@appuniversum/ember-appuniversum/components/icons/circle-x';
import { on } from '@ember/modifier';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import t from 'ember-intl/helpers/t';
import { concat, fn } from '@ember/helper';

type Sig = {
  Args: {
    onChange: (color?: string) => unknown;
    presetColors?: string[];
    color: string;
  };
  Element: HTMLDivElement;
};

export default class ColorSelector extends Component<Sig> {
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
  onColorPickerChange(event: Event & { currentTarget: HTMLInputElement }) {
    this.selectColor((event.target as HTMLInputElement).value);
  }
  <template>
    <div role="menu" class="say-color-selector" ...attributes>
      <button type="button" role="menuitem" {{on "click" this.clearColor}}>
        <AuIcon @icon={{this.CircleXIcon}} @ariaHidden={{true}} />
        {{t "ember-rdfa-editor.color-selector.no-color"}}
      </button>
      <div class="color-selector__grid">
        {{#each this.presetColors as |presetColor|}}
          <button
            type="button"
            style={{this.htmlSafe (concat "background-color: " presetColor)}}
            title={{presetColor}}
            {{on "click" (fn this.selectColor presetColor)}}
          />
        {{/each}}
      </div>
      <button role="menuitem" type="button" {{on "click" this.openColorPicker}}>
        <AuIcon @icon={{this.AddIcon}} @ariaHidden={{true}} />
        {{t "ember-rdfa-editor.color-selector.additional-colors"}}
      </button>
      <input
        type="color"
        class="color-selector__picker"
        id="say-highlight-color"
        value={{@color}}
        {{on "change" this.onColorPickerChange}}
        {{this.setUpColorPicker}}
      />
    </div>
  </template>
}
