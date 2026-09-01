import { service } from '@ember/service';
import Component from '@glimmer/component';
import {
  ALIGNMENT_OPTIONS,
  type AlignmentOption,
  DEFAULT_ALIGNMENT,
} from '#root/plugins/alignment/index.ts';
import { setAlignment } from '#root/plugins/alignment/commands.ts';
import type IntlService from 'ember-intl/services/intl';
import { AlignLeftIcon } from '@appuniversum/ember-appuniversum/components/icons/align-left';
import { AlignRightIcon } from '@appuniversum/ember-appuniversum/components/icons/align-right';
import { AlignCenterIcon } from '@appuniversum/ember-appuniversum/components/icons/align-center';
import { AlignJustifyIcon } from '@appuniversum/ember-appuniversum/components/icons/align-justify';
import { Velcro } from 'ember-velcro';
import { htmlSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';
import { action } from '@ember/object';
import { paintCycleHappened } from '#root/utils/_private/editor-utils.ts';
import type SayController from '#root/core/say-controller.ts';
import type { ComponentLike } from '@glint/template';
import t from 'ember-intl/helpers/t';
import not from 'ember-truth-helpers/helpers/not';
import { on } from '@ember/modifier';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import focusTrap from 'ember-focus-trap/modifiers/focus-trap';
import { hash, fn } from '@ember/helper';
import { hackIgnorePromise } from '#root/utils/hack-ignore-promise.ts';

type Args = {
  controller?: SayController;
};

const icons: Record<AlignmentOption, ComponentLike<{ Element: Element }>> = {
  left: AlignLeftIcon,
  right: AlignRightIcon,
  center: AlignCenterIcon,
  justify: AlignJustifyIcon,
};

export default class AlignmentMenu extends Component<Args> {
  dropdownButton?: HTMLElement;
  Velcro = Velcro;
  htmlSafe = htmlSafe;

  setupDropdownButton = modifier((element: HTMLElement) => {
    this.dropdownButton = element;
  });
  @tracked dropdownOpen = false;

  @service declare intl: IntlService;
  options = ALIGNMENT_OPTIONS;

  get controller() {
    return this.args.controller;
  }

  get alignmentStyles() {
    return ALIGNMENT_OPTIONS.map((option) => ({
      value: option,
      label: this.intl.t(`ember-rdfa-editor.alignment.options.${option}`),
      icon: icons[option],
    }));
  }

  get currentAlignment() {
    if (this.controller) {
      const { selection } = this.controller.mainEditorState;
      const anchorAlignment = selection.$anchor.parent.attrs['alignment'] as
        AlignmentOption | undefined;
      return anchorAlignment ?? DEFAULT_ALIGNMENT;
    } else {
      return DEFAULT_ALIGNMENT;
    }
  }

  get currentAlignIcon() {
    return icons[this.currentAlignment ?? DEFAULT_ALIGNMENT];
  }

  get enabled() {
    return this.controller?.checkCommand(setAlignment({ option: 'left' }));
  }

  setAlignment = async (option: AlignmentOption) => {
    this.controller?.doCommand(setAlignment({ option }));
    await this.closeDropdown();
  };

  @action
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }
  @action
  async closeDropdown() {
    this.dropdownOpen = false;
    await paintCycleHappened();
    this.controller?.focus();
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
  alignActive(align: AlignmentOption) {
    return this.currentAlignment === align;
  }
  <template>
    <div class="say-dropdown options">
      <this.Velcro @placement="bottom-start" @strategy="absolute" as |velcro|>
        <button
          type="button"
          class="say-dropdown__button {{if this.dropdownOpen 'is-active' ''}}"
          title={{t "ember-rdfa-editor.alignment.label"}}
          disabled={{not this.enabled}}
          {{on "click" this.toggleDropdown}}
          {{velcro.hook}}
          {{this.setupDropdownButton}}
        >
          <AuIcon
            @icon={{this.currentAlignIcon}}
            @ariaHidden={{true}}
            @size="large"
          />
        </button>
        {{#if this.dropdownOpen}}
          <div
            class="say-dropdown__menu is-visible say-dropdown__menu-horizontal"
            role="menu"
            tabindex="-1"
            {{velcro.loop}}
            {{focusTrap
              shouldSelfFocus=true
              focusTrapOptions=(hash
                clickOutsideDeactivates=(hackIgnorePromise
                  this.clickOutsideDropdown
                )
              )
            }}
          >
            {{#each this.alignmentStyles as |style|}}
              <button
                role="menuitem"
                type="button"
                title={{style.label}}
                {{on "click" (fn this.setAlignment style.value)}}
              >
                <AuIcon
                  @icon={{style.icon}}
                  @ariaHidden={{true}}
                  @size="large"
                />
              </button>
            {{/each}}
          </div>
        {{/if}}
      </this.Velcro>
    </div>
  </template>
}
