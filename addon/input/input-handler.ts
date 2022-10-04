import { handleUndo } from '@lblod/ember-rdfa-editor/input/history';
import {
  handleInsertLineBreak,
  handleInsertListItem,
  handleInsertText,
} from '@lblod/ember-rdfa-editor/input/insert';
import { mapKeyEvent } from '@lblod/ember-rdfa-editor/input/keymap';
import SelectionReader from '@lblod/ember-rdfa-editor/core/model/readers/selection-reader';
import {
  getWindowSelection,
  isContentEditable,
} from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import Controller from '../core/controllers/controller';
import { NotImplementedError } from '../utils/errors';
import { createLogger, Logger } from '../utils/logging-utils';
import handleCutCopy from './cut-copy';
import { handleDelete } from './delete';
import handlePaste from './paste';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import { viewToModel } from '@lblod/ember-rdfa-editor/core/view';
import Transaction from '@lblod/ember-rdfa-editor/core/state/transaction';
import {
  HtmlReaderContext,
  readHtml,
} from '@lblod/ember-rdfa-editor/core/model/readers/html-reader';
import { flatMap } from 'iter-tools';

/**
 * Represents an object which collects all the various dom-events
 * that are needed to respond to user input
 * */
export interface InputHandler {
  keydown(event: KeyboardEvent): void;

  dragstart(event: DragEvent): void;

  /**
   * Handles the (relatively) new "beforeinput" events as specified here:
   * https://www.w3.org/TR/input-events-1/#events-inputevents
   * There are fired _before_ the browser handles a user input and describe what the
   * browser is planning to do in a much more descriptive way than handling bare keyboardevents
   *
   * Using these to capture input is always preferred if possible
   * */
  beforeInput(event: InputEvent): void;

  afterInput(event: InputEvent): void;

  /**
   * Corresponds to the "selectionstart" event
   * */
  beforeSelectionChange(event: Event): void;

  afterSelectionChange(event: Event): void;

  pause(): void;

  resume(): void;

  tearDown(): void;
}

export class EditorInputHandler implements InputHandler {
  private readonly inputController: Controller;
  private logger: Logger = createLogger('InputHandler');
  private observer: MutationObserver;
  private readonly observerConfig: MutationObserverInit;
  private rootHandlers: Map<string, EventListenerOrEventListenerObject>;

  constructor(controller: Controller) {
    this.inputController = controller;
    this.observer = new MutationObserver(this.handleMutation);
    this.observerConfig = {
      characterData: true,
      subtree: true,
      childList: true,
    };
    this.observer.observe(this.domRoot, this.observerConfig);
    this.rootHandlers = new Map<string, EventListenerOrEventListenerObject>([
      ['beforeinput', this.beforeInput],
      // ['input', this.afterInput],
      ['paste', this.paste],
      ['cut', this.cut],
      ['copy', this.copy],
      ['dragstart', this.dragstart],
      ['keydown', this.keydown],
    ]);
    this.rootHandlers.forEach((handler, event) =>
      this.domRoot.addEventListener(event, handler)
    );

    document.addEventListener('selectionchange', this.afterSelectionChange);
  }

  get domRoot() {
    return this.inputController.view.domRoot;
  }

  pause = (): void => {
    const records = this.observer.takeRecords();
    this.handleMutation(records, this.observer);

    this.observer.disconnect();
    document.removeEventListener('selectionchange', this.afterSelectionChange);
    this.logger('paused');
  };

  resume = (): void => {
    document.addEventListener('selectionchange', this.afterSelectionChange);
    this.observer.observe(this.domRoot, this.observerConfig);
    this.logger('resumed');
  };

  keydown = (event: KeyboardEvent) => {
    mapKeyEvent(this.inputController, event);
  };

  dragstart = (event: DragEvent) => {
    event.preventDefault();
  };

  paste = (event: ClipboardEvent) => {
    event.preventDefault();
    const pasteBehaviour = this.inputController.getConfig('pasteBehaviour');
    handlePaste(
      this.inputController,
      event,
      pasteBehaviour === 'standard-html' || pasteBehaviour === 'full-html',
      pasteBehaviour === 'full-html'
    );
  };

  cut = (event: ClipboardEvent) => {
    event.preventDefault();
    handleCutCopy(this.inputController, event, true);
  };

  copy = (event: ClipboardEvent) => {
    event.preventDefault();
    handleCutCopy(this.inputController, event, false);
  };

  afterInput = (event: InputEvent): void => {
    const logger = createLogger('afterInput');
    logger(JSON.stringify(event));
    logger(event);
    logger(event.target);
    logger(event.getTargetRanges());
  };

