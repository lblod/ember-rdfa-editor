import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import { SayController } from '@lblod/ember-rdfa-editor';
import { paintCycleHappened } from '@lblod/ember-rdfa-editor/utils/_private/editor-utils';

interface Args {
  controller: SayController;
  iconSize?: string;
}

export default class AuPillDropdown extends Component<Args> {
  get iconSize() {
    return this.args.iconSize ?? 'large';
  }

  // Create a dropdown ID
  dropdownId = 'dropdown-' + guidFor(this);

  // Track dropdown state
  @tracked dropdownOpen = false;

  @action
  openDropdown() {
    this.dropdownOpen = true;
  }

  @action
  async closeDropdown(event: Event) {
    if (event) {
      event.preventDefault();
    }
    this.dropdownOpen = false;
    // It seems impossible to manage the focus correctly synchronously
    // some kind of focus event always seems to happen at the wrong time
    // so this is a bit of hack, but it works well.
    await paintCycleHappened();
    this.args.controller.focus();
    return true;
  }
}
