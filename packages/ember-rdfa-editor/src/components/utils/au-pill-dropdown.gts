import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import { paintCycleHappened } from '#root/utils/_private/editor-utils.ts';
import type SayController from '#root/core/say-controller.ts';
import Pill, { type PillComponentSignature } from '../pill.gts';
import { on } from '@ember/modifier';
import { hash } from '@ember/helper';
import { focusTrap } from 'ember-focus-trap';

interface Sig {
  Args: {
    controller: SayController;
    iconSize?: string;
    icon?: PillComponentSignature['Args']['icon'];
    iconAlignment?: PillComponentSignature['Args']['iconAlignment'];
  };
  Element: HTMLDivElement;
  Blocks: { header: []; content: [] };
}

export default class AuPillDropdown extends Component<Sig> {
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
  //@ts-expect-error this is a temporary hack to make glint happy without changing the behavior. Ideally the closedropdown should not be async, or otherwise we should pass something else to focustrap
  allowOutsideClick: (event: Event) => boolean = this.closeDropdown.bind(this);
  <template>
    <div class="say-dropdown" ...attributes>
      <Pill
        aria-haspopup="true"
        aria-expanded="{{if this.dropdownOpen 'true' 'false'}}"
        {{on "click" this.openDropdown}}
        @icon={{@icon}}
        @iconAlignment={{@iconAlignment}}
      >
        {{yield to="header"}}
      </Pill>
      {{#if this.dropdownOpen}}
        <div
          id="{{this.dropdownId}}"
          class="say-dropdown__menu is-visible"
          role="menu"
          tabindex="-1"
          {{focusTrap
            isActive=true
            shouldSelfFocus=true
            focusTrapOptions=(hash
              allowOutsideClick=this.allowOutsideClick
              returnFocusOnDeactivate=false
            )
          }}
        >
          {{yield to="content"}}
        </div>
      {{/if}}
    </div>
  </template>
}
