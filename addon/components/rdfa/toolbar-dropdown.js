import Component from "@glimmer/component";
import {action} from "@ember/object";
import {guidFor} from '@ember/object/internals';
import {tracked} from "@glimmer/tracking";

export default class AuDropdown extends Component {
  // Create a dropdown ID
  dropdownId = 'dropdown-' + guidFor(this);

  // Track dropdown state
  @tracked dropdownOpen = false;
  @tracked focusTrapActive = false;

  activateFocusTrap() {
    this.focusTrapActive = true;
  }

  @action
  deactivateFocusTrap() {
    this.focusTrapActive = false;
  }

  @action
  deactivateDropdown() {
    this.dropdownOpen = false;
    this.args.editor.model.writeSelection();
  }

  // toggle dropdown
  @action
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
    if (this.dropdownOpen) {
      this.activateFocusTrap();
    }
  }
}