  beforeInput = (event: InputEvent): void => {
    // check manipulation by plugins
    for (const plugin of this.inputController.currentState.plugins) {
      if (plugin.handleEvent) {
        const { handled } = plugin.handleEvent(event);
        if (handled) {
          return;
        }
      }
    }
    this.logger('Handling beforeInput event', event);
    switch (event.inputType) {
      case 'insertText':
        handleInsertText(this.inputController, event);
        break;
      case 'insertReplacementText':
        handleInsertText(this.inputController, event);
        break;
      case 'insertLineBreak':
        handleInsertLineBreak(this.inputController, event);
        break;
      case 'insertParagraph':
        handleInsertLineBreak(this.inputController, event);
        break;
      case 'insertOrderedList':
        handleInsertListItem(this.inputController, event, 'ol');
        break;
      case 'insertUnorderedList':
        handleInsertListItem(this.inputController, event, 'ul');
        break;
      case 'insertHorizontalRule':
        break;
      case 'insertCompositionText':
        break;
      case 'insertFromPaste':
        break;
      case 'deleteWordBackward':
        handleDelete(this.inputController, event, -1);
        break;
      case 'deleteWordForward':
        handleDelete(this.inputController, event, 1);
        break;
      case 'deleteSoftLineBackward':
        break;
      case 'deleteSoftLineForward':
        event.preventDefault();
        break;
      case 'deleteEntireSoftLine':
        break;
      case 'deleteHardLineBackward':
        break;
      case 'deleteHardLineForward':
        event.preventDefault();
        break;
      case 'deleteContent':
        event.preventDefault();
        break;
      case 'deleteContentBackward':
        handleDelete(this.inputController, event, -1);
        break;
      case 'deleteContentForward':
        handleDelete(this.inputController, event, 1);
        break;
      case 'historyUndo':
        handleUndo(this.inputController, event);
        break;
      case 'historyRedo':
        event.preventDefault();
        break;

      default:
        console.warn('Unhandled beforeinput event type:', event.inputType);
        break;
    }
  };

  beforeSelectionChange = (event: Event): void => {
    throw new NotImplementedError(`did not handle ${event.type}`);
  };

  afterSelectionChange = (): void => {
    this.logger('Handling selectionChanged');
    const currentSelection = getWindowSelection();
    const viewRoot = this.domRoot;
    if (
      !viewRoot.contains(currentSelection.anchorNode) ||
      !viewRoot.contains(currentSelection.focusNode) ||
      (currentSelection.type != 'Caret' &&
        viewRoot === currentSelection.anchorNode &&
        currentSelection.anchorOffset === currentSelection.focusOffset)
    ) {
      this.logger('Selection was not inside editor');
      return;
    }
    const selectionReader = new SelectionReader();
    const newSelection = selectionReader.read(
      this.inputController.currentState,
      this.domRoot,
      currentSelection
    );
    if (!this.inputController.currentState.selection.sameAs(newSelection)) {
      const tr = this.inputController.createTransaction();
      tr.setSelection(newSelection);
      this.inputController.dispatchTransaction(tr);
    }
  };

  handleMutation = (
    mutations: MutationRecord[],
    _observer: MutationObserver
  ) => {
    mutations = mutations.filter((mutation) =>
      isContentEditable(mutation.target)
    );
    if (!mutations.length) {
      return;
    }
    const tr = this.inputController.currentState.createTransaction();
    for (const mutation of mutations) {
      this.logger(mutation);
      switch (mutation.type) {
        case 'characterData': {
          const oldNode = viewToModel(
            tr.workingCopy,
            this.domRoot,
            mutation.target
          );
          tr.insertText({
            range: ModelRange.fromInNode(oldNode),
            text: mutation.target.textContent ?? '',
          });

          break;
        }
        case 'attributes': {
          break;
        }
        case 'childList': {
          this.replaceChildren(tr, mutation.target);
          break;
        }
      }
    }
    // if (finalRange) {
    //   finalRange.collapse();
    //   tr.selectRange(finalRange);
    // }
    tr.setSelectionFromView(this.inputController.view);
    this.inputController.view.stateOnlyDispatch(tr);
  };

  private replaceChildren(tr: Transaction, node: Node) {
    const newNodes = flatMap(
      (child: Node) =>
        readHtml(
          child,
          new HtmlReaderContext({
            marksRegistry: tr.workingCopy.marksRegistry,
            inlineComponentsRegistry: tr.workingCopy.inlineComponentsRegistry,
          })
        ),
      node.childNodes
    );
    const oldModelNode = viewToModel(tr.workingCopy, this.domRoot, node);
    return tr.insertNodes(ModelRange.fromInNode(oldModelNode), ...newNodes);
  }

  tearDown() {
    this.rootHandlers.forEach((handler, event) =>
      this.domRoot.removeEventListener(event, handler)
    );
    document.removeEventListener('selectionchange', this.afterSelectionChange);
    this.observer.disconnect();
  }
}
