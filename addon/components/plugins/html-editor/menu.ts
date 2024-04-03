import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type { SayController } from '@lblod/ember-rdfa-editor';
import { dependencySatisfies, macroCondition } from '@embroider/macros';
import { importSync } from '@embroider/macros';
const HtmlIcon = macroCondition(
  dependencySatisfies('@appuniversum/ember-appuniversum', '>=3.4.1'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync('@appuniversum/ember-appuniversum/components/icons/html')
      .HtmlIcon
  : 'html';

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
