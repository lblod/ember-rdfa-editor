import { render } from '@ember/test-helpers';
import Command from '@lblod/ember-rdfa-editor/commands/command';
import State, {
  defaultCommands,
  SayState,
  StateArgs,
} from '@lblod/ember-rdfa-editor/core/state';
import Transaction from '@lblod/ember-rdfa-editor/core/transaction';
import MarksRegistry from '@lblod/ember-rdfa-editor/model/marks-registry';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import hbs from 'htmlbars-inline-precompile';

/**
 * Utility to get the editor element in a type-safe way
 * This avoids having to nullcheck everywhere where a null editor would be an error anyway.
 * @returns the editor element
 */
export function getEditorElement(): Element {
  const editor = document.querySelector('div[contenteditable]');
  if (!editor) throw new Error('Editor element not found in dom');
  return editor;
}

/**
 * Promise which waits for ms milliseconds
 * @param ms number of milliseconds to wait
 * @returns A Promise which waits for ms milliseconds
 */
export function delayMs(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Setup and render the editor
 * @returns A promise which renders the editor
 */
export async function renderEditor() {
  await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
  return getEditorElement();
}
type OptionalStateArgs = Omit<Partial<StateArgs>, 'document'> & {
  document: ModelNode;
};
export function testState({
  document = new ModelElement('div'),
  commands = defaultCommands(),
  marksRegistry = new MarksRegistry(),
  plugins = [],
  selection = new ModelSelection(),
}: OptionalStateArgs): State {
  if (!ModelNode.isModelElement(document)) {
    throw new TypeError('Cannot set non-element as document root');
  }
  return new SayState({
    document,
    commands,
    marksRegistry,
    plugins,
    selection,
  });
}
export function testDispatch(transaction: Transaction): State {
  return transaction.apply();
}
export interface CommandResult<R> {
  resultValue: R;
  resultState: State;
}
export function makeTestExecute<A, R>(command: Command<A, R>) {
  let resultState: State;
  function dispatch(transaction: Transaction): State {
    resultState = transaction.apply();
    return resultState;
  }
  return function (state: State, args: A): CommandResult<R> {
    const resultValue = command.execute(
      {
        dispatch,
        state,
      },
      args
    );
    return { resultValue, resultState };
  };
}
export function stateWithRange(root: ModelNode, range: ModelRange) {
  let initialState = testState({ document: root });
  const tr = initialState.createTransaction();
  tr.selectRange(range);
  initialState = tr.apply();
  return initialState;
}
