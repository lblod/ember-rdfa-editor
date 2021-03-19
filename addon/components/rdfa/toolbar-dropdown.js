import Component from "@glimmer/component";
import { action } from "@ember/object";
import { guidFor } from '@ember/object/internals';
import { tracked } from "@glimmer/tracking";

export default class AuDropdown extends Component {
  // Create a dropdown ID
  dropdownId = 'dropdown-' + guidFor(this);

  // Track dropdown state
  @tracked dropdownOpen = false;

  // Open dropdown
  @action
  openDropdown() {
    // Toggle dropdown view state
    if (!this.dropdownOpen)
      this.dropdownOpen = true;
  }

  @action
  closeDropdown() {
    // Toggle dropdown view state
    if (this.dropdownOpen)
      this.dropdownOpen = false;
  }
}
