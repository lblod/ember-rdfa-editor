import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import { paintCycleHappened } from '@lblod/ember-rdfa-editor/editor/utils';
import Controller from '@lblod/ember-rdfa-editor/model/controller';

interface Args {
  controller: Controller;
}

export default class AuDropdown extends Component<Args> {
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
    this.args.controller.perform(() => {
      (this.args.controller.view.domRoot as HTMLElement).focus();
    });
    // this.args.editor.model.writeSelection();
    return true;
  }
}
