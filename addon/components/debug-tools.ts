import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import sampleData from '../config/sample-data';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import { modifier } from 'ember-modifier';
import { generatePageForExport } from '@lblod/ember-rdfa-editor/utils/export-utils';

interface DebugToolArgs {
  controller?: SayController;
}

export default class RdfaEditorDebugTools extends Component<DebugToolArgs> {
  @tracked htmlDebuggerOpen = false;
  @tracked sampleData = sampleData;

  get controller() {
    return this.args.controller;
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
}
