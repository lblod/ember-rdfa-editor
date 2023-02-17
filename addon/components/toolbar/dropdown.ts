import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';
import { paintCycleHappened } from '@lblod/ember-rdfa-editor/utils/editor-utils';


type Args = {
  controller: ProseController;
}
export default class ToolbarDropdown extends Component<Args> {
  @tracked referenceElement?: Element = undefined;
  @tracked dropdownOpen = false;

  reference = modifier(
    (element) => {
      this.referenceElement = element;
    },
    { eager: false }
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
  clickOutsideDeactivates(event: InputEvent) {
    let isClosedByToggleButton = this.referenceElement?.contains(event.target as Node);
    if (!isClosedByToggleButton) {
      this.closeDropdown();
    }
    return true;
  }
}
