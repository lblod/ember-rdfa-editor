import { Editor } from '@lblod/ember-rdfa-editor/core/editor';
import Transaction from '@lblod/ember-rdfa-editor/core/transaction';
import { handleInsertLineBreak } from '@lblod/ember-rdfa-editor/input/insert-line-break';
import { handleInsertText } from '@lblod/ember-rdfa-editor/input/insert-text';
import SelectionReader from '@lblod/ember-rdfa-editor/model/readers/selection-reader';
import { getWindowSelection } from '@lblod/ember-rdfa-editor/utils/dom-helpers';

export interface InputHandler {
  afterInput(event: InputEvent): void;

  beforeInput(event: InputEvent): void;
}

export class EditorInputHandler implements InputHandler {
  private editor: Editor;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  afterInput(event: InputEvent): void {}

  beforeInput(event: InputEvent): void {
    console.log('handling beforeInput');
    switch (event.inputType) {
      case 'insertText':
        handleInsertText(this.editor, event);
        break;
      case 'insertLineBreak':
        handleInsertLineBreak(this.editor, event);
        break;
      case 'deleteWordBackward':
        break;
      case 'deleteWordForward':
        break;
      default:
        break;
    }
  }

  beforeSelectionChange(event: Event): void {}

  afterSelectionChange(event: Event): void {
    console.log('handling selectionChanged');
    const currentSelection = getWindowSelection();
    const viewRoot = this.editor.view.domRoot;
    if (
      !viewRoot.contains(currentSelection.anchorNode) ||
      !viewRoot.contains(currentSelection.focusNode) ||
      (currentSelection.type != 'Caret' &&
        viewRoot === currentSelection.anchorNode &&
        currentSelection.anchorOffset === currentSelection.focusOffset)
    ) {
      return;
    }
    const selectionReader = new SelectionReader();
    const newSelection = selectionReader.read(
      this.editor.state.document,
      currentSelection
    );
    const tr = new Transaction(this.editor.state);
    tr.setSelection(newSelection);

    updateState(this.editor, tr);
  }
}

function updateState(editor: Editor, transaction: Transaction) {
  const finalTransaction = runTransactionByPlugins(transaction);
  const newState = finalTransaction.apply();
  editor.state = newState;
  if (finalTransaction.needsToWrite) {
    editor.view.update(newState);
  }
}

function runTransactionByPlugins(transaction: Transaction): Transaction {
  // TODO
  return transaction;
}
