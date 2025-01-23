import { AllSelection, EditorState, Selection } from 'prosemirror-state';
import { type DirectEditorProps, EditorView } from 'prosemirror-view';
import { tracked } from '@glimmer/tracking';
import { htmlToDoc, htmlToFragment } from '../utils/_private/html-utils';
import { DOMSerializer, ProseParser } from '..';
import { SetDocAttributesStep } from '../utils/steps';

export interface SetHtmlOptions {
  shouldFocus?: boolean;
  range?: DocumentRange;
  /**
   * Do not clean, only sanitize the input. This leaves empty elements and proprietary tags intact,
   * so is only suitable for HTML produced by the editor or otherwise known to be understood by it.
   * Defaults to false.
   */
  doNotClean?: boolean;
}
export type DocumentRange = {
  from: number;
  to: number;
};

export default class SayView extends EditorView {
  isSayView = true;
  @tracked declare state: EditorState;
  @tracked parent?: SayView;
  domParser: ProseParser;

  constructor(
    place:
      | Node
      | ((editor: HTMLElement) => void)
      | {
          mount: HTMLElement;
        }
      | null,
    props: DirectEditorProps,
    parent?: SayView,
  ) {
    super(place, props);
    this.domParser =
      props.domParser ?? ProseParser.fromSchema(this.state.schema);
    this.parent = parent;
  }

  /**
   * Replaces the state (and current document) with a parsed version of the provided `html` string.
   * This method creates a new `doc` node and parses it correctly based on the provided html.
   * Note: plugin state is not preserved when using this method (e.g. the history-plugin state is reset).
   */
  setHtmlContent(content: string, options: SetHtmlOptions = {}) {
    const { shouldFocus = true, doNotClean } = options;
    if (shouldFocus) {
      this.focus();
    }
    const { range } = options;
    const tr = this.state.tr;
    if (range) {
      const fragment = htmlToFragment(content, {
        parser: this.domParser,
        editorView: this,
        doNotClean,
      });
      tr.replaceRange(range.from, range.to, fragment);
    } else {
      const doc = htmlToDoc(content, {
        schema: this.state.schema,
        parser: this.domParser,
        editorView: this,
        doNotClean,
      });
      tr.step(new SetDocAttributesStep(doc.attrs));
      tr.replaceWith(0, tr.doc.nodeSize - 2, doc);
      tr.setSelection(Selection.atEnd(tr.doc));
    }
    this.dispatch(tr);
  }

  get htmlContent(): string {
    const serializer =
      this.props.clipboardSerializer ??
      DOMSerializer.fromSchema(this.state.schema);
    const div = document.createElement('div');
    const doc = serializer.serializeNode(this.state.doc, undefined);
    div.appendChild(doc);
    return div.innerHTML;
  }

  updateState(state: EditorState): void {
    super.updateState(state);
    const { selection } = state;
    this.dom.classList.toggle(
      'say-selection-all',
      selection instanceof AllSelection,
    );
  }
}
