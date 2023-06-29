import { SayStore } from '@lblod/ember-rdfa-editor/utils/_private/datastore/say-store';
import Owner from '@ember/owner';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';
import { datastoreKey } from '@lblod/ember-rdfa-editor/plugins/datastore';
import { rangeHasMarkEverywhere } from '@lblod/ember-rdfa-editor/commands/toggle-mark-add-first';
import SayView from '@lblod/ember-rdfa-editor/core/say-view';
import SayEditor from '@lblod/ember-rdfa-editor/core/say-editor';
import { tracked } from '@glimmer/tracking';
import {
  DOMParser as ProseParser,
  DOMSerializer,
  MarkType,
  Schema,
} from 'prosemirror-model';
import { Command, EditorState, Transaction } from 'prosemirror-state';
import { SetDocAttributeStep } from '@lblod/ember-rdfa-editor/utils/_private/steps';

export default class SayController {
  @tracked
  private readonly editor: SayEditor;

  constructor(pm: SayEditor) {
    this.editor = pm;
  }

  get externalContextStore(): SayStore {
    return unwrap(datastoreKey.getState(this.editor.mainView.state))
      .contextStore;
  }

  clone() {
    return new SayController(this.editor);
  }

  focus() {
    this.editor.activeView.focus();
  }

  setActiveView(view: SayView) {
    this.editor.setActiveView(view);
  }

  setHtmlContent(content: string, options: { shouldFocus?: boolean } = {}) {
    const { shouldFocus = true } = options;

    const domParser = new DOMParser();
    const parsedBody = domParser.parseFromString(content, 'text/html').body;
    const documentConfig = {
      lang: parsedBody.firstElementChild?.getAttribute('lang') ?? undefined,
    };
    const doc = ProseParser.fromSchema(this.schema).parse(parsedBody, {
      preserveWhitespace: true,
      topNode: this.schema.nodes.doc.create(documentConfig),
    });
    this.editor.mainView.updateState(
      EditorState.create({ doc, plugins: this.mainEditorState.plugins })
    );
    if (shouldFocus) {
      this.focus();
    }
  }

  doCommand(command: Command, { view = this.activeEditorView } = {}): boolean {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    return command(view.state, view.dispatch, view);
  }

  checkCommand(
    command: Command,
    { view = this.activeEditorView } = {}
  ): boolean {
    return command(view.state);
  }

  isMarkActive(markType: MarkType) {
    const state = this.activeEditorState;
    const { from, $from, to, empty } = state.selection;
    if (empty) {
      return !!markType.isInSet(state.storedMarks || $from.marks());
    } else {
      return rangeHasMarkEverywhere(state.doc, from, to, markType);
    }
  }

  withTransaction(
    callback: (tr: Transaction) => Transaction | null,
    { view = this.activeEditorView } = {}
  ) {
    const tr = view.state.tr;
    const result = callback(tr);
    if (result) {
      view.dispatch(result);
    }
  }

  get datastore(): SayStore {
    return unwrap(datastoreKey.getState(this.mainEditorState)).datastore();
  }

  get schema(): Schema {
    return this.mainEditorState.schema;
  }

  get owner(): Owner {
    return this.editor.owner;
  }

  get documentLanguage() {
    return this.mainEditorState.doc.attrs.lang as string;
  }

  set documentLanguage(language: string) {
    this.withTransaction((tr) => {
      return tr.step(new SetDocAttributeStep('lang', language));
    });
  }

  toggleRdfaBlocks() {
    console.log('TOGGLE');
    this.editor.showRdfaBlocks = !this.editor.showRdfaBlocks;
  }

  get showRdfaBlocks() {
    return this.editor.showRdfaBlocks;
  }

  get mainEditorView() {
    return this.editor.mainView;
  }

  get activeEditorView() {
    return this.editor.activeView;
  }

  get mainEditorState() {
    return this.editor.mainView.state;
  }

  get activeEditorState() {
    return this.editor.activeView.state;
  }

  get htmlContent(): string {
    const div = document.createElement('div');
    const doc = DOMSerializer.fromSchema(this.schema).serializeNode(
      this.mainEditorState.doc,
      undefined
    );
    div.appendChild(doc);
    return div.innerHTML;
  }

  get inEmbeddedView(): boolean {
    return !!this.activeEditorView.parent;
  }
}
