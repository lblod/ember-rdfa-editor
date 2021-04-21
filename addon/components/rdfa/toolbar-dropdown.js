import Component from "@glimmer/component";
import { action } from "@ember/object";
import { guidFor } from '@ember/object/internals';
import { tracked } from "@glimmer/tracking";

export default class AuDropdown extends Component {
  // Create a dropdown ID
  dropdownId = 'dropdown-' + guidFor(this);

  // Track dropdown state
  @tracked dropdownOpen = false;

  @action
  deactivateDropdown() {
    if (this.dropdownOpen)
      this.dropdownOpen = false;
  }
  // toggle dropdown
  @action
  toggleDropdown() {
    this.dropdownOpen = ! this.dropdownOpen;
  }
}
