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
import { Command, Selection, Transaction } from 'prosemirror-state';

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
    if (shouldFocus) {
      this.focus();
    }
    const tr = this.mainEditorState.tr;
    const domParser = new DOMParser();
    tr.replaceWith(
      0,
      tr.doc.nodeSize - 2,
      ProseParser.fromSchema(this.schema).parse(
        domParser.parseFromString(content, 'text/html'),
        {
          preserveWhitespace: true,
        }
      )
    );
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
    DOMSerializer.fromSchema(this.schema).serializeFragment(
      this.mainEditorState.doc.content,
      undefined,
      div
    );
    return div.innerHTML;
  }

  get inEmbeddedView(): boolean {
    return !!this.activeEditorView.parent;
  }
}
