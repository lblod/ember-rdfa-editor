import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type { SayController } from '@lblod/ember-rdfa-editor';
import { HtmlIcon } from '@appuniversum/ember-appuniversum/components/icons/html';

type Args = {
  controller: SayController;
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
