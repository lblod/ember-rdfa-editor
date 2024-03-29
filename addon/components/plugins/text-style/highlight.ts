import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { SayController } from '@lblod/ember-rdfa-editor';
import {
  clearHighlight,
  setHighlight,
} from '@lblod/ember-rdfa-editor/plugins/highlight';
import { paintCycleHappened } from '@lblod/ember-rdfa-editor/utils/_private/editor-utils';
import { modifier } from 'ember-modifier';
import { Velcro } from 'ember-velcro';
import { dependencySatisfies, macroCondition } from '@embroider/macros';
import { importSync } from '@embroider/macros';
const PencilIcon = macroCondition(
  dependencySatisfies('@appuniversum/ember-appuniversum', '>=3.4.1'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync('@appuniversum/ember-appuniversum/components/icons/pencil')
      .PencilIcon
  : 'pencil';
const ChevronDownIcon = macroCondition(
  dependencySatisfies('@appuniversum/ember-appuniversum', '>=3.4.1'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync('@appuniversum/ember-appuniversum/components/icons/chevron-down')
      .ChevronDownIcon
  : 'chevron-down';

type Args = {
  controller: SayController;
  defaultColor: string;
};

export default class HighlightMenu extends Component<Args> {
  dropdownButton?: HTMLElement;
  htmlSafe = htmlSafe;
  Velcro = Velcro;
  PencilIcon = PencilIcon;
  ChevronDownIcon = ChevronDownIcon;

  setupDropdownButton = modifier(
    (element: HTMLElement) => {
      this.dropdownButton = element;
    },
    { eager: false },
  );
  @tracked dropdownOpen = false;
  // defaultColor isn't expected to change, so this works fine.
  // eslint-disable-next-line ember/no-tracked-properties-from-args
  @tracked selectedColor = this.args.defaultColor;

  get controller() {
    return this.args.controller;
  }

  @action
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  @action
  async closeDropdown() {
    this.dropdownOpen = false;
    await paintCycleHappened();
    this.args.controller.focus();
  }

  @action async clickOutsideDropdown(event: InputEvent) {
    const isClosedByToggleButton = this.dropdownButton?.contains(
      event.target as Node,
    );
    if (!isClosedByToggleButton) {
      await this.closeDropdown();
    }
  }

  @action
  async setHighlight(color?: string) {
    if (color) {
      this.controller.doCommand(setHighlight(color));
      this.selectedColor = color;
    } else {
      this.controller.doCommand(clearHighlight);
    }
    await this.closeDropdown();
  }
}
