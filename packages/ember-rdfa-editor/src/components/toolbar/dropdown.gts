import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';
import SayController from '#root/core/say-controller.ts';
import { paintCycleHappened } from '#root/utils/_private/editor-utils.ts';
import { Velcro } from 'ember-velcro';
import type { ComponentLike, WithBoundArgs } from '@glint/template';
import { hash } from '@ember/helper';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import DropdownItem from './dropdown-item.gts';
import { on } from '@ember/modifier';
// @ts-expect-error ember-focus-trap does not have ts support
import { focusTrap } from 'ember-focus-trap';

export type ToolbarDropdownSignature = {
  Args: {
    controller?: SayController;
    icon: ComponentLike<{
      Element: Element;
    }>;
    disabled?: boolean;
    hideLabel?: boolean;
    label?: string;
    direction?: 'vertical' | 'horizontal';
    title?: string;
  };
  Element: HTMLDivElement;
  Blocks: {
    default: [
      {
        Item: WithBoundArgs<typeof DropdownItem, 'onActivate'>;
        closeDropdown: () => void;
      },
    ];
  };
};
export default class ToolbarDropdown extends Component<ToolbarDropdownSignature> {
  @tracked referenceElement?: Element = undefined;
  @tracked dropdownOpen = false;

  reference = modifier((element) => {
    this.referenceElement = element;
  });

  @action
  openDropdown() {
    this.dropdownOpen = true;
  }

  @action
  async closeDropdown() {
    this.dropdownOpen = false;
    await paintCycleHappened();
    this.args.controller?.focus();
  }

  @action
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  get isHorizontal() {
    return this.args.direction === 'horizontal';
  }

  @action
  async clickOutsideDeactivates(event: InputEvent) {
    const isClosedByToggleButton = this.referenceElement?.contains(
      event.target as Node,
    );
    if (!isClosedByToggleButton) {
      await this.closeDropdown();
    }
    return true;
  }

  <template>
    <div class="say-dropdown" ...attributes>
      <Velcro @placement="bottom" @strategy="absolute" as |velcro|>
        <button
          {{this.reference}}
          class="say-dropdown__button {{if this.dropdownOpen 'is-active' ''}}"
          title={{@title}}
          aria-haspopup="true"
          aria-expanded="{{if this.dropdownOpen 'true' 'false'}}"
          type="button"
          {{on "click" this.toggleDropdown}}
          disabled={{@disabled}}
          {{velcro.hook}}
        >
          {{#unless @hideLabel}}
            <span class="say-dropdown__label">{{@label}}</span>
          {{/unless}}
          {{#if @icon}}
            <AuIcon @icon={{@icon}} @ariaHidden={{true}} @size="large" />
          {{/if}}
        </button>
        {{#if this.dropdownOpen}}
          <div
            {{focusTrap
              shouldSelfFocus=true
              focusTrapOptions=(hash
                clickOutsideDeactivates=this.clickOutsideDeactivates
              )
            }}
            class="say-dropdown__menu is-visible
              {{if this.isHorizontal 'say-dropdown__menu-horizontal'}}"
            role="menu"
            tabindex="-1"
            {{velcro.loop}}
          >
            {{yield
              (hash
                Item=(component DropdownItem onActivate=this.closeDropdown)
                closeDropdown=this.closeDropdown
              )
            }}
          </div>
        {{/if}}
      </Velcro>
    </div>
  </template>
}
