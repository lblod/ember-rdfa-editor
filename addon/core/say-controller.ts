import { SayStore } from '@lblod/ember-rdfa-editor/utils/_private/datastore/say-store';
import Owner from '@ember/owner';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';
import { datastoreKey } from '@lblod/ember-rdfa-editor/plugins/datastore';
import {
  rangeHasMarkEverywhere,
  toggleMarkAddFirst,
} from '@lblod/ember-rdfa-editor/commands/toggle-mark-add-first';
import SayView from '@lblod/ember-rdfa-editor/core/say-view';
import SayEditor from '@lblod/ember-rdfa-editor/core/say-editor';
import { tracked } from '@glimmer/tracking';
import {
  DOMParser as ProseParser,
  DOMSerializer,
  MarkType,
  Schema,
} from 'prosemirror-model';
import {
  Command,
  EditorState,
  Selection,
  Transaction,
} from 'prosemirror-state';

export default class SayController {
  @tracked
  private readonly editor: SayEditor;

  constructor(pm: SayEditor) {
    this.editor = pm;
  }

  get externalContextStore(): SayStore {
    return unwrap(datastoreKey.getState(this.editor.state)).contextStore;
  }

  clone() {
    return new SayController(this.editor);
  }

  toggleMark(type: MarkType, includeEmbeddedView?: boolean): void;

  /**
   *
   * @deprecated
   */
  toggleMark(name: string, includeEmbeddedView?: boolean): void;

  /**
   *
   * @deprecated use doCommand with the {@link toggleMark} or {@link toggleMarkAddFirst} commands
   */
  toggleMark(type: string | MarkType, includeEmbeddedView = false) {
    this.focus(includeEmbeddedView);
    const markType = typeof type === 'string' ? this.schema.marks[type] : type;
    this.doCommand(toggleMarkAddFirst(markType), includeEmbeddedView);
  }

  focus(includeEmbeddedView = false) {
    this.editor.focus(includeEmbeddedView);
  }

  setEmbeddedView(view?: SayView) {
    this.editor.setEmbeddedView(view);
  }

  clearEmbeddedView() {
    this.editor.clearEmbeddedView();
  }

  setHtmlContent(content: string) {
    this.focus();
    const tr = this.editor.state.tr;
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
    this.editor.view.dispatch(tr);
  }

  doCommand(command: Command, includeEmbeddedView = false): boolean {
    const view = this.editor.getView(includeEmbeddedView);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    return command(view.state, view.dispatch, view);
  }

  checkCommand(command: Command, includeEmbeddedView = false): boolean {
    const state = this.editor.getState(includeEmbeddedView);
    return command(state);
  }

  /**
   * @deprecated This method is obsolete and will be removed in version 3.0. Use doCommand instead.
   */
  checkAndDoCommand(command: Command, includeEmbeddedView = false): boolean {
    const view = this.editor.getView(includeEmbeddedView);
    if (command(view.state)) {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      return command(view.state, view.dispatch, view);
    }
    return false;
  }

  isMarkActive(markType: MarkType, includeEmbeddedView = false) {
    const state = this.editor.getState(includeEmbeddedView);
    const { from, $from, to, empty } = state.selection;
    if (empty) {
      return !!markType.isInSet(state.storedMarks || $from.marks());
    } else {
      return rangeHasMarkEverywhere(state.doc, from, to, markType);
    }
  }

  withTransaction(
    callback: (tr: Transaction) => Transaction | null,
    includeEmbeddedView = false
  ) {
    const view = this.editor.getView(includeEmbeddedView);
    const tr = view.state.tr;
    const result = callback(tr);
    if (result) {
      view.dispatch(result);
    }
  }

  get datastore(): SayStore {
    return unwrap(datastoreKey.getState(this.editor.state)).datastore();
  }

  get schema(): Schema {
    return this.editor.state.schema;
  }

  /**
   * @deprecated This getter is deprecated and will be removed in version 3.0. Use the getState method instead.
   */
  get state(): EditorState {
    return this.editor.state;
  }

  /**
   * @deprecated This getter is deprecated and will be removed in version 3.0. Use the getView method instead.
   */
  get view(): SayView {
    return this.editor.view;
  }

  get owner(): Owner {
    return this.editor.owner;
  }

  getState(includeEmbeddedView = false) {
    return this.editor.getState(includeEmbeddedView);
  }

  getView(includeEmbeddedView = false) {
    return this.editor.getView(includeEmbeddedView);
  }

  get htmlContent(): string {
    const div = document.createElement('div');
    DOMSerializer.fromSchema(this.schema).serializeFragment(
      this.editor.state.doc.content,
      undefined,
      div
    );
    return div.innerHTML;
  }

  get inEmbeddedView(): boolean {
    return !!this.editor.embeddedView;
  }

  toggleRdfaBlocks() {
    console.log('TOGGLE');
    this.editor.showRdfaBlocks = !this.editor.showRdfaBlocks;
  }

  get showRdfaBlocks() {
    return this.editor.showRdfaBlocks;
  }
}
