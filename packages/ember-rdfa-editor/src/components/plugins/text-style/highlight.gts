import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { clearHighlight, setHighlight } from '#root/plugins/highlight/index.ts';
import { paintCycleHappened } from '#root/utils/_private/editor-utils.ts';
import { modifier } from 'ember-modifier';
import { Velcro } from 'ember-velcro';
import { PencilIcon } from '@appuniversum/ember-appuniversum/components/icons/pencil';
import { ChevronDownIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-down';
import type SayController from '#root/core/say-controller.ts';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import { concat } from '@ember/helper';
import ColorSelector from '#root/components/utils/color-selector.gts';
import { focusTrap } from 'ember-focus-trap';
import { hash } from '@ember/helper';
import { hackIgnorePromise } from '#root/utils/hack-ignore-promise.ts';

type Sig = {
  Args: {
    controller: SayController;
    defaultColor: string;
    onActivate?: () => void;
    disabled?: boolean;
    presetColors?: ColorSelector['args']['presetColors'];
  };
};

export default class HighlightMenu extends Component<Sig> {
  dropdownButton?: HTMLElement;
  htmlSafe = htmlSafe;
  Velcro = Velcro;
  PencilIcon = PencilIcon;
  ChevronDownIcon = ChevronDownIcon;

  setupDropdownButton = modifier((element: HTMLElement) => {
    this.dropdownButton = element;
  });
  @tracked dropdownOpen = false;
  // defaultColor isn't expected to change, so this works fine.
  // eslint-disable-next-line ember/no-tracked-properties-from-args
  @tracked selectedColor = this.args.defaultColor;

  get controller() {
    return this.args.controller;
  }

  @action
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  @action
  async closeDropdown() {
    this.dropdownOpen = false;
    await paintCycleHappened();
    this.args.controller.focus();
  }

  @action async clickOutsideDropdown(event: Event) {
    const isClosedByToggleButton = this.dropdownButton?.contains(
      event.target as Node,
    );
    if (!isClosedByToggleButton) {
      await this.closeDropdown();
    }
    return true;
  }

  @action
  async setHighlight(color?: string) {
    if (color) {
      this.controller.doCommand(setHighlight(color));
      this.selectedColor = color;
    } else {
      this.controller.doCommand(clearHighlight);
    }
    await this.closeDropdown();
    this.args.onActivate?.();
  }

  <template>
    {{#if @controller}}
      <div class="say-toolbar__button say-toolbar__highlight-button">
        <this.Velcro @placement="bottom-start" @strategy="absolute" as |velcro|>
          <button
            type="button"
            class="main
              {{if this.dropdownOpen 'is-active' ''}}
              {{if @disabled 'is-disabled'}}"
            title={{t "ember-rdfa-editor.color.button-label"}}
            {{velcro.hook}}
            {{on "click" this.toggleDropdown}}
            {{this.setupDropdownButton}}
          >
            <AuIcon
              @icon={{this.PencilIcon}}
              @ariaHidden={{true}}
              @size="large"
              style={{this.htmlSafe
                (concat "border-bottom-color: " this.selectedColor)
              }}
            />
          </button>

          {{#if this.dropdownOpen}}
            <ColorSelector
              class="say-dropdown__menu is-visible"
              {{velcro.loop}}
              {{focusTrap
                shouldSelfFocus=true
                focusTrapOptions=(hash
                  clickOutsideDeactivates=(hackIgnorePromise
                    this.clickOutsideDropdown
                  )
                )
              }}
              tabindex="-1"
              @onChange={{this.setHighlight}}
              @color={{this.selectedColor}}
              @presetColors={{@presetColors}}
            />
          {{/if}}
        </this.Velcro>
      </div>
    {{/if}}
  </template>
}
