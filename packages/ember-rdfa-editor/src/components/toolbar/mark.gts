import { action } from '@ember/object';
import Component from '@glimmer/component';
import type { MarkType } from 'prosemirror-model';
import type { ComponentLike } from '@glint/template';
import { toggleMark } from '#root/commands/index.ts';
import SayController from '#root/core/say-controller.ts';
import { not } from 'ember-truth-helpers';
import { on } from '@ember/modifier';
import ToolbarButton from './button.gts';

type Signature = {
  Args: {
    controller?: SayController;
    mark: string;
    icon: ComponentLike<{ Element: Element }>;
    title: string;
    onActivate?: () => void;
  };
};

export default class ToolbarMark extends Component<Signature> {
  get controller() {
    return this.args.controller;
  }

  get mark(): MarkType | undefined {
    if (
      !this.controller ||
      !this.controller.activeEditorState.schema.marks[this.args.mark]
    ) {
      console.error(
        `Can't find mark '${this.args.mark}', did you add it to your schema?`,
      );
      return;
    }
    return this.controller.activeEditorState.schema.marks[this.args.mark];
  }

  get isActive() {
    return (
      this.controller && this.mark && this.controller.isMarkActive(this.mark)
    );
  }

  get canToggle() {
    return (
      this.controller &&
      this.mark &&
      this.controller.checkCommand(
        toggleMark(this.mark, null, { removeWhenPresent: false }),
      )
    );
  }

  @action
  toggle() {
    if (this.controller && this.mark) {
      this.controller.focus();
      this.controller.doCommand(
        toggleMark(this.mark, null, { removeWhenPresent: false }),
      );
      this.args.onActivate?.();
    }
  }

  <template>
    {{#if @controller}}
      <ToolbarButton
        @controller={{@controller}}
        @active={{this.isActive}}
        @title={{@title}}
        @icon={{@icon}}
        @disabled={{not this.canToggle}}
        {{on "click" this.toggle}}
      />
    {{/if}}
  </template>
}
