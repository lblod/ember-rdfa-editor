import { Editor } from '@lblod/ember-rdfa-editor/core/editor';
import Transaction from '@lblod/ember-rdfa-editor/core/transaction';
import { handleBasicStyle } from '@lblod/ember-rdfa-editor/input/format';
import { handleUndo } from '@lblod/ember-rdfa-editor/input/history';
import {
  handleInsertLineBreak,
  handleInsertListItem,
  handleInsertText,
} from '@lblod/ember-rdfa-editor/input/insert';
import { mapKeyEvent } from '@lblod/ember-rdfa-editor/input/keymap';
import SelectionReader from '@lblod/ember-rdfa-editor/model/readers/selection-reader';
import { getWindowSelection } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import handleCutCopy from './cut-copy';
import handlePaste from './paste';

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
}

export class EditorInputHandler implements InputHandler {
  private editor: Editor;

  constructor(editor: Editor) {
    this.editor = editor;
  }
  keydown(event: KeyboardEvent) {
    mapKeyEvent(this.editor, event);
  }
  dragstart(event: DragEvent) {
    event.preventDefault();
  }

  //TODO: pass pasteHTML arguments
  paste(event: ClipboardEvent) {
    event.preventDefault();
    handlePaste(this.editor, event);
  }

  cut(event: ClipboardEvent) {
    event.preventDefault();
    handleCutCopy(this.editor, event, true);
  }

  copy(event: ClipboardEvent) {
    event.preventDefault();
    handleCutCopy(this.editor, event, false);
  }

  afterInput(event: InputEvent): void {}

  beforeInput(event: InputEvent): void {
    console.log('handling beforeInput with type', event.inputType);
    switch (event.inputType) {
      case 'insertText':
        handleInsertText(this.editor, event);
        break;
      case 'insertReplacementText':
        handleInsertText(this.editor, event);
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
    this.editor.dispatchTransaction(tr, false);
  }
}
