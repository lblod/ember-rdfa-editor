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


  get rootNode() {
    return this.args.editor.rootNode;
  }

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
