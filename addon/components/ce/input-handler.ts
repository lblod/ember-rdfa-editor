import { Editor } from '@lblod/ember-rdfa-editor/core/editor';
import Transaction from '@lblod/ember-rdfa-editor/core/transaction';
import { handleBasicStyle } from '@lblod/ember-rdfa-editor/input/format';
import { handleUndo } from '@lblod/ember-rdfa-editor/input/history';
import {
  handleInsertLineBreak,
  handleInsertListItem,
  handleInsertText,
} from '@lblod/ember-rdfa-editor/input/insert';
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
    console.log('handling beforeInput with type', event.inputType);
    switch (event.inputType) {
      case 'insertText':
        handleInsertText(this.editor, event);
        break;
      case 'insertReplacementText':
        break;
      case 'insertLineBreak':
        handleInsertLineBreak(this.editor, event);
        break;
      case 'insertParagraph':
        handleInsertLineBreak(this.editor, event);
        break;
      case 'insertOrderedList':
        handleInsertListItem(this.editor, event, 'ol');
        break;
      case 'insertUnorderedList':
        handleInsertListItem(this.editor, event, 'ul');
        break;
      case 'insertHorizontalRule':
        break;
      case 'insertCompositionText':
        break;
      case 'insertFromPaste':
        break;
      case 'deleteWordBackward':
        break;
      case 'deleteWordForward':
        break;
      case 'deleteSoftLineBackward':
        break;
      case 'deleteSoftLineForward':
        break;
      case 'deleteEntireSoftLine':
        break;
      case 'deleteHardLineBackward':
        break;
      case 'deleteHardLineForward':
        break;
      case 'deleteContent':
        break;
      case 'deleteContentBackward':
        break;
      case 'deleteContentForward':
        break;
      case 'historyUndo':
        handleUndo(this.editor, event);
        break;
      case 'historyRedo':
        break;
      case 'formatBold':
        handleBasicStyle(this.editor, event, 'bold');
        break;
      case 'formatItalic':
        handleBasicStyle(this.editor, event, 'italic');
        break;
      case 'formatUnderline':
        handleBasicStyle(this.editor, event, 'underline');
        break;
      case 'formatStrikeThrough':
        handleBasicStyle(this.editor, event, 'strikethrough');
        break;

      default:
        console.warn('Unhandled beforeinput event type:', event.inputType);
        break;
    }
  }

  beforeSelectionChange(event: Event): void {}

  afterSelectionChange(): void {
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
      this.editor.state,
      this.editor.view.domRoot,
      currentSelection
    );
    const tr = new Transaction(this.editor.state);
    tr.setSelection(newSelection);
    tr.needsToWrite = false;

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
