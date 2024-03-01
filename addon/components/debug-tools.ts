import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { basicSetup } from 'codemirror';
import { html } from '@codemirror/lang-html';
import sampleData from '../config/sample-data';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import { modifier } from 'ember-modifier';
import CodeMirrorModifier from '../modifiers/_private/code-mirror';
import beautify from 'js-beautify';

interface DebugToolArgs {
  controller?: SayController;
}

export default class RdfaEditorDebugTools extends Component<DebugToolArgs> {
  CodeMirror = CodeMirrorModifier;

  @tracked debuggerContent = '';
  @tracked htmlDebuggerOpen = false;
  @tracked sampleData = sampleData;
  codemirrorExtensions = [basicSetup, html()];

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

  get formattedDebuggerContent() {
    return beautify.html(this.debuggerContent, {
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

  @action
  setDebuggerContent(content: string) {
    this.debuggerContent = content;
  }

  @action
  setEditorContent(content: string) {
    if (this.controller) {
      this.controller.initialize(content);
      this.saveEditorContentToLocalStorage();
    }
  }

  @action openContentDebugger() {
    if (this.controller) {
      this.debuggerContent = this.controller.htmlContent;
      this.htmlDebuggerOpen = true;
    }
  }

  @action closeContentDebugger(save: boolean) {
    this.htmlDebuggerOpen = false;

    if (save) {
      this.setEditorContent(this.debuggerContent);

      // const content = this.debuggerContent;
      // if (!content) {
      //   //xml parser doesn't accept an empty string
      // }
    }
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
