import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import { paintCycleHappened } from '@lblod/ember-rdfa-editor/editor/utils';

export default class AuDropdown extends Component {
  // Create a dropdown ID
  dropdownId = 'dropdown-' + guidFor(this);

  // Track dropdown state
  @tracked dropdownOpen = false;

  @action
  openDropdown() {
    this.dropdownOpen = true;
  }

  @action
  async closeDropdown(event) {
    if (event) {
      event.preventDefault();
    }
    this.dropdownOpen = false;
    // It seems impossible to manage the focus correctly synchronously
    // some kind of focus event always seems to happen at the wrong time
    // so this is a bit of hack, but it works well.
    await paintCycleHappened();
    this.args.editor.model.selection.lastRange.start.parent.boundNode?.focus();
    this.args.editor.model.writeSelection();
    return true;
  }
}
