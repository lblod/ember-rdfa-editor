import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';
import SayController from '#root/core/say-controller.ts';
import { paintCycleHappened } from '#root/utils/_private/editor-utils.ts';
import { Velcro } from 'ember-velcro';
import type { ComponentLike, WithBoundArgs } from '@glint/template';
import type DropdownItem from './dropdown-item';

type Args = {
  controller: SayController;
  icon: ComponentLike;
  direction?: 'vertical' | 'horizontal';
  title?: string;
  Blocks?: {
    default: [
      {
        Item: WithBoundArgs<typeof DropdownItem, 'onActivate'>;
        closeDropdown: () => void;
      },
    ];
  };
};
export default class ToolbarDropdown extends Component<Args> {
  @tracked referenceElement?: Element = undefined;
  @tracked dropdownOpen = false;
  Velcro = Velcro;

  reference = modifier((element) => {
    this.referenceElement = element;
  });

  @action
  openDropdown() {
    this.dropdownOpen = true;
  }

  get isHorizontal() {
    return this.args.direction === 'horizontal';
  }

  @action
  async closeDropdown() {
    this.dropdownOpen = false;
    await paintCycleHappened();
    this.args.controller.focus();
  }

  @action
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  @action
  async clickOutsideDeactivates(event: InputEvent) {
    const isClosedByToggleButton = this.referenceElement?.contains(
      event.target as Node,
    );
    if (!isClosedByToggleButton) {
      await this.closeDropdown();
    }
    return true;
  }
}
