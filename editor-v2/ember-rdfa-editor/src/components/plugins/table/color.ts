import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { SayController } from '#root';
import { paintCycleHappened } from '#root/utils/_private/editor-utils';
import { modifier } from 'ember-modifier';
import { Velcro } from 'ember-velcro';
import { selectionCell, setCellAttr } from '@say-editor/prosemirror-tables';

type Args = {
  controller: SayController;
};

const DEFAULT_COLOR = '#ffffff';

export default class ColorMenu extends Component<Args> {
  dropdownButton?: HTMLElement;
  htmlSafe = htmlSafe;
  Velcro = Velcro;

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

  get canSetColor() {
    return !!this.controller?.checkCommand(
      setCellAttr('background', 'arbitraryColorForTest'),
    );
  }

  get currentColor() {
    if (this.controller) {
      if (!this.canSetColor) {
        return DEFAULT_COLOR;
      }

      const state = this.controller.mainEditorState;

      try {
        const $cell = selectionCell(state);
        const background = $cell.nodeAfter?.attrs['background'] as
          | string
          | undefined;
        return background || DEFAULT_COLOR;
      } catch {
        return DEFAULT_COLOR;
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
      this.controller.doCommand(setCellAttr('background', color));
    } else {
      this.controller.doCommand(setCellAttr('background', null));
    }

    await this.closeDropdown();
  }
}
