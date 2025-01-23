import Component from '@glimmer/component';
import { trackedReset } from 'tracked-toolbox';
import beautify from 'js-beautify';
import { action } from '@ember/object';
import { basicSetup } from 'codemirror';
import { html } from '@codemirror/lang-html';
import CodeMirrorModifier from '#root/modifiers/_private/code-mirror';
import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';

type Args = {
  content: string;
  onSave: (content: string) => void;
  onCancel: () => void;
};

export default class HTMLEditorModal extends Component<Args> {
  CodeMirror = CodeMirrorModifier;

  @trackedReset<HTMLEditorModal, string>({
    memo: 'args.content',
    update(component) {
      return beautify.html(component.args.content, {
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
        indent_body_inner_html: true,
        indent_inner_html: true,
        wrap_attributes: 'force-expand-multiline',
      });
    },
  })
  declare content: string;

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
