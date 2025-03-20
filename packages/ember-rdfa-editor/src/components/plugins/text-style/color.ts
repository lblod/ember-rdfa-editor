import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import {
  clearColor,
  setColor,
} from '@lblod/ember-rdfa-editor/plugins/color/index.ts';
import { paintCycleHappened } from '@lblod/ember-rdfa-editor/utils/_private/editor-utils.ts';
import { modifier } from 'ember-modifier';
import { Velcro } from 'ember-velcro';
import { WordIcon } from '@appuniversum/ember-appuniversum/components/icons/word';
import type SayController from '@lblod/ember-rdfa-editor/core/say-controller.ts';

type Args = {
  controller: SayController;
  defaultColor: string;
};

export default class ColorMenu extends Component<Args> {
  dropdownButton?: HTMLElement;
  htmlSafe = htmlSafe;
  Velcro = Velcro;
  WordIcon = WordIcon;

  setupDropdownButton = modifier((element: HTMLElement) => {
    this.dropdownButton = element;
  });
  @tracked dropdownOpen = false;

  get controller() {
    return this.args.controller;
  }

  @action
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  get currentColor() {
    if (this.controller) {
      const state = this.controller.mainEditorState;
      const { selection, storedMarks } = state;
      const markType = state.schema.marks['color'];

      if (storedMarks?.length) {
        const markSet = markType.isInSet(storedMarks);
        const color = markSet?.attrs?.['color'] as string;

        return color || '#000000';
      } else {
        return (markType.isInSet(selection.$from.marks())?.attrs?.['color'] ||
          '#000000') as string;
      }
    }

    return null;
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
  async setColor(color?: string) {
    if (color) {
      this.controller.doCommand(setColor(color));
    } else {
      this.controller.doCommand(clearColor);
    }
    await this.closeDropdown();
  }
}
