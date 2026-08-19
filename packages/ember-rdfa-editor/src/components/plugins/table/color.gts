import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { paintCycleHappened } from '#root/utils/_private/editor-utils.ts';
import { modifier } from 'ember-modifier';
import { Velcro } from 'ember-velcro';
import { selectionCell, setCellAttr } from '@say-editor/prosemirror-tables';
import type SayController from '#root/core/say-controller.ts';
import { hash } from '@ember/helper';
import { not } from 'ember-truth-helpers';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import { concat } from '@ember/helper';
import ColorSelector from '#root/components/utils/color-selector.gts';
import { focusTrap } from 'ember-focus-trap';
import { hackIgnorePromise } from '#root/utils/hack-ignore-promise.ts';

type Args = {
  controller: SayController;
  active?: boolean;
  presetColors?: ColorSelector['args']['presetColors'];
};

const DEFAULT_COLOR = '#ffffff';

export default class ColorMenu extends Component<Args> {
  dropdownButton?: HTMLElement;
  htmlSafe = htmlSafe;
  Velcro = Velcro;

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

  get canSetColor() {
    return !!this.controller?.checkCommand(
      setCellAttr('background', 'arbitraryColorForTest'),
    );
  }

  get currentColor() {
    if (!this.canSetColor) {
      return DEFAULT_COLOR;
    }

    const state = this.controller.mainEditorState;

    try {
      const $cell = selectionCell(state);
      const background = $cell.nodeAfter?.attrs['background'] as
        string | undefined;
      return background || DEFAULT_COLOR;
    } catch {
      return DEFAULT_COLOR;
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
      this.controller.doCommand(setCellAttr('background', color));
    } else {
      this.controller.doCommand(setCellAttr('background', null));
    }

    await this.closeDropdown();
  }
  <template>
    {{#if @controller}}
      <div class="say-toolbar__button">
        <this.Velcro
          @placement="bottom"
          @offsetOptions={{hash mainAxis=6}}
          @strategy="absolute"
          as |velcro|
        >
          <button
            type="button"
            class="main {{if @active 'is-active'}}"
            disabled={{not this.canSetColor}}
            title={{t "ember-rdfa-editor.table.background-color"}}
            {{velcro.hook}}
            {{on "click" this.toggleDropdown}}
            {{this.setupDropdownButton}}
          >
            <div
              class="say-toolbar__table-cell-background-button"
              style={{this.htmlSafe
                (concat "--selected-background-color: " this.currentColor)
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
        </this.Velcro>
      </div>
    {{/if}}
  </template>
}
