import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { clearColor, setColor } from '#root/plugins/color/index.ts';
import { paintCycleHappened } from '#root/utils/_private/editor-utils.ts';
import { modifier } from 'ember-modifier';
import { Velcro } from 'ember-velcro';
import FontColorIcon from '#root/components/icons/font-color.gts';
import type SayController from '#root/core/say-controller.ts';
import type { ComponentLike } from '@glint/template';

type Args = {
  controller: SayController;
  defaultColor: string;
  onActivate?: () => void;
};

export default class ColorMenu extends Component<Args> {
  dropdownButton?: HTMLElement;
  htmlSafe = htmlSafe;
  Velcro = Velcro;
  FontColorIcon = FontColorIcon as ComponentLike;

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
    this.args.onActivate?.();
  }
}
