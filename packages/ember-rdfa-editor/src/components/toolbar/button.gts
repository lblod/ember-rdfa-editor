import Component from '@glimmer/component';
import type { ComponentLike } from '@glint/template';
import { ChevronDownIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-down';
import ToolbarDropdown, { type ToolbarDropdownSignature } from './dropdown.gts';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import type SayController from '#root/core/say-controller.js';

type Signature = {
  Args: {
    active?: boolean;
    title?: string;
    disabled?: boolean;
    icon: ComponentLike<{ Element: Element }>;
    optionsIcon?: ComponentLike<{ Element: Element }>;
    optionsLabel?: string;
    controller?: SayController;
  };
  Element: HTMLButtonElement;
  Blocks: {
    default: [];
    options: ToolbarDropdownSignature['Blocks']['default'];
  };
};

export default class ToolbarButton extends Component<Signature> {
  get optionsIcon() {
    return this.args.optionsIcon ?? ChevronDownIcon;
  }

  <template>
    <div class="say-toolbar__button">
      <button
        type="button"
        class="main {{if @active 'is-active'}} {{if @disabled 'is-disabled'}}"
        title={{@title}}
        disabled={{@disabled}}
        ...attributes
      >
        <AuIcon @icon={{@icon}} @ariaHidden={{true}} @size="large" />
        {{yield}}
      </button>
      {{#if (has-block "options")}}
        <ToolbarDropdown
          @disabled={{@disabled}}
          @icon={{this.optionsIcon}}
          @controller={{@controller}}
          class="options"
          title={{@optionsLabel}}
          as |Menu|
        >
          {{yield Menu to="options"}}
        </ToolbarDropdown>
      {{/if}}
    </div>
  </template>
}
