import State from '@lblod/ember-rdfa-editor/core/state';
import SelectionWriter from '@lblod/ember-rdfa-editor/model/writers/selection-writer';
import ModelNode from '../model/model-node';
import ModelPosition from '../model/model-position';
import computeDifference, { Difference } from '../model/util/tree-differ';
import HtmlWriter from '../model/writers/html-writer';
import {
  domPosToModelPos,
  isTextNode,
  modelPosToDomPos,
} from '../utils/dom-helpers';
import { PositionError } from '../utils/errors';
import { createLogger, Logger } from '../utils/logging-utils';
import Transaction from './transaction';
import {
  EditorInputHandler,
  InputHandler,
} from '@lblod/ember-rdfa-editor/input/input-handler';
import { ViewController } from '@lblod/ember-rdfa-editor/model/controller';

export type Dispatch = (transaction: Transaction) => void;

export interface ViewArgs {
  domRoot: Element;
  initialState: State;
  dispatch?: Dispatch;
}

/**
 * This interface controls the interaction with the html DOM
 * It doesn't hold state of its own (well, or very little), but simply manages
 * updating the representation of any state that it gets on the dom.
 * */
export interface View {
  /**
   * The html element that the editor will render in
   * */
  domRoot: Element;

  /**
   * The modelstate represented by the current html document
   * */
  currentState: State;

  /**
   * Get the domNode that corresponds to the given modelNode
   * State is needed because active configuration may influence the result
   * */
  modelToView(state: State, modelNode: ModelNode): Node | null;

  /**
   * Get the modelnode that corresponds tot the given domNode
   * State is needed because active configuration may influence the result
   * */
  viewToModel(state: State, domNode: Node): ModelNode;

  /**
   * Update the DOM to represent the given state
   * */
  update(state: State, differences: Difference[]): void;

  /**
   * Manually dispatch a transaction
   * @param transaction
   */
  dispatch(transaction: Transaction): void;

  stateOnlyDispatch(transaction: Transaction): void;

  /**
   * Cleanup any handlers or other global state
   */
  tearDown(): void;
}

/**
 * Default implementation of the view interface
 * */
export class EditorView implements View {
  domRoot: Element;
  logger: Logger;
  currentState: State;
  dispatch: Dispatch;
  inputHandler: InputHandler;

  constructor({ domRoot, dispatch, initialState }: ViewArgs) {
    this.logger = createLogger('editorView');
    this.domRoot = domRoot;
    this.currentState = initialState;
    this.dispatch = dispatch ?? this.defaultDispatch;
    this.inputHandler = new EditorInputHandler(
      new ViewController('input', this)
    );
  }

  modelToView(state: State, modelNode: ModelNode): Node | null {
    return modelToView(state, this.domRoot, modelNode);
  }

  viewToModel(state: State, domNode: Node): ModelNode {
    return viewToModel(state, this.domRoot, domNode);
  }

  /**
   * Only update the state, without calculating diff with the dom
   * For internal use.
   * @param transaction
   */
  stateOnlyDispatch(transaction: Transaction) {
    this.doDispatch(transaction, false);
  }

  defaultDispatch = (transaction: Transaction) => {
    this.doDispatch(transaction, true);
  };

  private doDispatch(transaction: Transaction, calculateDiffs = true) {
    // notify listeners while there are new operations added to the transaction
    let newSteps = transaction.size > 0;
    const handledSteps = new Array<number>(
      transaction.workingCopy.transactionListeners.length
    ).fill(0);
    // keep track if any listeners added any steps at all
    let listenersAddedSteps = false;
    while (newSteps) {
      newSteps = false;
      transaction.workingCopy.transactionListeners.forEach((listener, i) => {
        const oldTransactionSize = transaction.size;
        if (handledSteps[i] < transaction.size) {
          // notify listener of new operations
          listener(transaction, transaction.steps.slice(handledSteps[i]));
          handledSteps[i] = transaction.size;
        }
        if (transaction.size > oldTransactionSize) {
          newSteps = true;
          listenersAddedSteps = true;
        }
      });
    }
    const newState = transaction.apply();
    const differences =
      // we can only optimize for browserdefault flow if
      // no listeners added any steps
      calculateDiffs || listenersAddedSteps
        ? computeDifference(this.currentState.document, newState.document)
        : [];
    this.currentState = newState;
    this.update(this.currentState, differences);
  }

  update(state: State, differences: Difference[]): void {
    this.logger('Updating view with state:', state);
    this.logger('With differences:', differences);
    this.inputHandler.pause();
    const writer = new HtmlWriter();
    let writeCounts = 0;
    differences.forEach((difference) => {
      writer.write(
        state,
        this,
        difference.node,
        difference.changes || new Set()
      );
      writeCounts++;
    });
    this.logger(`Wrote ${writeCounts} times`);
    state.inlineComponentsRegistry.clean();
    const selectionWriter = new SelectionWriter();
    selectionWriter.write(state, this.domRoot, state.selection);
    this.inputHandler.resume();
  }

  tearDown() {
    this.inputHandler.tearDown();
  }
}

export function modelToView(
  state: State,
  viewRoot: Element,
  modelNode: ModelNode
): Node {
  const modelPosition = ModelPosition.fromBeforeNode(modelNode);
  const domPosition = modelPosToDomPos(state, viewRoot, modelPosition, false);
  if (
    typeof domPosition.offset === 'number' &&
    !isTextNode(domPosition.container)
  ) {
    return domPosition.container.childNodes[domPosition.offset];
  } else {
    return domPosition.container;
  }
}

export function viewToModel(
  state: State,
  viewRoot: Element,
  domNode: Node
): ModelNode {
  if (domNode === viewRoot) {
    return state.document;
  }
  const position = domPosToModelPos(state, viewRoot, domNode, 0);
  const node = position.nodeAfter();
  if (!node) {
    throw new PositionError('no node found after position');
  }
  return node;
}

export function createView({
  domRoot,
  dispatch,
  initialState,
}: ViewArgs): View {
  const result = new EditorView({ domRoot, dispatch, initialState });
  return result;
}
