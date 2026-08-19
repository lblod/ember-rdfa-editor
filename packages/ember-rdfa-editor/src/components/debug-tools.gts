import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import sampleData from '../config/sample-data.ts';
import SayController from '#root/core/say-controller.ts';
import { modifier } from 'ember-modifier';
import { generatePageForExport } from '#root/utils/export-utils.ts';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import HTMLEditorModal from './plugins/html-editor/modal.gts';

interface DebugToolArgs {
  controller?: SayController;
}

export default class RdfaEditorDebugTools extends Component<DebugToolArgs> {
  @tracked htmlDebuggerOpen = false;
  @tracked sampleData = sampleData;

  get controller() {
    return this.args.controller;
  }
  get htmlContent() {
    return this.controller?.htmlContent ?? '';
  }

  setUpListeners = modifier(() => {
    const unloadListener = () => {
      this.saveEditorContentToLocalStorage();
    };
    window.addEventListener('beforeunload', unloadListener);
    return () => {
      window.removeEventListener('beforeunload', unloadListener);
    };
  });

  @action
  setEditorContent(content: string) {
    if (this.controller) {
      this.controller.setHtmlContent(content);
      this.saveEditorContentToLocalStorage();
    }
  }

  @action openContentDebugger() {
    if (this.controller) {
      this.htmlDebuggerOpen = true;
    }
  }

  @action onSave(content: string) {
    this.htmlDebuggerOpen = false;
    this.setEditorContent(content);
  }

  @action onCancel() {
    this.htmlDebuggerOpen = false;
  }

  @action
  showExportPreview(isStyled: boolean, filterForPublish: boolean) {
    const wnd = window.open('about:blank', '', '_blank');
    if (this.controller && wnd) {
      wnd.document.write(
        generatePageForExport(this.controller, isStyled, filterForPublish),
      );
    }
  }

  saveEditorContentToLocalStorage() {
    console.log('save editor content to local storage!!!');
    if (this.controller) {
      localStorage.setItem('EDITOR_CONTENT', this.controller.htmlContent);
    }
  }
  <template>
    <div {{this.setUpListeners}}>
      <button
        type="button"
        {{on "click" (fn this.showExportPreview true false)}}
      >
        Show Styled Export
      </button>
      <button
        type="button"
        {{on "click" (fn this.showExportPreview false false)}}
      >
        Show Raw Export
      </button>
      <button
        type="button"
        {{on "click" (fn this.showExportPreview true true)}}
      >
        Show Export For Publish
      </button>
      {{#if @controller}}
        <span>Sample data:
          <button
            type="button"
            {{on "click" (fn this.setEditorContent "")}}
          >Empty</button>
          |
          <button
            type="button"
            {{on "click" this.openContentDebugger}}
          >CustomHTML</button>
          |
          {{#each-in this.sampleData as |name data|}}
            <button
              type="button"
              {{on "click" (fn this.setEditorContent data)}}
            >{{name}}</button>
            |
          {{/each-in}}
        </span>
      {{else}}
        Waiting for editor init
      {{/if}}
    </div>
    {{#if this.htmlDebuggerOpen}}
      <HTMLEditorModal
        @content={{this.htmlContent}}
        @onSave={{this.onSave}}
        @onCancel={{this.onCancel}}
      />
    {{/if}}
  </template>
}
