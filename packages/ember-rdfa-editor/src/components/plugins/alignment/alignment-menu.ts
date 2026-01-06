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
