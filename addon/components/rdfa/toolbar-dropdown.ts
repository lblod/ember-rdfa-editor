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
    // I have no idea why this particular hack works, I've tried it
    // just about any other way but this is the only one that works
    // focus-trap is the bane of my existence
    // SAFETY: if domRoot is ever an Element that's not an HTMLElement,
    // then we're definitely not in Kansas anymore
    this.args.controller.perform(() => {
      (this.args.controller.view.domRoot as HTMLElement).focus();
    });
    return true;
  }
}
