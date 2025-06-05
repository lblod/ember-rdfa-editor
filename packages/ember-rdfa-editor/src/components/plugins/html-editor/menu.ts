import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { HtmlIcon } from '@appuniversum/ember-appuniversum/components/icons/html';
import type SayController from '#root/core/say-controller.ts';

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
}
