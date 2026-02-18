import type Owner from '@ember/owner';
import { tracked } from '@glimmer/tracking';
import { type Attrs, MarkType, Schema } from 'prosemirror-model';
import {
  type Command,
  EditorState,
  Selection,
  Transaction,
} from 'prosemirror-state';
import { getHistoryStateId } from 'prosemirror-history';
import { SayStore } from '#root/utils/_private/datastore/say-store.ts';
import { unwrap } from '#root/utils/_private/option.ts';
import { shallowEqual } from '#root/utils/_private/object-utils.ts';
import { datastoreKey } from '#root/plugins/datastore/index.ts';
import { selectionHasMarkEverywhere } from '#root/utils/_private/mark-utils.ts';
import SayView, { type SetHtmlOptions } from '#root/core/say-view.ts';
import type SayEditor from '#root/core/say-editor.ts';
import { htmlToDoc } from '#root/utils/_private/html-utils.ts';

const ALREADY_SAVED = 'ALREADY_SAVED';

export default class SayController {
  @tracked
  private readonly editor: SayEditor;
  @tracked
  private savedStateId?: string;

  constructor(pm: SayEditor) {
    this.editor = pm;
  }

  get externalContextStore(): SayStore {
    return unwrap(datastoreKey.getState(this.editor.mainView.state))
      .contextStore;
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

  get domParser() {
    return this.mainEditorView.domParser;
  }

  get editable() {
    return this.mainEditorView.editable;
  }

  setEditable(editable: boolean) {
    this.mainEditorView.setProps({
      editable: () => {
        return editable;
      },
    });
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

  /** Is the editor in the same state as the last time it was marked as clean */
  get isDirty(): boolean {
    if (!this.savedStateId) return true;
    const stateId = getHistoryStateId(this.mainEditorState);
    if (this.savedStateId === ALREADY_SAVED) {
      // If we start in a saved state, then 'no history', i.e. undefined id, means we're not dirty
      return !!stateId;
    } else {
      return this.savedStateId !== stateId;
    }
  }
  /** Mark the history state at which the document will be considered 'clean' */
  markClean() {
    this.savedStateId = getHistoryStateId(this.mainEditorState);
  }

  /**
   * Replaces the state (and current document) with a parsed version of the provided `html` string.
   * This method creates a new `doc` node and parses it correctly based on the provided html.
   * Note: plugin state is not preserved when using this method (e.g. the history-plugin state is reset).
   */
  initialize(
    html: string,
    {
      shouldFocus = true,
      doNotClean = false,
      startsDirty = false,
    }: Exclude<SetHtmlOptions, 'range'> = {},
  ) {
    if (!startsDirty) {
      this.savedStateId = ALREADY_SAVED;
    }
    const doc = htmlToDoc(html, {
      schema: this.schema,
      editorView: this.editor.mainView,
      parser: this.editor.parser,
      doNotClean,
    });

    this.editor.mainView.updateState(
      EditorState.create({
        doc,
        plugins: this.mainEditorState.plugins,
        selection: Selection.atEnd(doc),
      }),
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
  setHtmlContent(content: string, options: SetHtmlOptions = {}) {
    this.mainEditorView.setHtmlContent(content, options);
  }

  doCommand(command: Command, { view = this.activeEditorView } = {}): boolean {
    return command(view.state, view.dispatch, view);
  }

  checkCommand(
    command: Command,
    { view = this.activeEditorView } = {},
  ): boolean {
    return command(view.state);
  }

  isMarkActive(markType: MarkType, attrs?: Attrs) {
    const state = this.activeEditorState;
    const { $from, empty } = state.selection;
    if (empty) {
      const mark = markType.isInSet(state.storedMarks || $from.marks());
      return !!mark && (!attrs || shallowEqual(attrs, mark.attrs));
    } else {
      return selectionHasMarkEverywhere(
        state.doc,
        state.selection,
        markType,
        attrs,
      );
    }
  }

  withTransaction(
    callback: (tr: Transaction, state: EditorState) => Transaction | null,
    { view = this.activeEditorView } = {},
  ) {
    const tr = view.state.tr;
    const result = callback(tr, view.state);
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
    return this.getDocumentAttribute('lang');
  }

  set documentLanguage(language: string) {
    this.setDocumentAttribute('lang', language);
  }

  setDocumentAttribute(key: string, value: unknown) {
    this.withTransaction((tr) => {
      return tr.setDocAttribute(key, value);
    });
  }

  getDocumentAttribute<TAttribute = string>(attribute: string) {
    return this.mainEditorState.doc.attrs[attribute] as TAttribute;
  }
}
