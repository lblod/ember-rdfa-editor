import {
  importSync,
  dependencySatisfies,
  macroCondition,
} from '@embroider/macros';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import RdfaDocument from '@lblod/ember-rdfa-editor/utils/rdfa/rdfa-document';
import type * as BasicSetup from '@codemirror/basic-setup';
import type { Extension } from '@codemirror/state';
import type { LanguageSupport } from '@codemirror/language';
export type Newable<T> = {
  new (...args: unknown[]): T;
  create(...args: unknown[]): T;
};
if (
  macroCondition(
    dependencySatisfies('xml-formatter', '*') &&
      dependencySatisfies('@codemirror/basic-setup', '*') &&
      dependencySatisfies('@codemirror/lang-xml', '*') &&
      dependencySatisfies('@codemirror/lang-html', '*')
  )
) {
  // eslint-disable-next-line no-var
  var xmlFormat = importSync('xml-formatter') as (a: string) => string;
  // eslint-disable-next-line no-var
  var { EditorState, EditorView, basicSetup } = importSync(
    '@codemirror/basic-setup'
  ) as {
    basicSetup: Extension;
    EditorState: Newable<BasicSetup.EditorState>;
    EditorView: Newable<BasicSetup.EditorView>;
  };
  // eslint-disable-next-line no-var
  // var { xml } = importSync('@codemirror/lang-xml') as {
  //   xml: () => LanguageSupport;
  // };
  // eslint-disable-next-line no-var
  var { html } = importSync('@codemirror/lang-html') as {
    html: () => LanguageSupport;
  };
} else {
  throw new Error(
    `You can not use the rdfa-editor-with-debug component without installing: xml-formatter, @codemirror/basic-setup, @codemirror/lang-xml and @codemirror/lang-html`
  );
}

import sampleData from '../../config/sample-data';

interface FeaturesService {
  disable: (feature: string) => void;
  enable: (feature: string) => void;
}

interface RdfaEditorDebugArgs {
  rdfaEditorInit: (rdfaDocument: RdfaDocument) => void;
}

export default class RdfaRdfaEditorWithDebug extends Component<RdfaEditorDebugArgs> {
  @tracked rdfaEditor?: RdfaDocument;
  @tracked debug: unknown;
  @tracked xmlDebuggerOpen = false;
  @tracked debuggerContent = '';
  @service features!: FeaturesService;
  @tracked htmlDebuggerOpen = false;
  @tracked sampleData = sampleData;
  @tracked exportContent = '';
  private unloadListener?: () => void;
  private xmlEditor?: BasicSetup.EditorView;
  private htmlEditor?: BasicSetup.EditorView;

  @action
  setup() {
    this.unloadListener = () => {
      this.saveEditorContentToLocalStorage();
    };
    window.addEventListener('beforeunload', this.unloadListener);
  }

  @action
  teardown() {
    if (this.unloadListener) {
      window.removeEventListener('beforeunload', this.unloadListener);
    }
  }

  @action
  initDebug(info: unknown) {
    this.debug = info;
  }

  // @action
  // setupXmlEditor(element: HTMLElement) {
  //   this.xmlEditor = new EditorView({
  //     state: EditorState.create({
  //       extensions: [basicSetup, xml()],
  //     }),
  //     parent: element,
  //   });
  //   this.xmlEditor.dispatch({
  //     changes: { from: 0, insert: this.debuggerContent },
  //   });
  // }

  @action
  setupHtmlEditor(element: HTMLElement) {
    this.htmlEditor = new EditorView({
      state: EditorState.create({
        extensions: [basicSetup, html()],
      }),
      parent: element,
    });
    this.htmlEditor.dispatch({
      changes: { from: 0, insert: this.debuggerContent },
    });
  }

  get formattedXmlContent() {
    if (this.debuggerContent) {
      try {
        return xmlFormat(this.debuggerContent);
      } catch (e) {
        return this.debuggerContent;
      }
    }
    return this.debuggerContent;
  }

  @action
  rdfaEditorInitFromArg(rdfaEditor: RdfaDocument) {
    this.args.rdfaEditorInit(rdfaEditor);
    this.rdfaEditor = rdfaEditor;
  }

  @action
  setDebuggerContent(content: string) {
    this.debuggerContent = content;
  }

  @action
  setEditorContent(type: 'xml' | 'html', content: string) {
    if (this.rdfaEditor) {
      if (type === 'html') {
        this.rdfaEditor.setHtmlContent(content);
        this.saveEditorContentToLocalStorage();
      } else {
        this.rdfaEditor.xmlContent = content;
        this.saveEditorContentToLocalStorage();
      }
    }
  }

  @action openContentDebugger(type: 'xml' | 'html') {
    if (this.rdfaEditor) {
      if (type === 'xml') {
        this.debuggerContent = this.rdfaEditor.xmlContentPrettified;
        this.xmlDebuggerOpen = true;
      } else {
        this.debuggerContent = this.rdfaEditor.htmlContent;
        this.htmlDebuggerOpen = true;
      }
    }
  }

  @action closeContentDebugger(type: 'xml' | 'html', save: boolean) {
    if (type === 'xml') {
      this.debuggerContent = this.xmlEditor!.state.sliceDoc();
      this.xmlDebuggerOpen = false;
    } else {
      this.debuggerContent = this.htmlEditor!.state.sliceDoc();
      this.htmlDebuggerOpen = false;
    }
    if (save) {
      const content = this.debuggerContent;
      if (!content) {
        //xml parser doesn't accept an empty string
        this.setEditorContent('html', '');
      } else {
        this.setEditorContent(type, content);
      }
    }
  }

  @action
  setPasteBehaviour(event: InputEvent) {
    const val = (event.target as HTMLSelectElement).value;
    if (val === 'textonly') {
      this.features.disable('editor-extended-html-paste');
      this.features.disable('editor-html-paste');
    } else if (val === 'limited') {
      this.features.disable('editor-extended-html-paste');
      this.features.enable('editor-html-paste');
    } else if (val === 'full') {
      this.features.enable('editor-extended-html-paste');
      this.features.enable('editor-html-paste');
    }
  }

  @action
  showExportPreview() {
    const wnd = window.open('about:blank', '', '_blank');
    if (wnd) {
      wnd.document.write(this.rdfaEditor?.htmlContent || '');
    }
  }

  saveEditorContentToLocalStorage() {
    if (this.rdfaEditor) {
      localStorage.setItem('EDITOR_CONTENT', this.rdfaEditor.htmlContent);
    }
  }
}
