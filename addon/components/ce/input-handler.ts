import Editor from '@lblod/ember-rdfa-editor/core/editor';
import State from '@lblod/ember-rdfa-editor/core/state';
import Transaction, {
  identity,
  insertText,
} from '@lblod/ember-rdfa-editor/core/transaction';

export interface EventWithState<E extends Event> {
  event: E;
  state: State;
}

export interface InputHandler {
  afterInput(event: InputEvent): void;

  beforeInput(event: InputEvent): void;
}

export class EditorInputHandler implements InputHandler {
  private editor: Editor;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  afterInput(event: InputEvent) {}

  beforeInput(event: InputEvent) {
    const eventWithState = { event, state: this.editor.state };
    let transaction;
    switch (event.inputType) {
      case 'insertText':
        transaction = insertText(eventWithState);
        break;
      case 'insertLineBreak':
        transaction = identity(this.editor.state);
        break;
      case 'deleteWordBackward':
        transaction = identity(this.editor.state);
        break;
      case 'deleteWordForward':
        transaction = identity(this.editor.state);
        break;
      default:
        transaction = identity(this.editor.state);
        break;
    }
    updateState(this.editor, transaction);
  }

  beforeSelectionChange(event: Event) {}

  afterSelectionChange(event: Event) {}
}

function updateState(editor: Editor, transaction: Transaction) {
  const finalTransaction = runTransactionByPlugins(transaction);
  const newState = finalTransaction.apply();
  editor.state = newState;
  if (finalTransaction.needsToWrite) {
    writeToDom(editor.domRoot, newState);
  }
}

function writeToDom(domRoot: Element, state: State): void {}

function runTransactionByPlugins(transaction: Transaction): Transaction {
  // TODO
  return transaction;
}
