import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import sampleData from '../config/sample-data';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import { modifier } from 'ember-modifier';

interface DebugToolArgs {
  controller?: SayController;
}

export default class RdfaEditorDebugTools extends Component<DebugToolArgs> {
  @tracked htmlDebuggerOpen = false;
  @tracked sampleData = sampleData;

  get controller() {
    return this.args.controller;
  }

  setUpListeners = modifier(
    () => {
      const unloadListener = () => {
        this.saveEditorContentToLocalStorage();
      };
      window.addEventListener('beforeunload', unloadListener);
      return () => {
        window.removeEventListener('beforeunload', unloadListener);
      };
    },
    { eager: false },
  );

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
  showExportPreview() {
    const wnd = window.open('about:blank', '', '_blank');

    if (wnd) {
      const parser = new DOMParser();
      const basicDocument = parser.parseFromString(
        '<html><head></head><body class="say-content"></body></html>',
        'text/html',
      );

      const styleSheets = Array.from(document.styleSheets);

      styleSheets.forEach((styleSheet) => {
        if (styleSheet.href) {
          const linkElement = basicDocument.createElement('link');

          linkElement.rel = 'stylesheet';
          linkElement.href = styleSheet.href;
          linkElement.type = 'text/css';

          basicDocument.head.appendChild(linkElement);
        }
      });

      const contentDocument = parser.parseFromString(
        this.controller?.htmlContent || '',
        'text/html',
      );

      if (contentDocument.body.firstChild) {
        basicDocument.body.appendChild(contentDocument.body.firstChild);
      }

      wnd.document.write(
        '<!DOCTYPE html>' + basicDocument.documentElement.outerHTML,
      );
    }
  }

  saveEditorContentToLocalStorage() {
    if (this.controller) {
      localStorage.setItem('EDITOR_CONTENT', this.controller.htmlContent);
    }
  }
}
