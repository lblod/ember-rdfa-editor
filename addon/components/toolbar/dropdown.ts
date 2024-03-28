import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import { paintCycleHappened } from '@lblod/ember-rdfa-editor/utils/_private/editor-utils';
import { Velcro } from 'ember-velcro';
import { type ComponentLike } from '@glint/template';

type Args = {
  controller: SayController;
  icon: ComponentLike;
};
export default class ToolbarDropdown extends Component<Args> {
  @tracked referenceElement?: Element = undefined;
  @tracked dropdownOpen = false;
  Velcro = Velcro;

  reference = modifier(
    (element) => {
      this.referenceElement = element;
    },
    { eager: false },
  );

  @action
  openDropdown() {
    this.dropdownOpen = true;
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
