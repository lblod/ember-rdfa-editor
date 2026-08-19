import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { HtmlIcon } from '@appuniversum/ember-appuniversum/components/icons/html';
import type SayController from '#root/core/say-controller.ts';
import ToolbarButton from '#root/components/toolbar/button.gts';
import HTMLEditorModal from './modal.gts';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';

type Args = {
  controller: SayController;
  onActivate?: () => void;
};

export default class HTMLEditorMenu extends Component<Args> {
  HtmlIcon = HtmlIcon;

  @tracked htmlEditorOpen = false;

  get controller() {
    return this.args.controller;
  }

  @action openEditor() {
    this.htmlEditorOpen = true;
  }

  @action onSave(content: string) {
    this.htmlEditorOpen = false;
    this.controller.setHtmlContent(content);
  }

  @action onCancel() {
    this.htmlEditorOpen = false;
  }
  <template>
    <ToolbarButton
      {{on "click" this.openEditor}}
      @icon={{this.HtmlIcon}}
      class="au-u-margin-left-tiny au-u-margin-right-tiny"
      @title={{t "ember-rdfa-editor.html-editor.toolbar-button.label"}}
    />
    {{#if this.htmlEditorOpen}}
      <HTMLEditorModal
        @content={{this.controller.htmlContent}}
        @onSave={{this.onSave}}
        @onCancel={{this.onCancel}}
      />
    {{/if}}
  </template>
}
