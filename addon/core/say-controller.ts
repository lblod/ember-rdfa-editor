import { SayStore } from '@lblod/ember-rdfa-editor/utils/_private/datastore/say-store';
import Owner from '@ember/owner';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';
import { datastoreKey } from '@lblod/ember-rdfa-editor/plugins/datastore';
import { rangeHasMarkEverywhere } from '@lblod/ember-rdfa-editor/commands/toggle-mark-add-first';
import SayView from '@lblod/ember-rdfa-editor/core/say-view';
import SayEditor from '@lblod/ember-rdfa-editor/core/say-editor';
import { tracked } from '@glimmer/tracking';
import { MarkType, Schema } from 'prosemirror-model';
import {
  Command,
  EditorState,
  Selection,
  Transaction,
} from 'prosemirror-state';
import { SetDocAttributeStep } from '@lblod/ember-rdfa-editor/utils/_private/steps';
import { htmlToDoc } from '@lblod/ember-rdfa-editor/utils/_private/html-utils';

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

  /**
   * Replaces the state (and current document) with a parsed version of the provided `html` string.
   * This method creates a new `doc` node and parses it correctly based on the provided html.
   * Note: plugin state is not preserved when using this method (e.g. the history-plugin state is reset).
   */
  initialize(html: string, { shouldFocus = true } = {}) {
    const doc = htmlToDoc(html, { schema: this.schema });

    this.editor.mainView.updateState(
      EditorState.create({
        doc,
        plugins: this.mainEditorState.plugins,
        selection: Selection.atEnd(doc),
      })
    );

    if (shouldFocus) {
      this.focus();
    }
  }

  /**
   * setHtmlContent replaces the content of the current document with the provided html
   * Note: it does not create a new `doc` node and does not update the `doc` node based on the provided html
   * (e.g. `lang` attributes on the `doc` node are not parsed)
   */
  setHtmlContent(content: string, options: { shouldFocus?: boolean } = {}) {
    const { shouldFocus = true } = options;
    if (shouldFocus) {
      this.focus();
    }
    const doc = htmlToDoc(content, { schema: this.schema });
    const tr = this.mainEditorState.tr;
    tr.replaceWith(0, tr.doc.nodeSize - 2, doc);
    tr.setSelection(Selection.atEnd(tr.doc));
    this.editor.mainView.dispatch(tr);
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
    return this.editor.htmlContent;
  }

  get inEmbeddedView(): boolean {
    return !!this.activeEditorView.parent;
  }
}
