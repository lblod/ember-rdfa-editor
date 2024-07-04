import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor';
import {
  ALIGNMENT_OPTIONS,
  type AlignmentOption,
  DEFAULT_ALIGNMENT,
} from '@lblod/ember-rdfa-editor/plugins/alignment';
import { setAlignment } from '@lblod/ember-rdfa-editor/plugins/alignment/commands';
import IntlService from 'ember-intl/services/intl';
import { dependencySatisfies, macroCondition } from '@embroider/macros';
import { importSync } from '@embroider/macros';
import { Velcro } from 'ember-velcro';
import { htmlSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';
import { action } from '@ember/object';
import { paintCycleHappened } from '@lblod/ember-rdfa-editor/utils/_private/editor-utils';
const NavDownIcon = macroCondition(
  dependencySatisfies('@appuniversum/ember-appuniversum', '>=3.4.1'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync('@appuniversum/ember-appuniversum/components/icons/nav-down')
      .NavDownIcon
  : 'nav-down';

const CheckIcon = macroCondition(
  dependencySatisfies('@appuniversum/ember-appuniversum', '>=3.4.1'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync('@appuniversum/ember-appuniversum/components/icons/check')
      .CheckIcon
  : 'check';
type Args = {
  controller?: SayController;
};

const icons: Record<AlignmentOption, string> = {
  left: `<svg class="local-icon" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" role="img">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M1.33333 2.71594H13.3333V4.04928H1.33333V2.71594ZM1.33333 5.38261H10.6667V6.71594H1.33333V5.38261ZM14.6667 8.04928H1.33333V9.38261H14.6667V8.04928ZM1.33333 10.7159H10.6667V12.0493H1.33333V10.7159ZM13.3333 13.3826H1.33333V14.7159H13.3333V13.3826Z" fill="currentColor"/>
        </svg>`,
  right: `<svg class="local-icon" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M2.66666 2.60394H14.6667V3.93728H2.66666V2.60394ZM5.33333 5.27061H14.6667V6.60394H5.33333V5.27061ZM14.6667 7.93728H1.33333V9.27061H14.6667V7.93728ZM5.33333 10.6039H14.6667V11.9373H5.33333V10.6039ZM14.6667 13.2706H2.66666V14.6039H14.6667V13.2706Z" fill="currentColor"/>
          </svg>`,
  center: `<svg class="local-icon" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M1.99999 2H14V3.33333H1.99999V2ZM3.33333 4.66667H12.6667V6H3.33333V4.66667ZM14.6667 7.33333H1.33333V8.66667H14.6667V7.33333ZM3.33333 10H12.6667V11.3333H3.33333V10ZM14 12.6667H1.99999V14H14V12.6667Z" fill="currentColor"/>
          </svg>`,
  justify: `<svg class="local-icon" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M1.33333 2.88794H14.6667V4.22127H1.33333V2.88794ZM1.33333 5.55461H14.6667V6.88794H1.33333V5.55461ZM14.6667 8.22127H1.33333V9.55461H14.6667V8.22127ZM1.33333 10.8879H14.6667V12.2213H1.33333V10.8879ZM10.6667 13.5546H1.33333V14.8879H10.6667V13.5546Z" fill="currentColor"/>
          </svg>`,
};

export default class AlignmentMenu extends Component<Args> {
  NavDownIcon = NavDownIcon;
  CheckIcon = CheckIcon;
  dropdownButton?: HTMLElement;
  Velcro = Velcro;
  htmlSafe = htmlSafe;

  setupDropdownButton = modifier(
    (element: HTMLElement) => {
      this.dropdownButton = element;
    },
    { eager: false },
  );
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
        | AlignmentOption
        | undefined;
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

  setAlignment = (option: AlignmentOption) => {
    this.controller?.doCommand(setAlignment({ option }));
    this.closeDropdown();
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
  @action async clickOutsideDropdown(event: InputEvent) {
    const isClosedByToggleButton = this.dropdownButton?.contains(
      event.target as Node,
    );

    if (!isClosedByToggleButton) {
      await this.closeDropdown();
    }
  }

  @action
  alignActive(align: AlignmentOption) {
    return this.currentAlignment === align;
  }
}
