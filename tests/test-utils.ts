import { render } from '@ember/test-helpers';
import Command from '@lblod/ember-rdfa-editor/commands/command';
import State, {
  defaultCommands,
  SayState,
  StateArgs,
} from '@lblod/ember-rdfa-editor/core/state';
import Transaction from '@lblod/ember-rdfa-editor/core/state/transaction';
import { EditorView } from '@lblod/ember-rdfa-editor/core/view';
import {
  InternalWidgetSpec,
  WidgetLocation,
} from '@lblod/ember-rdfa-editor/core/controllers/controller';
import InlineComponentsRegistry from '@lblod/ember-rdfa-editor/core/model/inline-components/inline-components-registry';
import MarksRegistry from '@lblod/ember-rdfa-editor/core/model/marks/marks-registry';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import ModelSelection from '@lblod/ember-rdfa-editor/core/model/model-selection';
import { EditorStore } from '@lblod/ember-rdfa-editor/utils/datastore/datastore';
import { Difference } from '@lblod/ember-rdfa-editor/utils/tree-differ';
import EventBus from '@lblod/ember-rdfa-editor/utils/event-bus';
import hbs from 'htmlbars-inline-precompile';
import MarksManager from '@lblod/ember-rdfa-editor/core/model/marks/marks-manager';

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
  await render(hbs`
      <Rdfa::RdfaEditor
              @rdfaEditorInit={{this.rdfaEditorInit}}
              @profile="default"
              class="rdfa-playground"
              @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true"
                                    showRdfaHighlight="true" showRdfaHover="true"}}
              @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
      />`);
  return getEditorElement();
}

type OptionalStateArgs = Omit<Partial<StateArgs>, 'document'> & {
  document?: ModelNode;
};

function createModelRoot(): ModelElement {
  const el = new ModelElement('div');
  el.setAttribute('contenteditable', '');
  el.setAttribute('class', 'say-editor_inner say_content');
  return el;
}

export function testView() {
  const root = document.createElement('div');
  return new EditorView({ domRoot: root, initialState: testState({}) });
}

export function testState({
  document = createModelRoot(),
  commands = defaultCommands(),
  marksRegistry = new MarksRegistry(),
  marksManager = new MarksManager(),
  inlineComponentsRegistry = new InlineComponentsRegistry(),
  plugins = [],
  selection = new ModelSelection(),
}: OptionalStateArgs = {}): State {
  if (!ModelNode.isModelElement(document)) {
    throw new TypeError('Cannot set non-element as document root');
  }
  const baseIRI = 'http://example.org';
  return new SayState({
    document,
    transactionStepListeners: new Set(),
    commands,
    marksRegistry,
    marksManager,
    inlineComponentsRegistry,
    plugins,
    selection,
    baseIRI,
    transactionDispatchListeners: new Set(),
    config: new Map(),
    datastore: EditorStore.fromParse({ baseIRI, modelRoot: document }),
    eventBus: new EventBus(),
    pathFromDomRoot: [],
    widgetMap: new Map<WidgetLocation, InternalWidgetSpec[]>(),
  });
}

export function stateFromDom(root: Element, stateArgs: OptionalStateArgs = {}) {
  const state = testState(stateArgs);
  const tr = state.createTransaction();
  const view = new EditorView({ domRoot: root, initialState: state });
  tr.readFromView(view);
  return tr.apply();
}

export function testDispatch(transaction: Transaction): State {
  return transaction.apply();
}

export interface CommandResult<R> {
  resultValue: R;
  resultState: State;
}

export function makeTestExecute<A, R>(command: Command<A, R>) {
  return function (state: State, args: A): CommandResult<R> {
    let resultState: State | null = null;
    const transaction = state.createTransaction();
    const resultValue = command.execute(
      {
        transaction,
      },
      args
    );
    resultState = transaction.apply();
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

export function vdomToDom(vdom: ModelNode): Node {
  const state = testState({ document: vdom });
  const view = testView();

  const differences: Difference[] = [
    { node: state.document, changes: new Set(['content']) },
  ];
  view.update(state, differences);
  return view.domRoot;
}
