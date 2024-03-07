import Component from '@glimmer/component';
import { localCopy } from 'tracked-toolbox';
import beautify from 'js-beautify';
import { action } from '@ember/object';
import { basicSetup } from 'codemirror';
import { html } from '@codemirror/lang-html';
import CodeMirrorModifier from '@lblod/ember-rdfa-editor/modifiers/_private/code-mirror';
import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';

type Args = {
  content: string;
  onSave: (content: string) => void;
  onCancel: () => void;
};

export default class HTMLEditorModal extends Component<Args> {
  CodeMirror = CodeMirrorModifier;

  @localCopy('args.content') declare content: string;

  get formattedContent() {
    return beautify.html(this.content, {
      content_unformatted: [
        'p',
        'span',
        'a',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
      ],
    });
  }

  get cmExtensions() {
    return [basicSetup, keymap.of([indentWithTab]), html()];
  }

  @action setContent(content: string) {
    this.content = content;
  }

  @action cancel() {
    this.content = this.args.content;
    this.args.onCancel();
  }

  @action save() {
    this.args.onSave(this.content);
  }
}
