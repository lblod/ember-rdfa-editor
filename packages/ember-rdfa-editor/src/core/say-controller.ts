import { SayStore } from '@lblod/ember-rdfa-editor/utils/_private/datastore/say-store.ts';
import type Owner from '@ember/owner';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option.ts';
import { shallowEqual } from '@lblod/ember-rdfa-editor/utils/_private/object-utils.ts';
import { datastoreKey } from '@lblod/ember-rdfa-editor/plugins/datastore/index.ts';
import { selectionHasMarkEverywhere } from '@lblod/ember-rdfa-editor/utils/_private/mark-utils.ts';
import SayView, {
  type SetHtmlOptions,
} from '@lblod/ember-rdfa-editor/core/say-view.ts';
import type SayEditor from '@lblod/ember-rdfa-editor/core/say-editor.ts';
import { tracked } from '@glimmer/tracking';
import { type Attrs, MarkType, Schema } from 'prosemirror-model';
import {
  type Command,
  EditorState,
  Selection,
  Transaction,
} from 'prosemirror-state';
import { htmlToDoc } from '@lblod/ember-rdfa-editor/utils/_private/html-utils.ts';

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
  initialize(
    html: string,
    {
      shouldFocus = true,
      doNotClean = false,
    }: Exclude<SetHtmlOptions, 'range'> = {},
  ) {
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
    // eslint-disable-next-line @typescript-eslint/unbound-method
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
