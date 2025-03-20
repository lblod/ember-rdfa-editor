import { action } from '@ember/object';
import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';
import { paintCycleHappened } from '@lblod/ember-rdfa-editor/utils/_private/editor-utils.ts';
import { modifier } from 'ember-modifier';
import { Velcro } from 'ember-velcro';
import { selectionCell, setCellAttr } from '@say-editor/prosemirror-tables';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import { ChevronDownIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-down';
import { CheckIcon } from '@appuniversum/ember-appuniversum/components/icons/check';
import type SayController from '@lblod/ember-rdfa-editor/core/say-controller.ts';

type Args = {
  controller: SayController;
};

const verticalAlignOptions = ['top', 'middle', 'bottom'] as const;

type VerticalAlignment = (typeof verticalAlignOptions)[number];

const DEFAULT_ALIGN = 'top';

// TODO: Move to appuniversum icons
const icons: Record<VerticalAlignment, string> = {
  top: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
           stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="local-icon">
        <line x1="5" y1="6" x2="19" y2="6" />
        <line x1="8" y1="12" x2="16" y2="12" />
        <line x1="8" y1="18" x2="16" y2="18" />
      </svg>`,
  middle: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
           stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="local-icon">
        <line x1="8" y1="6" x2="16" y2="6" />
        <line x1="5" y1="12" x2="19" y2="12" />
        <line x1="8" y1="18" x2="16" y2="18" />
      </svg>`,
  bottom: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
           stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="local-icon">
        <line x1="8" y1="6" x2="16" y2="6" />
        <line x1="8" y1="12" x2="16" y2="12" />
        <line x1="5" y1="18" x2="19" y2="18" />
      </svg>`,
};

export default class VerticalAlign extends Component<Args> {
  ChevronDownIcon = ChevronDownIcon;
  CheckIcon = CheckIcon;

  @service declare intl: IntlService;

  dropdownButton?: HTMLElement;
  Velcro = Velcro;
  htmlSafe = htmlSafe;

  setupDropdownButton = modifier((element: HTMLElement) => {
    this.dropdownButton = element;
  });
  @tracked dropdownOpen = false;

  @action
  async closeDropdown() {
    this.dropdownOpen = false;
    await paintCycleHappened();
    this.args.controller.focus();
  }

  @action async clickOutsideDropdown(event: InputEvent) {
    const isClosedByToggleButton = this.dropdownButton?.contains(
      event.target as Node,
    );

    if (!isClosedByToggleButton) {
      await this.closeDropdown();
    }
  }

  get verticaAlignmentStyles() {
    return verticalAlignOptions.map((option) => ({
      value: option,
      label: this.intl.t(
        `ember-rdfa-editor.table.vertical-align-options.${option}`,
      ),
      icon: icons[option],
    }));
  }

  get controller() {
    return this.args.controller;
  }

  @action
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  get canSetVerticalAlign() {
    return !!this.controller?.checkCommand(
      setCellAttr('verticalAlign', 'someRandomValue'),
    );
  }

  get currentVerticalAlign(): null | VerticalAlignment {
    if (this.controller) {
      if (!this.canSetVerticalAlign) {
        return DEFAULT_ALIGN;
      }

      const state = this.controller.mainEditorState;

      try {
        const $cell = selectionCell(state);
        const verticalAlign = $cell.nodeAfter?.attrs['verticalAlign'] as
          | VerticalAlignment
          | undefined;
        return verticalAlign || DEFAULT_ALIGN;
      } catch {
        return DEFAULT_ALIGN;
      }
    }

    return null;
  }

  @action
  verticalAlignActive(align: VerticalAlignment) {
    return this.currentVerticalAlign === align;
  }

  get currentVerticalAlignIcon() {
    return icons[this.currentVerticalAlign ?? DEFAULT_ALIGN];
  }

  @action
  async setVerticalAlign(align?: VerticalAlignment) {
    if (align) {
      this.controller.doCommand(setCellAttr('verticalAlign', align));
    } else {
      this.controller.doCommand(setCellAttr('verticalAlign', null));
    }

    await this.closeDropdown();
  }
}
