import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { clearColor, setColor } from '#root/plugins/color/index.ts';
import { paintCycleHappened } from '#root/utils/_private/editor-utils.ts';
import { modifier } from 'ember-modifier';
import { Velcro } from 'ember-velcro';
import FontColorIcon from '#root/components/icons/font-color.gts';
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

export default class ColorMenu extends Component<Sig> {
  dropdownButton?: HTMLElement;

  setupDropdownButton = modifier((element: HTMLElement) => {
    this.dropdownButton = element;
  });
  @tracked dropdownOpen = false;

  get controller() {
    return this.args.controller;
  }

  @action
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  get currentColor() {
    const state = this.controller.mainEditorState;
    const { selection, storedMarks } = state;
    const markType = state.schema.marks['color'];

    if (storedMarks?.length) {
      const markSet = markType.isInSet(storedMarks);
      const color = markSet?.attrs?.['color'] as string;

      return color || '#000000';
    } else {
      return (markType.isInSet(selection.$from.marks())?.attrs?.['color'] ||
        '#000000') as string;
    }
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
  async setColor(color?: string) {
    if (color) {
      this.controller.doCommand(setColor(color));
    } else {
      this.controller.doCommand(clearColor);
    }
    await this.closeDropdown();
    this.args.onActivate?.();
  }
  <template>
    {{#if @controller}}
      <div class="say-toolbar__button say-toolbar__highlight-button">
        <Velcro @placement="bottom-start" @strategy="absolute" as |velcro|>
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
              @icon={{FontColorIcon}}
              @ariaHidden={{true}}
              @size="large"
              style={{htmlSafe
                (concat "border-bottom-color: " this.currentColor)
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
              @onChange={{this.setColor}}
              @color={{this.currentColor}}
              @presetColors={{@presetColors}}
            />
          {{/if}}
        </Velcro>
      </div>
    {{/if}}
  </template>
}
