import { EditorState, type Extension } from '@codemirror/state';
import { registerDestructor } from '@ember/destroyable';
import type Owner from '@ember/owner';
import ArrayUtils from '#root/utils/_private/array-utils';
import { unwrap } from '#root/utils/_private/option';
import { EditorView, basicSetup } from 'codemirror';
import { type ArgsFor, type NamedArgs } from 'ember-modifier';
import Modifier from 'ember-modifier';

export type CodeMirrorSignature = {
  Element: HTMLElement;
  Args: {
    Positional: [];
    Named: {
      content: string;
      extensions?: Extension[];
      onUpdate?: (content: string) => void;
    };
  };
};

function cleanup(instance: CodeMirrorModifier) {
  instance.view?.destroy();
}

const DEFAULT_EXTENSIONS = [basicSetup];

export default class CodeMirrorModifier extends Modifier<CodeMirrorSignature> {
  rootElement?: HTMLElement;
  view?: EditorView;
  extensions?: Extension[];
  onUpdate?: (content: string) => void;

  isUpdating = false;

  constructor(owner: Owner, args: ArgsFor<CodeMirrorSignature>) {
    super(owner, args);
    registerDestructor(this, cleanup);
  }

  createEditorState({
    extensions = DEFAULT_EXTENSIONS,
    content = '',
    onUpdate,
  }: NamedArgs<CodeMirrorSignature>) {
    if (onUpdate) {
      extensions = [
        ...extensions,
        EditorView.updateListener.of((update) => {
          if (!this.isUpdating) {
            onUpdate(update.state.sliceDoc());
          }
        }),
      ];
    }
    const state = EditorState.create({
      doc: content,
      extensions,
    });
    return state;
  }

  initializeEditor(
    element: HTMLElement,
    {
      extensions = DEFAULT_EXTENSIONS,
      content = '',
      onUpdate,
    }: NamedArgs<CodeMirrorSignature>,
  ) {
    this.rootElement = element;
    this.extensions = extensions;
    this.onUpdate = onUpdate;
    const state = this.createEditorState({ extensions, content, onUpdate });
    this.view = new EditorView({
      state,
      parent: element,
    });
  }

  updateEditor({
    content = '',
    extensions = DEFAULT_EXTENSIONS,
    onUpdate,
  }: NamedArgs<CodeMirrorSignature>) {
    if (this.view) {
      this.isUpdating = true;
      if (
        !ArrayUtils.deepEqual(extensions, unwrap(this.extensions)) ||
        onUpdate !== this.onUpdate
      ) {
        // Extensions or onUpdate method have changed: create a new codemirror state
        this.extensions = extensions;
        this.onUpdate = onUpdate;
        const state = this.createEditorState({ content, extensions, onUpdate });
        this.view.setState(state);
      } else if (content !== this.view.state.sliceDoc()) {
        // Only the content has changed, just update the state
        this.view.dispatch({
          changes: {
            from: 0,
            to: this.view.state.doc.length,
            insert: content,
          },
        });
      }
      this.isUpdating = false;
    }
  }

  modify(
    element: HTMLElement,
    _positional: [],
    options: NamedArgs<CodeMirrorSignature>,
  ): void {
    if (!this.rootElement) {
      this.initializeEditor(element, options);
    } else {
      this.updateEditor(options);
    }
  }
}
